const path = global.deps.path;
module.exports = {
    conf: {
        name: "listservers",
        aliases: ["servers", "guilds"],
        category: path.basename(path.dirname(__filename))
    },

    run: async (client, message, args) => {
        try {
            const { discordjs, config } = global.deps;
            const { bot_owners } = config.settings;
            const { success, error } = config.settings.emojis;
            const { default: embedColor } = config.settings.colors.embeds;


            const guilds = client.guilds.cache.map(guild => `**${guild.name}** (${guild.id}) - ${guild.memberCount} members`).join("\n") || "No servers found.";

            const embed = new discordjs.EmbedBuilder()
                .setColor(embedColor)
                .setTitle("Bot's Servers")
                .setDescription(guilds)
                .setFooter({ text: `Total: ${client.guilds.cache.size} servers` });

            message.reply({ embeds: [embed] });
        } catch (err) {
            console.error(`❌ Error in ${module.exports.conf.name} command:`, err);
            message.reply(`${global.deps.config.settings.emojis.error} An error occurred while executing this command.`);
        }
    }
};
