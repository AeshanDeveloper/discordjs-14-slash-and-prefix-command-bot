const { EmbedBuilder } = require("discord.js"); // Import EmbedBuilder correctly
const config = require("./../../config.js");
const fs = require("fs");

module.exports = {
    conf: {
        name: "addadmin",
        aliases: ["adminadd"],
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
                return message.reply(`${error} Please mention a user to add as an administrator.`);
            }

            if (config.settings.administrators.includes(target.id)) {
                return message.reply(`${error} This user is already an administrator.`);
            }

            config.settings.administrators.push(target.id);
            fs.writeFileSync("./config.js", JSON.stringify(config, null, 4));

            const embed = new EmbedBuilder()  // Use EmbedBuilder here
                .setColor(config.settings.colors.embeds.default)
                .setDescription(`${success} **${target.tag}** has been added as an administrator.`);

            message.reply({ embeds: [embed] });

            target.send(`${success} You have been added as an administrator by **${message.author.tag}**.`).catch(() => null);

        } catch (err) {
            console.error(`❌ Error in ${module.exports.conf.name} command:`, err);
            message.reply(`${config.settings.emojis.error} An error occurred while executing this command.`);
        }
    }
};
