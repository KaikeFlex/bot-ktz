const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Desbane um usuário pelo ID.')
        .addStringOption(option => option.setName('id').setDescription('ID do usuário para desbanir').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async execute(interaction) {
        const userId = interaction.options.getString('id');

        try {
            await interaction.guild.members.unban(userId);
            await interaction.reply({ content: `✅ Usuário com o ID \`${userId}\` foi desbanido com sucesso!` });
        } catch (error) {
            await interaction.reply({ content: 'Não foi possível desbanir este ID. Verifique se o ID está correto ou se o usuário realmente está banido.', ephemeral: true });
        }
    },
};