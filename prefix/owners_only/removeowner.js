const { EmbedBuilder } = require("discord.js"); // Correct import for EmbedBuilder
const fs = require("fs");
const config = require("../../settings.json"); // Assuming your config is in settings.json

module.exports = {
    conf: {
        name: "removeowner",
        aliases: ["delowner", "unowner"],
        category: "owners_only"
    },

    run: async (client, message, args) => {
        try {
            const { success, error } = config.emojis;

            // Only allow bot owners to run this command
            if (!(config.bot_owners.includes(message.author.id) || config.physical_owners.includes(message.author.id))) {
                return message.reply(`${error} This command is only for bot owners!`);
            }

            // Ensure correct usage format
            if (args[0]?.toLowerCase() !== "remove") {
                return message.reply(`${error} Usage: \`removeowner remove @user\``);
            }

            // Get the target user to remove as an owner
            const target = message.mentions.users.first() || client.users.cache.get(args[1]);
            if (!target) {
                return message.reply(`${error} Please mention a user to remove as an owner.`);
            }

            if (!config.bot_owners.includes(target.id)) {
                return message.reply(`${error} This user is not a bot owner.`);
            }

            // Do not allow the primary owner to be removed
            if (target.id === config.physical_owner) {
                return message.reply(`${error} You cannot remove the primary bot owner.`);
            }

            // Remove the user from the bot_owners array
            config.bot_owners = config.bot_owners.filter(id => id !== target.id);

            // Write the updated config to the settings.json file
            fs.writeFileSync("./settings.json", JSON.stringify(config, null, 4));

            // Send confirmation message to the command executor
            const embed = new EmbedBuilder() // Create the embed with EmbedBuilder
                .setColor(config.colors.embeds.default)
                .setDescription(`${success} **${target.tag}** has been removed as a bot owner.`);

            message.reply({ embeds: [embed] });

            // Send DM to the user being removed as an owner
            target.send(`${error} You have been removed as a bot owner by **${message.author.tag}**.`).catch(() => null);

        } catch (err) {
            console.error(`❌ Error in ${module.exports.conf.name} command:`, err);
            message.reply(`${config.emojis.error} An error occurred while executing this command.`);
        }
    }
};
