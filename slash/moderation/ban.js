exports.name = "ban"; // Ensure this exists
exports.description = "Ban a user from the server.";
exports.options = [
    {
        name: "user",
        type: 6, // USER type
        description: "The user to ban",
        required: true
    },
    {
        name: "reason",
        type: 3, // STRING type
        description: "Reason for the ban",
        required: false
    }
];

exports.run = async (client, interaction) => {
    if (!interaction.member.permissions.has(global.deps.discordjs.PermissionsBitField.Flags.BanMembers)) {
        return interaction.reply({ content: `${global.deps.config.settings.emojis.error} You don't have permission to ban members!`, flags: 64 });
    }

    const target = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason") || "No reason provided";
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);

    if (!member) {
        return interaction.reply({ content: `${global.deps.config.settings.emojis.error} User is not in the server!`, flags: 64 });
    }

    await interaction.deferReply(); // Prevents "interaction already replied" errors

    try {
        await member.ban({ reason });

        const embed = new global.deps.discordjs.EmbedBuilder()
            .setColor(global.deps.config.settings.colors.embeds.default)
            .setTitle(`${global.deps.config.settings.emojis.ban} User Banned`)
            .setDescription(`**${target.tag}** has been banned.\n**Reason:** ${reason}`)
            .setFooter({ text: `Banned by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });

        await interaction.editReply({ content: null, embeds: [embed] });

        // Send DM only if the ban was successful
        await target.send(`${global.deps.config.settings.emojis.ban} You have been **banned** from **${interaction.guild.name}**!\n**Reason:** ${reason}`).catch(() => null);
    } catch (error) {
        await interaction.editReply({ content: `${global.deps.config.settings.emojis.error} Failed to ban **${target.tag}**. I may not have permission to ban them.` });
    }
};
