const { EmbedBuilder } = require("discord.js");
const config = require("../../settings.json");

module.exports = {
    conf: {
        name: "notify",
        aliases: ["notification", "msgnotify"],
        category: "utility"
    },

    run: async (client, message, args) => {
        try {
            const { success, error } = config.emojis;
            const { default: embedColor } = config.colors.embeds;

            // Ensure the message starts with a valid subcommand
            if (args.length < 2) {
                return message.reply(`${error} Usage: \`notify <user|role> <@user|roleName> <message>\``);
            }

            const subCommand = args[0].toLowerCase();
            const targetOrRole = message.mentions.users.first() || message.mentions.roles.first();
            const notifyMessage = args.slice(2).join(" ");

            // Check for permissions: Admins or owners can use this command
            if (!(message.member.permissions.has("ADMINISTRATOR") || config.settings.bot_owners.includes(message.author.id))) {
                return message.reply(`${error} You do not have permission to use this command.`);
            }

            // Handle the 'user' subcommand to send a DM to the user
            if (subCommand === "user") {
                if (!targetOrRole) {
                    return message.reply(`${error} Please mention a valid user.`);
                }

                if (!notifyMessage) {
                    return message.reply(`${error} Please provide a message to send.`);
                }

                const target = targetOrRole;

                try {
                    await target.send(`${notifyMessage}`);
                    
                    const embed = new EmbedBuilder()
                        .setColor(embedColor)
                        .setDescription(`${success} The message has been sent to **${target.tag}**.`);
                    message.reply({ embeds: [embed] });
                } catch (err) {
                    console.error(`❌ Error in "${module.exports.conf.name}" command:`, err);
                    message.reply(`${error} An error occurred while sending the message.`);
                }
            }
            // Handle the 'role' subcommand to notify all users with a specific role
            else if (subCommand === "role") {
                if (!targetOrRole) {
                    return message.reply(`${error} Please mention a valid role.`);
                }

                if (!notifyMessage) {
                    return message.reply(`${error} Please provide a message to send.`);
                }

                const role = targetOrRole;
                const membersWithRole = message.guild.members.cache.filter(member => member.roles.cache.has(role.id));

                if (membersWithRole.size === 0) {
                    return message.reply(`${error} No users with the role **${role.name}** were found.`);
                }

                // Send the notification to all users with the role
                membersWithRole.forEach(member => {
                    member.send(`${notifyMessage}`).catch(() => null);
                });

                const embed = new EmbedBuilder()
                    .setColor(embedColor)
                    .setDescription(`${success} The message has been sent to all members with the role **${role.name}**.`);
                message.reply({ embeds: [embed] });
            } else {
                return message.reply(`${error} Invalid subcommand. Usage: \`notify <user|role> <@user|roleName> <message>\``);
            }

        } catch (err) {
            console.error(`❌ Error in "${module.exports.conf.name}" command:`, err);
            message.reply(`${config.settings.emojis.error} An error occurred while executing this command.`);
        }
    }
};
