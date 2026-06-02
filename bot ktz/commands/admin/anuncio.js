const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('anuncio')
        .setDescription('Envia um anúncio bonito em formato Embed.')
        .addStringOption(option => option.setName('titulo').setDescription('Título do anúncio').setRequired(true))
        .addStringOption(option => option.setName('mensagem').setDescription('Conteúdo do anúncio (use \n para pular linha)').setRequired(true))
        .addChannelOption(option => option.setName('canal').setDescription('Canal onde enviar (padrão é o atual)').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const titulo = interaction.options.getString('titulo');
        const mensagem = interaction.options.getString('mensagem').replace(/\\n/g, '\n');
        const canal = interaction.options.getChannel('canal') || interaction.channel;

        const embed = new EmbedBuilder()
            .setTitle(titulo)
            .setDescription(mensagem)
            .setColor('#2f3136')
            .setTimestamp()
            .setFooter({ text: `Anúncio por: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

        try {
            await canal.send({ embeds: [embed] });
            await interaction.reply({ content: `📢 Anúncio enviado com sucesso em ${canal}!`, ephemeral: true });
        } catch (error) {
            await interaction.reply({ content: 'Não consegui enviar a mensagem. Verifique se tenho permissão para falar nesse canal.', ephemeral: true });
        }
    },
};