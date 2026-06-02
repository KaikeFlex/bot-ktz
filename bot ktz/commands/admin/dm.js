const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dm')
        .setDescription('Envia uma mensagem privada (DM) para um usuário específico do servidor.')
        .addUserOption(option => 
            option.setName('usuario')
                .setDescription('Selecione o usuário que receberá a mensagem')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('mensagem')
                .setDescription('Digite o conteúdo da mensagem que quer enviar')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Apenas administradores do bot podem disparar DMs
    async execute(interaction) {
        const usuarioTarget = interaction.options.getUser('usuario');
        const conteudoMensagem = interaction.options.getString('mensagem');

        // Evita enviar DM para bots
        if (usuarioTarget.bot) {
            return interaction.reply({ content: '❌ Você não pode enviar mensagens na DM de outros bots.', ephemeral: true });
        }

        // Deixa a resposta invisível para que ninguém no servidor veja o que você enviou na DM dele
        await interaction.deferReply({ ephemeral: true });

        // Monta um visual bonito para a mensagem chegar na DM do usuário
        const embedDM = new EmbedBuilder()
            .setTitle(`📬 Mensagem da Administração | ${interaction.guild.name}`)
            .setDescription(conteudoMensagem)
            .setColor('#ff007f')
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .setTimestamp()
            .setFooter({ text: 'Por favor, não responda este bot direto na DM.' });

        try {
            // Tenta enviar a DM
            await usuarioTarget.send({ embeds: [embedDM] });
            
            await interaction.editReply({ 
                content: `✅ A mensagem privada foi entregue com sucesso para **${usuarioTarget.tag}**!` 
            });

        } catch (error) {
            console.error(error);
            await interaction.editReply({ 
                content: `❌ Não consegui enviar a mensagem para ${usuarioTarget}. Provavelmente ele está com as mensagens diretas (DM) bloqueadas para este servidor.` 
            });
        }
    },
};