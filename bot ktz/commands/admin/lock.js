const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('Tranca o canal de texto atual impedindo membros de digitarem.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {
        try {
            await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                SendMessages: false
            });
            await interaction.reply({ content: '🔒 **Este canal foi trancado com sucesso pela administração.**' });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Não foi possível trancá-lo. Verifique minhas permissões de gerenciamento de canais.', ephemeral: true });
        }
    },
};