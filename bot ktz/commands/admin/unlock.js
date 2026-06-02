const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Destranca o canal de texto atual permitindo que membros voltem a digitar.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {
        try {
            await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                SendMessages: null // Reseta para o padrão do cargo
            });
            await interaction.reply({ content: '🔓 **Este canal foi destrancado com sucesso.** Mensagens liberadas!' });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Não foi possível destrancá-lo. Verifique minhas permissões de gerenciamento de canais.', ephemeral: true });
        }
    },
};