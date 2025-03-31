const path = global.deps.path;

module.exports = {
    conf: {
        name: "command_name", // Command Name
        category: path.basename(path.dirname(__filename)) // Command Category (must match settings.json)
    },

    data: new global.deps.discordjs.SlashCommandBuilder()
        .setName("command_name")
        .setDescription("Command description here.")
        // Add options as needed
        .addStringOption(option =>
            option.setName("example")
                .setDescription("An example option.")
                .setRequired(false)
        ),

    run: async (client, interaction) => {
        try {
            // Command logic here
            await interaction.reply({ content: "Command executed successfully!" });

        } catch (error) {
            console.error(`❌ Error in ${module.exports.conf.name} command:`, error);
            interaction.reply({
                content: `${global.deps.config.settings.emojis.error} An error occurred while executing this command.`,
                ephemeral: true
            });
        }
    },
};
