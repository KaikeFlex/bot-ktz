const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-setup')
        .setDescription('Envia o painel de criação de tickets com categorias de atendimento.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        
        const embed = new EmbedBuilder()
            .setTitle('🎫 Central de Atendimento KTZ')
            .setDescription(
                'Precisa falar com a nossa equipe? Selecione a categoria ideal abaixo:\n\n' +
                '📩 **Solicitar Ticket:** Dúvidas gerais ou suporte básico.\n' +
                '🖥️ **Problema com Painel:** Erros técnicos com o nosso site/sistema.\n' +
                '🔑 **Problema com a Key:** Chaves inválidas, expiradas ou falhas na ativação.\n' +
                '🛒 **Comprar Key:** Adquira novas chaves de acesso com o nosso financeiro.'
            )
            .setColor('#00ffaa')
            .setFooter({ text: 'Selecione abaixo para abrir seu suporte privado' });

        // Montando as opções da caixinha de seleção
        const menu = new StringSelectMenuBuilder()
            .setCustomId('menu_ticket')
            .setPlaceholder('Escolha o motivo do suporte...')
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Solicitar Ticket')
                    .setDescription('Dúvidas ou ajuda geral.')
                    .setValue('solicitar_ticket')
                    .setEmoji('📩'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Problema com Painel')
                    .setDescription('Bugs ou problemas no site oficial.')
                    .setValue('problema_painel')
                    .setEmoji('🖥️'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Problema com a Key')
                    .setDescription('Problemas com ativação ou chaves.')
                    .setValue('problema_key')
                    .setEmoji('🔑'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Comprar Key')
                    .setDescription('Deseja adquirir uma nova licença.')
                    .setValue('comprar_key')
                    .setEmoji('🛒')
            );

        const componenteMenu = new ActionRowBuilder().addComponents(menu);

        await interaction.channel.send({ embeds: [embed], components: [componenteMenu] });
        await interaction.reply({ content: 'Painel de ticket avançado enviado com sucesso!', ephemeral: true });
    },
};