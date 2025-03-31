exports.conf = {
    name: "avatar",
    description: "Get a user's avatar.",
    usage: "avatar [@user]",
    aliases: ["pfp", "profilepic"]
};

exports.run = async (client, message, args) => {
    const user = message.mentions.users.first() || message.author;
    const avatarURL = user.displayAvatarURL({ dynamic: true, size: 4096 });

    const embed = new global.deps.discordjs.EmbedBuilder()
        .setColor(global.deps.config.settings.colors.embeds.default)
        .setTitle(`${user.tag}'s Avatar`)
        .setImage(avatarURL)
        .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });

    message.channel.send({ embeds: [embed] });
};
