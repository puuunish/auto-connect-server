const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        try {
            if (interaction.isChatInputCommand()) {
                const command = interaction.client.commands.get(interaction.commandName);

                if (!command) {
                    console.error(`[ERROR]: Nenhum comando encontrado correspondente a: ${interaction.commandName}!`);
                    return;
                }

                await command.execute(interaction);
            }

            else if (interaction.isButton()) {
                const command = interaction.client.commands.find(cmd => typeof cmd.handleButton === 'function');

                if (command) {
                    await command.handleButton(interaction);
                } else {
                    console.error('[ERROR]: Nenhum comando com handler de botão encontrado!');
                }
            }

            else if (interaction.isModalSubmit()) {
                const command = interaction.client.commands.find(cmd => typeof cmd.handleModalSubmit === 'function');

                if (command) {
                    await command.handleModalSubmit(interaction);
                } else {
                    console.error('[ERROR]: Nenhum comando com handler de modal encontrado!');
                }
            }

        } catch (error) {
            console.error(error);

            const errorMessage = {
                content: '[WARNING]: Ocorreu um erro ao executar esta interação!',
                ephemeral: true,
            };

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(errorMessage);
            } else {
                await interaction.reply(errorMessage);
            }
        }
    },
};