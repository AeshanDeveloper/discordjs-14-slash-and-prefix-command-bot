const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const config = require("../../settings.json");

module.exports = {
    conf: {
        name: "staff",
        aliases: ["staffadd", "staffremove"],
        category: "owners_only"
    },

    run: async (client, message, args) => {
        try {
            const { success, error } = config.emojis;
            const { default: embedColor } = config.colors.embeds;

            // Ensure only bot owners can run this command
            if (!(config.bot_owners.includes(message.author.id) || config.physical_owners.includes(message.author.id))) {
                return message.reply(`${error} This command is only for bot owners!`);
            }

            // Validate command syntax
            if (args.length < 3 || !["add", "remove"].includes(args[0].toLowerCase()) || !["owner", "admin"].includes(args[1].toLowerCase())) {
                return message.reply(`${error} Usage: \`staff <add|remove> <owner|admin> @user\``);
            }

            const action = args[0].toLowerCase();
            const role = args[1].toLowerCase();
            const target = message.mentions.users.first() || client.users.cache.get(args[2]);

            if (!target) {
                return message.reply(`${error} Please mention a user to ${action} as a staff member.`);
            }

            // Add or remove action
            if (action === "add") {
                if (role === "owner") {
                    if (config.bot_owners.includes(target.id)) {
                        return message.reply(`${error} This user is already an owner.`);
                    }
                    config.bot_owners.push(target.id);
                    fs.writeFileSync("./settings.json", JSON.stringify(config, null, 4));

                    const embed = new EmbedBuilder()
                        .setColor(embedColor)
                        .setDescription(`${success} **${target.tag}** has been added as a bot owner.`);
                    message.reply({ embeds: [embed] });

                    target.send(`${success} You have been added as a bot owner by **${message.author.tag}**.`).catch(() => null);
                } else if (role === "admin") {
                    if (config.administrators.includes(target.id)) {
                        return message.reply(`${error} This user is already an administrator.`);
                    }
                    config.administrators.push(target.id);
                    fs.writeFileSync("./settings.json", JSON.stringify(config, null, 4));

                    const embed = new EmbedBuilder()
                        .setColor(embedColor)
                        .setDescription(`${success} **${target.tag}** has been added as an administrator.`);
                    message.reply({ embeds: [embed] });

                    target.send(`${success} You have been added as an administrator by **${message.author.tag}**.`).catch(() => null);
                }
            } else if (action === "remove") {
                if (role === "owner") {
                    if (!config.bot_owners.includes(target.id)) {
                        return message.reply(`${error} This user is not a bot owner.`);
                    }
                    config.bot_owners = config.bot_owners.filter(id => id !== target.id);
                    fs.writeFileSync("./settings.json", JSON.stringify(config, null, 4));

                    const embed = new EmbedBuilder()
                        .setColor(embedColor)
                        .setDescription(`${success} **${target.tag}** has been removed as a bot owner.`);
                    message.reply({ embeds: [embed] });

                    target.send(`${error} You have been removed as a bot owner by **${message.author.tag}**.`).catch(() => null);
                } else if (role === "admin") {
                    if (!config.administrators.includes(target.id)) {
                        return message.reply(`${error} This user is not an administrator.`);
                    }
                    config.administrators = config.administrators.filter(id => id !== target.id);
                    fs.writeFileSync("./settings.json", JSON.stringify(config, null, 4));

                    const embed = new EmbedBuilder()
                        .setColor(embedColor)
                        .setDescription(`${success} **${target.tag}** has been removed as an administrator.`);
                    message.reply({ embeds: [embed] });

                    target.send(`${error} You have been removed as an administrator by **${message.author.tag}**.`).catch(() => null);
                }
            }
        } catch (err) {
            console.error(`❌ Error in "${module.exports.conf.name}" command:`, err);
            message.reply(`${config.emojis.error} An error occurred while executing this command.`);
        }
    }
};
