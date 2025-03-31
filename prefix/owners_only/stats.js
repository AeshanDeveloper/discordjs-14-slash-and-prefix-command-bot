const path = global.deps.path;
module.exports = {
    conf: {
        name: "status",
        aliases: ["status", "stats"],
        category: path.basename(path.dirname(__filename))
    },

    run: async (client, message, args) => {
        try {
            const { discordjs, config } = global.deps;
            const { bot_owners } = config.settings;
            const { success, error } = config.settings.emojis;
            const { default: embedColor } = config.settings.colors.embeds;

            const os = require("os");
            const totalMemory = (os.totalmem() / 1024 / 1024).toFixed(2);
            const usedMemory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
            const uptime = client.uptime;
            const ping = client.ws.ping;

            const embed = new discordjs.EmbedBuilder()
                .setColor(embedColor)
                .setTitle("Bot Status")
                .setDescription(`
                    **Uptime:** <t:${Math.floor((Date.now() - uptime) / 1000)}:R>
                    **Ping:** ${ping}ms
                    **Memory Usage:** ${usedMemory}MB / ${totalMemory}MB
                    **Servers:** ${client.guilds.cache.size}
                    **Users:** ${client.users.cache.size}
                `);

            message.reply({ embeds: [embed] });
        } catch (err) {
            console.error(`❌ Error in ${module.exports.conf.name} command:`, err);
            message.reply(`${global.deps.config.settings.emojis.error} An error occurred while executing this command.`);
        }
    }
};
