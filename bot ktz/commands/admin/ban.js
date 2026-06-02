const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bane um membro do servidor.')
        .addUserOption(option => option.setName('membro').setDescription('Membro a ser banido').setRequired(true))
        .addStringOption(option => option.setName('motivo').setDescription('Motivo do banimento').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers), // Apenas staff com perm de ban vê o comando
    async execute(interaction) {
        const user = interaction.options.getUser('membro');
        const reason = interaction.options.getString('motivo') || 'Nenhum motivo fornecido.';
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) return interaction.reply({ content: 'Membro não encontrado neste servidor.', ephemeral: true });
        if (!member.bannable) return interaction.reply({ content: 'Eu não posso banir este membro (cargo mais alto que o meu ou ele é o dono).', ephemeral: true });

        await member.ban({ reason: reason });
        await interaction.reply({ content: `🚫 **${user.tag}** foi banido com sucesso!\n**Motivo:** ${reason}` });
    },
};