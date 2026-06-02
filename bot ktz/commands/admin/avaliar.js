const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, UserSelectMenuBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avaliar-setup')
        .setDescription('Envia o painel oficial para avaliação de nossa equipe de Staff.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('⭐ Avalie o Nosso Atendimento')
            .setDescription(
                'Sua opinião é fundamental para mantermos a qualidade do nosso servidor!\n\n' +
                '👇 **Como funciona:**\n' +
                '1. Abra o menu de seleção abaixo.\n' +
                '2. Busque ou selecione o **Membro da Staff** que te atendeu.\n' +
                '3. Na próxima etapa, atribua uma nota de 0 a 10.'
            )
            .setColor('#7289da')
            .setFooter({ text: 'Obrigado por colaborar com a comunidade KTZ' });

        // Menu especial que lista usuários automaticamente (Substitui menus de texto fixos)
        const selectMenuStaff = new UserSelectMenuBuilder()
            .setCustomId('selecionar_staff_avaliacao')
            .setPlaceholder('Escolha o staff que realizou o atendimento...')
            .setMinValues(1)
            .setMaxValues(1);

        const row = new ActionRowBuilder().addComponents(selectMenuStaff);

        await interaction.channel.send({ embeds: [embed], components: [row] });
        await interaction.reply({ content: 'Painel de avaliações gerado com sucesso!', ephemeral: true });
    },
};