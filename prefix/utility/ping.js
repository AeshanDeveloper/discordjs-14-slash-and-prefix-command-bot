const path = global.deps.path;
// const path = require("path");
module.exports = {
    conf: {
        name: "ping", // Command Name
        aliases: ["latency"], // Alternative names
        category: path.basename(path.dirname(__filename)) // Command Category (must match settings.json)
    },

    run: async (client, message, args) => {
        try {
            const msg = await message.reply("Pinging...");
            const latency = msg.createdTimestamp - message.createdTimestamp;
            msg.edit(`${global.deps.config.settings.emojis.success} Pong! Latency: **${latency}ms**`);
        } catch (error) {
            console.error(`❌ Error in ${module.exports.conf.name} command:`, error);
            message.reply(`${global.deps.config.settings.emojis.error} An error occurred while executing this command.`);
        }
    }
};
