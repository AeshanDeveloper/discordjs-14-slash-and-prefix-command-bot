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
        type: 4, // INTEGER type (in minutes)
        description: "Duration of mute in minutes",
        required: true
    }
];

exports.run = async (client, interaction) => {
    if (!interaction.member.permissions.has(global.deps.discordjs.PermissionsBitField.Flags.MuteMembers))
        return interaction.reply({ content: `${global.deps.config.settings.emojis.error} You don't have permission to mute members!`, flags: 64 });

    const target = interaction.options.getUser("user");
    const duration = interaction.options.getInteger("duration");
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) return interaction.reply({ content: `${global.deps.config.settings.emojis.error} User is not in the server!`, flags: 64 });

    await member.timeout(duration * 60 * 1000).catch(() => null);
    interaction.reply({ content: `${global.deps.config.settings.emojis.success} ${global.deps.config.settings.emojis.mute} Muted **${target.tag}** for **${duration} minutes**!` });

    await target.send(`${global.deps.config.settings.emojis.mute} You have been **muted** in **${interaction.guild.name}** for **${duration} minutes**!`).catch(() => null);
};
