exports.name = "banner"; // Ensure this exists
exports.description = "Get a user's profile banner.";
exports.options = [
    {
        name: "user",
        type: 6, // USER type
        description: "The user whose banner you want to see",
        required: false
    }
];

exports.run = async (client, interaction) => {
    const user = interaction.options.getUser("user") || interaction.user;
    const userData = await client.users.fetch(user.id, { force: true });

    if (!userData.banner) {
        return interaction.reply({ content: `${global.deps.config.settings.emojis.error} This user has no profile banner!`, flags: 64 });
    }

    const bannerURL = userData.bannerURL({ dynamic: true, size: 4096 });

    const embed = new global.deps.discordjs.EmbedBuilder()
        .setColor(global.deps.config.settings.colors.embeds.default)
        .setTitle(`${user.tag}'s Banner`)
        .setImage(bannerURL)
        .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });

    interaction.reply({ embeds: [embed] });
};
