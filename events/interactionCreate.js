const { InteractionType } = global.deps.discordjs;
const client = require("../index.js");

client.on("interactionCreate", async (interaction) => {
    if (!interaction.guild || interaction.user.bot) return;

    if (interaction.type === InteractionType.ApplicationCommand) {
        const command = client.slashCommands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.run(client, interaction);
        } catch (error) {
            console.error(`❌ Error executing /${interaction.commandName}:`, error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: `${global.deps.config.settings.emojis.error} An error occurred while executing this command.`,
                    ephemeral: true
                });
            } else {
                await interaction.followUp({
                    content: `${global.deps.config.settings.emojis.error} An error occurred while executing this command.`,
                    ephemeral: true
                });
            }
        }
    }
});
