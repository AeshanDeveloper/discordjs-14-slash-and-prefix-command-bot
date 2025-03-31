const path = global.deps.path;

module.exports = {
    conf: {
        name: "ping", // Command Name
        category: path.basename(path.dirname(__filename)) // Command Category (must match settings.json)
    },

    data: new global.deps.discordjs.SlashCommandBuilder()
        .setName("ping")
        .setDescription("Check the bot's latency."),

    run: async (client, interaction) => {
        try {
            const emojis = global.deps.config.settings.emojis;

            await interaction.reply("Pinging...");
            const reply = await interaction.fetchReply(); // Fetch reply separately (Fix warning)
            const latency = reply.createdTimestamp - interaction.createdTimestamp;

            await interaction.editReply(`${emojis.success} Pong! Latency: **${latency}ms**`);

        } catch (error) {
            console.error(`❌ Error in ${module.exports.conf.name} command:`, error);
            interaction.reply({
                content: `${global.deps.config.settings.emojis.error} An error occurred while executing this command.`,
                ephemeral: true
            });
        }
    }
};
