const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('limpar')
        .setDescription('Apaga uma quantidade específica de mensagens do canal atual.')
        .addIntegerOption(option => 
            option.setName('quantidade')
                .setDescription('Número de mensagens a apagar (de 1 a 100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages), // Apenas quem gerencia mensagens pode usar
    async execute(interaction) {
        const quantidade = interaction.options.getInteger('quantidade');

        try {
            // Deleta as mensagens do canal
            const mensagensExcluidas = await interaction.channel.bulkDelete(quantidade, true);
            
            // Avisa que limpou e se auto-deleta em 5 segundos para não poluir o chat
            await interaction.reply({ 
                content: `🗑️ **Sucesso!** Fui instruído a limpar o chat e apaguei \`${mensagensExcluidas.size}\` mensagens.` 
            });

            setTimeout(() => {
                interaction.deleteReply().catch(() => null);
            }, 5000);

        } catch (error) {
            console.error(error);
            await interaction.reply({ 
                content: '❌ Houve um erro ao tentar limpar as mensagens. Lembre-se que o Discord não permite apagar mensagens criadas há mais de 14 dias.', 
                ephemeral: true 
            });
        }
    },
};