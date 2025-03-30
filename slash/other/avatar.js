exports.name = "avatar"; // Ensure this exists
exports.description = "Get a user's avatar.";
exports.options = [
    {
        name: "user",
        type: 6, // USER type
        description: "The user whose avatar you want to see",
        required: false
    }
];

exports.run = async (client, interaction) => {
    const user = interaction.options.getUser("user") || interaction.user;
    const avatarURL = user.displayAvatarURL({ dynamic: true, size: 4096 });

    const embed = new global.deps.discordjs.EmbedBuilder()
        .setColor(global.deps.config.settings.colors.embeds.default)
        .setTitle(`${user.tag}'s Avatar`)
        .setImage(avatarURL)
        .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });

    interaction.reply({ embeds: [embed] });
};
