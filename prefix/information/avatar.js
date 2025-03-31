const path = global.deps.path;

module.exports = {
    conf: {
        name: "avatar", // Command Name
        aliases: ["pfp", "profilepic"], // Alternative names
        category: path.basename(path.dirname(__filename)) // Command Category (must match settings.json)
    },

    run: async (client, message, args) => {
        try {
            const user = message.mentions.users.first() || message.author;
            const avatarURL = user.displayAvatarURL({ dynamic: true, size: 4096 });
            const emojis = global.deps.config.settings.emojis;

            const embed = new global.deps.discordjs.EmbedBuilder()
                .setColor(global.deps.config.settings.colors.embeds.default)
                .setTitle(`${emojis.image} ${user.tag}'s Avatar`)
                .setImage(avatarURL)
                .setFooter({
                    text: `Requested by ${message.author.tag}`,
                    iconURL: message.author.displayAvatarURL({ dynamic: true })
                });

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error(`❌ Error in ${module.exports.conf.name} command:`, error);
            message.reply(`${global.deps.config.settings.emojis.error} An error occurred while executing this command.`);
        }
    }
};
