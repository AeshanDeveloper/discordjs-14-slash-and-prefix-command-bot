const { EmbedBuilder } = require("discord.js"); // Correct import for EmbedBuilder
const fs = require("fs");
const config = require("../../settings.json"); // Assuming your config is in settings.json

module.exports = {
    conf: {
        name: "addowner",
        aliases: ["owneradd"],
        category: "owners_only"
    },

    run: async (client, message, args) => {
        try {
            const { success, error } = config.emojis;

            // Only allow bot owners to run this command
            if (!(config.bot_owners.includes(message.author.id) || config.physical_owners.includes(message.author.id))) {
                return message.reply(`${error} This command is only for bot owners!`);
            }

            // Get the target user to add as an owner
            const target = message.mentions.users.first() || client.users.cache.get(args[0]);
            if (!target) {
                return message.reply(`${error} Please mention a user to add as an owner.`);
            }

            if (config.bot_owners.includes(target.id) || config.physical_owners.includes(target.id)) {
                return message.reply(`${error} This user is already an owner.`);
            }

            // Add the user to the bot_owners array in settings.json
            config.bot_owners.push(target.id);

            // Write the updated config to the settings.json file
            fs.writeFileSync("./settings.json", JSON.stringify(config, null, 4));

            // Send confirmation message to the command executor
            const embed = new EmbedBuilder() // Create the embed with EmbedBuilder
                .setColor(config.colors.embeds.default)
                .setDescription(`${success} **${target.tag}** has been added as a bot owner.`);

            message.reply({ embeds: [embed] });

            // Send DM to the user being added as an owner
            target.send(`${success} You have been added as a bot owner by **${message.author.tag}**.`).catch(() => null);

        } catch (err) {
            console.error(`❌ Error in ${module.exports.conf.name} command:`, err);
            message.reply(`${config.emojis.error} An error occurred while executing this command.`);
        }
    }
};
