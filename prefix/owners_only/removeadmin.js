const config = require("./../../config.js");
const fs = require("fs");

module.exports = {
    conf: {
        name: "removeadmin",
        aliases: ["adminremove"],
        category: "owners_only"
    },

    run: async (client, message, args) => {
        try {
            const { success, error } = config.settings.emojis;

            // Only allow bot owners to run this command
            if (!(config.settings.bot_owners.includes(message.author.id) || config.settings.physical_owners.includes(message.author.id))) {
                return message.reply(`${error} This command is only for bot owners!`);
            }

            const target = message.mentions.users.first() || client.users.cache.get(args[0]);
            if (!target) {
                return message.reply(`${error} Please mention a user to remove from the administrator list.`);
            }

            if (!config.settings.administrators.includes(target.id)) {
                return message.reply(`${error} This user is not an administrator.`);
            }

            config.settings.administrators = config.settings.administrators.filter(id => id !== target.id);
            fs.writeFileSync("./config.json", JSON.stringify(config, null, 4));

            const embed = new client.discordjs.EmbedBuilder()
                .setColor(config.settings.colors.embeds.default)
                .setDescription(`${success} **${target.tag}** has been removed from the administrator list.`);

            message.reply({ embeds: [embed] });

            target.send(`${success} You have been removed from the administrator list by **${message.author.tag}**.`).catch(() => null);

        } catch (err) {
            console.error(`❌ Error in ${module.exports.conf.name} command:`, err);
            message.reply(`${config.settings.emojis.error} An error occurred while executing this command.`);
        }
    }
};
