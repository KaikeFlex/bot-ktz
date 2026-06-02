const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Remove o silenciamento (castigo) de um membro.')
        .addUserOption(option => option.setName('membro').setDescription('Membro a ser desmutado').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction) {
        const user = interaction.options.getUser('membro');
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) return interaction.reply({ content: 'Membro não encontrado.', ephemeral: true });
        if (!member.isCommunicationDisabled()) return interaction.reply({ content: 'Este membro não está mutado.', ephemeral: true });

        await member.timeout(null);
        await interaction.reply({ content: `🔊 **${user.tag}** foi desmutado com sucesso!` });
    },
};