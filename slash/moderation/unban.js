exports.name = "unban"; // Ensure this exists
exports.description = "Unban a user from the server.";
exports.options = [
    {
        name: "user_id",
        type: 3, // STRING type (User ID)
        description: "The ID of the user to unban",
        required: true
    }
];

exports.run = async (client, interaction) => {
    if (!interaction.member.permissions.has(global.deps.discordjs.PermissionsBitField.Flags.BanMembers))
        return interaction.reply({ content: `${global.deps.config.settings.emojis.error} You don't have permission to unban members!`, flags: 64 });

    const userId = interaction.options.getString("user_id");
    await interaction.guild.bans.remove(userId).catch(() => null);

    interaction.reply({ content: `${global.deps.config.settings.emojis.success} ${global.deps.config.settings.emojis.unban} Unbanned user with ID **${userId}**!` });

    try {
        const user = await client.users.fetch(userId);
        await user.send(`${global.deps.config.settings.emojis.unban} You have been **unbanned** from **${interaction.guild.name}**!`).catch(() => null);
    } catch (error) {
        console.log(`Failed to DM user ${userId} about unban.`);
    }
};
