const { 
    Client, 
    GatewayIntentBits, 
    Collection, 
    REST, 
    Routes, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ChannelType, 
    PermissionFlagsBits,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder
} = require('discord.js');
const fs = require('fs');
const path = require('path');

// Carrega as configurações principais do config.json
const { token, clientId, idCanalLogAvaliacao } = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.commands = new Collection();
const commands = [];
const commandsPath = path.join(__dirname, 'commands');

// Armazena temporariamente quem está avaliando quem para cruzar os dados na nota final
const sessoesAvaliacao = new Map();

// --- 📂 LEITURA DE COMANDOS (Correção do erro ENOTDIR) ---
if (fs.existsSync(commandsPath)) {
    fs.readdirSync(commandsPath).forEach(dir => {
        const fullPath = path.join(commandsPath, dir);
        
        if (fs.lstatSync(fullPath).isDirectory()) {
            const commandFiles = fs.readdirSync(fullPath).filter(file => file.endsWith('.js'));
            
            for (const file of commandFiles) {
                const filePath = path.join(fullPath, file);
                const command = require(filePath);
                
                if ('data' in command && 'execute' in command) {
                    client.commands.set(command.data.name, command);
                    commands.push(command.data.toJSON());
                }
            }
        }
    });
}

// --- 🚀 REGISTRO DOS COMANDOS SLASH (/) ---
const rest = new REST({ version: '10' }).setToken(token);

client.once('ready', async () => {
    console.log(`🤖 Bot online como ${client.user.tag}!`);
    
    try {
        console.log('🔄 Atualizando comandos Slash (/) globais...');
        await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );
        console.log('✅ Comandos Slash registrados com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao registrar comandos:', error);
    }
});

// --- ⚡ EXECUÇÃO DOS COMANDOS EM CHAT ---
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'Houve um erro ao executar esse comando!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'Houve um erro ao executar esse comando!', ephemeral: true });
        }
    }
});

// --- 🎫 ETAPA 1: Captura o Staff Selecionado no Menu ---
client.on('interactionCreate', async interaction => {
    if (!interaction.isUserSelectMenu()) return;

    if (interaction.customId === 'selecionar_staff_avaliacao') {
        const staffId = interaction.values[0];

        // Evita que o usuário avalie a si mesmo
        if (staffId === interaction.user.id) {
            return interaction.reply({ content: '❌ Você não pode avaliar o seu próprio atendimento!', ephemeral: true });
        }

        // Salva na memória o ID do staff selecionado associado ao usuário que está clicando
        sessoesAvaliacao.set(interaction.user.id, staffId);

        // Cria o menu de 0 a 10 para a nota
        const menuNota = new StringSelectMenuBuilder()
            .setCustomId('selecionar_nota_avaliacao')
            .setPlaceholder('Escolha uma nota de 0 a 10...');

        for (let i = 0; i <= 10; i++) {
            menuNota.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(`Nota ${i}`)
                    .setValue(`${i}`)
                    .setEmoji(i >= 7 ? '⭐' : i >= 5 ? '😐' : '⚠️')
            );
        }

        const row = new ActionRowBuilder().addComponents(menuNota);

        await interaction.reply({
            content: `👤 Você selecionou o staff <@${staffId}>.\nAgora, selecione qual nota você atribui para ele na lista abaixo:`,
            components: [row],
            ephemeral: true
        });
    }
});

// --- 🎫 ETAPA 2: Captura a Nota e Envia para o Canal de Logs ---
client.on('interactionCreate', async interaction => {
    if (!interaction.isStringSelectMenu()) return;

    // Menu de Tickets Anterior
    if (interaction.customId === 'menu_ticket') {
        const opcaoSelecionada = interaction.values[0];
        const guild = interaction.guild;
        let prefixoCanal = 'ticket';
        let descricaoAtendimento = '';

        if (opcaoSelecionada === 'solicitar_ticket') { prefixoCanal = 'suporte'; descricaoAtendimento = 'Dúvidas gerais ou suporte padrão com a nossa equipe.'; }
        else if (opcaoSelecionada === 'problema_painel') { prefixoCanal = 'painel'; descricaoAtendimento = 'Relate aqui erros, bugs ou dificuldades com o nosso painel do site.'; }
        else if (opcaoSelecionada === 'problema_key') { prefixoCanal = 'erro-key'; descricaoAtendimento = 'Sua chave veio inválida, expirada ou deu erro ao ativar? Envie os detalhes.'; }
        else if (opcaoSelecionada === 'comprar_key') { prefixoCanal = 'comprar'; descricaoAtendimento = 'Área destinada a novos clientes interessados em adquirir licenças ou keys oficiais.'; }

        const nomeCanal = `${prefixoCanal}-${interaction.user.username}`;
        const canalExistente = guild.channels.cache.find(c => c.name === nomeCanal.toLowerCase());
        if (canalExistente) return interaction.reply({ content: `Você já tem um ticket desse tipo aberto em ${canalExistente}!`, ephemeral: true });

        await interaction.deferReply({ ephemeral: true });

        try {
            const canalTicket = await guild.channels.create({
                name: nomeCanal,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles] }
                ],
            });

            const embedTicket = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`🎫 Atendimento: ${interaction.values[0].replace('_', ' ').toUpperCase()}`)
                .setDescription(`Olá ${interaction.user}, bem-vindo ao seu canal de suporte.\n\n📌 **Assunto:** ${descricaoAtendimento}\n\nPor favor, envie prints, provas ou explique sua situação detalhadamente para adiantar o atendimento.`)
                .setTimestamp();

            const botaoFechar = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('fechar_ticket').setLabel('Fechar Ticket').setStyle(ButtonStyle.Danger));
            await canalTicket.send({ embeds: [embedTicket], components: [botaoFechar] });
            await interaction.editReply({ content: `Seu ticket foi gerado com sucesso em ${canalTicket}!`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: 'Não foi possível criar o canal de ticket. Verifique as permissões do meu cargo.', ephemeral: true });
        }
    }

    // Processamento da Nota de Avaliação da Staff
    if (interaction.customId === 'selecionar_nota_avaliacao') {
        const nota = interaction.values[0];
        const staffId = sessoesAvaliacao.get(interaction.user.id);

        if (!staffId) {
            return interaction.reply({ content: '❌ Sessão expirada ou inválida. Por favor, reinicie no painel principal.', ephemeral: true });
        }

        // Remove a sessão da memória do bot para poupar espaço
        sessoesAvaliacao.delete(interaction.user.id);

        // Busca o canal de Logs para enviar o relatório formatado
        const canalLogs = interaction.guild.channels.cache.get(idCanalLogAvaliacao);
        if (!canalLogs) {
            return interaction.reply({ content: '❌ O canal de logs de avaliação não foi configurado corretamente no bot.', ephemeral: true });
        }

        const embedLog = new EmbedBuilder()
            .setTitle('📊 Nova Avaliação de Staff Cadastrada')
            .addFields(
                { name: '👤 Staff Avaliado:', value: `<@${staffId}> (ID: ${staffId})`, inline: true },
                { name: '🙋 Enviado por:', value: `${interaction.user} (ID: ${interaction.user.id})`, inline: true },
                { name: '⭐ Nota Atribuída:', value: `**${nota} / 10**`, inline: false }
            )
            .setColor(nota >= 7 ? '#00ff00' : nota >= 5 ? '#ffaa00' : '#ff0000')
            .setTimestamp();

        try {
            await canalLogs.send({ embeds: [embedLog] });
            await interaction.update({ content: `✅ **Obrigado!** Sua nota **${nota}/10** para <@${staffId}> foi enviada anonimamente para os diretores.`, components: [], ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Houve um erro interno ao salvar sua avaliação nos canais de auditoria.', ephemeral: true });
        }
    }
});

// --- 🎫 INTERAÇÕES DE BOTÕES (Fechar Ticket & Chaves Privadas) ---
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'fechar_ticket') {
        await interaction.reply({ content: 'Este canal de suporte será deletado em 5 segundos...' });
        setTimeout(() => { interaction.channel.delete().catch(err => console.log("Erro ao deletar canal:", err)); }, 5000);
    }

    if (interaction.customId === 'generar_key_painel' || interaction.customId === 'gerar_key_painel') {
        const dbPath = path.join(__dirname, 'database', 'keys.json');
        if (!fs.existsSync(dbPath)) return interaction.reply({ content: '❌ Erro interno: O banco de dados de keys não foi encontrado pela administração.', ephemeral: true });

        const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        const usuarioCadastrado = dbData.usuarios.find(u => u.id === interaction.user.id);

        if (!usuarioCadastrado) return interaction.reply({ content: '❌ **Acesso Negado.** Seu ID não está registrado no sistema para receber uma chave.', ephemeral: true });

        const minhaKey = usuarioCadastrado.key;

        const embedKey = new EmbedBuilder()
            .setTitle('🔑 Sua Chave Foi Liberada!')
            .setDescription(`Olá ${interaction.user}, sua licença oficial foi localizada no nosso sistema com sucesso.`)
            .addFields({ name: 'Sua Key Exclusiva:', value: `\`\`\`${minhaKey}\`\`\`` })
            .setColor('#00ff00')
            .setFooter({ text: 'Sistema de Licenças KTZ' })
            .setTimestamp();

        await interaction.reply({ embeds: [embedKey], ephemeral: true });
    }
});

client.login(token);