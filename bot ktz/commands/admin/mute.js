const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Silencia um membro (coloca em castigo).')
        .addUserOption(option => option.setName('membro').setDescription('Membro a ser mutado').setRequired(true))
        .addIntegerOption(option => option.setName('tempo').setDescription('Tempo em minutos').setRequired(true))
        .addStringOption(option => option.setName('motivo').setDescription('Motivo do mute').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction) {
        const user = interaction.options.getUser('membro');
        const minutes = interaction.options.getInteger('tempo');
        const reason = interaction.options.getString('motivo') || 'Nenhum motivo fornecido.';
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) return interaction.reply({ content: 'Membro não encontrado.', ephemeral: true });
        if (!member.moderatable) return interaction.reply({ content: 'Eu não posso mutar este membro.', ephemeral: true });

        await member.timeout(minutes * 60 * 1000, reason);
        await interaction.reply({ content: `🔇 **${user.tag}** foi mutado por **${minutes} minutos**.\n**Motivo:** ${reason}` });
    },
};