exports.name = "ban"; // Ensure this line exists
exports.description = "Ban a user from the server.";
exports.options = [
    {
        name: "user",
        type: 6, // USER type
        description: "The user to ban",
        required: true
    }
];

exports.run = async (client, interaction) => {
    if (!interaction.member.permissions.has(global.deps.discordjs.PermissionsBitField.Flags.BanMembers))
        return interaction.reply({ content: `${global.deps.config.settings.emojis.error} You don't have permission to ban members!`, flags: 64 });

    const target = interaction.options.getUser("user");
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) return interaction.reply({ content: `${global.deps.config.settings.emojis.error} User is not in the server!`, flags: 64 });

    await member.ban({ reason: "Banned by command" }).catch(() => null);
    interaction.reply({ content: `${global.deps.config.settings.emojis.success} ${global.deps.config.settings.emojis.ban} Banned **${target.tag}**!` });

    await target.send(`${global.deps.config.settings.emojis.ban} You have been **banned** from **${interaction.guild.name}**!`).catch(() => null);
};
