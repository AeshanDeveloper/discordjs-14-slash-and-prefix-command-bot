exports.name = "unmute"; // Ensure this exists
exports.description = "Unmute a user in the server.";
exports.options = [
    {
        name: "user",
        type: 6, // USER type
        description: "The user to unmute",
        required: true
    }
];

exports.run = async (client, interaction) => {
    if (!interaction.member.permissions.has(global.deps.discordjs.PermissionsBitField.Flags.MuteMembers))
        return interaction.reply({ content: `${global.deps.config.settings.emojis.error} You don't have permission to unmute members!`, flags: 64 });

    const target = interaction.options.getUser("user");
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) return interaction.reply({ content: `${global.deps.config.settings.emojis.error} User is not in the server!`, flags: 64 });

    await member.timeout(null).catch(() => null);
    interaction.reply({ content: `${global.deps.config.settings.emojis.success} ${global.deps.config.settings.emojis.mute_remove} Unmuted **${target.tag}**!` });

    await target.send(`${global.deps.config.settings.emojis.mute_remove} You have been **unmuted** in **${interaction.guild.name}**!`).catch(() => null);
};
