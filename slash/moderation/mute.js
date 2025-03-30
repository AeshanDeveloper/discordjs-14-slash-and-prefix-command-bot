exports.name = "mute"; // Ensure this exists
exports.description = "Mute a user in the server.";
exports.options = [
    {
        name: "user",
        type: 6, // USER type
        description: "The user to mute",
        required: true
    },
    {
        name: "duration",
        type: 3, // STRING type
        description: "Duration of mute (e.g., 10m, 2h, 1d)",
        required: true
    }
];

exports.run = async (client, interaction) => {
    if (!interaction.member.permissions.has(global.deps.discordjs.PermissionsBitField.Flags.MuteMembers)) {
        return interaction.reply({ content: `${global.deps.config.settings.emojis.error} You don't have permission to mute members!`, flags: 64 });
    }

    const target = interaction.options.getUser("user");
    const durationString = interaction.options.getString("duration").toLowerCase();
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);

    if (!member) {
        return interaction.reply({ content: `${global.deps.config.settings.emojis.error} User is not in the server!`, flags: 64 });
    }

    // Function to convert time string (e.g., "10m", "2h") to milliseconds
    function parseDuration(input) {
        const match = input.match(/^(\d+)(s|m|h|d)$/);
        if (!match) return null;

        const value = parseInt(match[1]);
        const unit = match[2];

        switch (unit) {
            case "s": return value * 1000;         // Seconds
            case "m": return value * 60 * 1000;    // Minutes
            case "h": return value * 60 * 60 * 1000; // Hours
            case "d": return value * 24 * 60 * 60 * 1000; // Days
            default: return null;
        }
    }

    const durationMs = parseDuration(durationString);
    if (!durationMs) {
        return interaction.reply({ content: `${global.deps.config.settings.emojis.error} Invalid duration format! Use **Xs, Xm, Xh, or Xd** (e.g., 10m, 2h, 1d).`, flags: 64 });
    }

    await interaction.deferReply(); // Prevents "interaction already replied" error

    try {
        await member.timeout(durationMs);

        const embed = new global.deps.discordjs.EmbedBuilder()
            .setColor(global.deps.config.settings.colors.embeds.default)
            .setTitle(`${global.deps.config.settings.emojis.mute} User Muted`)
            .setDescription(`**${target.tag}** has been muted for **${durationString}**.`)
            .setFooter({ text: `Muted by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });

        await interaction.editReply({ content: null, embeds: [embed] });

        // Send DM only if mute was successful
        await target.send(`${global.deps.config.settings.emojis.mute} You have been **muted** in **${interaction.guild.name}** for **${durationString}**!`).catch(() => null);
    } catch (error) {
        await interaction.editReply({ content: `${global.deps.config.settings.emojis.error} Failed to mute **${target.tag}**. I may not have permission to mute them.` });
    }
};
