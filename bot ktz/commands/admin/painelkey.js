const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('painelkey')
        .setDescription('Envia o painel oficial para geração de chaves (Keys).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Apenas Admins criam o painel
    async execute(interaction) {
        
        const embed = new EmbedBuilder()
            .setTitle('🔑 Central de Ativação KTZ')
            .setDescription(
                'Bem-vindo ao painel oficial!\n\n' +
                '🌐 **Site Oficial:** [Clique aqui para acessar](https://painelktz.onrender.com/)\n' +
                'Acesse o site acima para acompanhar suas informações de usuário.\n\n' +
                '⚠️ *Nota: Apenas usuários autorizados pela administração conseguem gerar a chave abaixo.*'
            )
            .setColor('#ffaa00')
            .setFooter({ text: 'Sistema de Licenças KTZ' })
            .setTimestamp();

        // Criando os botões (um link para o site e um para gerar a key)
        const botoes = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('Acessar Site Oficial')
                .setStyle(ButtonStyle.Link)
                .setURL('https://painelktz.onrender.com/'), // Mude para o seu site real

            new ButtonBuilder()
                .setCustomId('gerar_key_painel')
                .setLabel('Gerar minha Key')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🔑')
        );

        await interaction.channel.send({ embeds: [embed], components: [botoes] });
        await interaction.reply({ content: 'Painel de Keys enviado com sucesso!', ephemeral: true });
    },
};