const path = global.deps.path;

module.exports = {
    conf: {
        name: "unban", // Command Name
        category: path.basename(path.dirname(__filename)) // Command Category (must match settings.json)
    },

    data: new global.deps.discordjs.SlashCommandBuilder()
        .setName("unban")
        .setDescription("Unban a user from the server.")
        .addStringOption(option =>
            option.setName("user_id")
                .setDescription("The ID of the user to unban")
                .setRequired(true)
        ),

    run: async (client, interaction) => {
        try {
            const emojis = global.deps.config.settings.emojis;

            if (!interaction.member.permissions.has(global.deps.discordjs.PermissionsBitField.Flags.BanMembers)) {
                return interaction.reply({
                    content: `${emojis.error} You don't have permission to unban members!`,
                    flags: 64
                });
            }

            const userId = interaction.options.getString("user_id");

            // Attempt to unban the user
            try {
                await interaction.guild.bans.remove(userId);

                const embed = new global.deps.discordjs.EmbedBuilder()
                    .setColor(global.deps.config.settings.colors.embeds.default)
                    .setTitle(`${emojis.unban} User Unbanned`)
                    .setDescription(`Unbanned user with ID **${userId}**.`)
                    .setFooter({
                        text: `Unbanned by ${interaction.user.tag}`,
                        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                    });

                await interaction.reply({ embeds: [embed] });

                // Try to DM the user about their unban
                try {
                    const user = await client.users.fetch(userId);
                    await user.send(`${emojis.unban} You have been **unbanned** from **${interaction.guild.name}**!`).catch(() => null);
                } catch (error) {
                    console.log(`❌ Failed to DM user ${userId} about unban.`);
                }

            } catch (error) {
                return interaction.reply({
                    content: `${emojis.error} Failed to unban user with ID **${userId}**. They may not be banned or an invalid ID was provided.`,
                    flags: 64
                });
            }

        } catch (error) {
            console.error(`❌ Error in ${module.exports.conf.name} command:`, error);
            interaction.reply({
                content: `${global.deps.config.settings.emojis.error} An error occurred while executing this command.`,
                ephemeral: true
            });
        }
    }
};
