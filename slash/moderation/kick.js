const path = global.deps.path;

module.exports = {
    conf: {
        name: "kick",
        category: path.basename(path.dirname(__filename))
    },

    data: new global.deps.discordjs.SlashCommandBuilder()
        .setName("kick")
        .setDescription("Kick a user from the server.")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("The user to kick")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("reason")
                .setDescription("Reason for kicking")
                .setRequired(false)),

    run: async (client, interaction) => {
        try {
            const { discordjs, config } = global.deps;
            const { PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = discordjs;
            const { success, error, kick } = config.settings.emojis;
            const { default: embedColor } = config.settings.colors.embeds;

            const user = interaction.options.getUser("user");
            const reason = interaction.options.getString("reason") || "No reason provided";

            // Defer reply to prevent timeout
            await interaction.deferReply({ ephemeral: false });

            // Permission checks
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers))
                return interaction.editReply({ content: `${error} You don't have permission to kick members!` });

            if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.KickMembers))
                return interaction.editReply({ content: `${error} I don't have permission to kick members!` });

            // Prevent self-kick & bot kick
            if (user.id === interaction.user.id) return interaction.editReply({ content: `${error} You cannot kick yourself!` });
            if (user.id === client.user.id) return interaction.editReply({ content: `${error} I cannot kick myself!` });

            // Fetch member
            const member = await interaction.guild.members.fetch(user.id).catch(() => null);
            if (!member) return interaction.editReply({ content: `${error} User is not in the server!` });

            // Role hierarchy check
            if (
                member.roles.highest.position >= interaction.guild.members.me.roles.highest.position ||
                member.roles.highest.position >= interaction.member.roles.highest.position
            ) {
                return interaction.editReply({ content: `${error} You cannot kick this user due to role hierarchy.` });
            }

            // Confirmation buttons
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("confirm_kick")
                    .setLabel("✅ Confirm")
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId("cancel_kick")
                    .setLabel("❌ Cancel")
                    .setStyle(ButtonStyle.Danger)
            );

            // Confirmation embed
            const confirmEmbed = new EmbedBuilder()
                .setColor(embedColor)
                .setDescription(`⚠️ Are you sure you want to kick **${user.tag}**?\n**Reason:** ${reason}`);

            const msg = await interaction.editReply({ embeds: [confirmEmbed], components: [row] });

            // Button interaction collector
            const filter = (i) => i.user.id === interaction.user.id;
            const collector = msg.createMessageComponentCollector({ filter, time: 15000 });

            collector.on("collect", async (i) => {
                if (i.customId === "confirm_kick") {
                    try {
                        await member.kick(reason);

                        const kickedEmbed = new EmbedBuilder()
                            .setColor(embedColor)
                            .setDescription(`${success} Kicked **${user.tag}**.\n**Reason:** ${reason}`);

                        await i.update({ embeds: [kickedEmbed], components: [] });

                        await user.send(`${kick} You have been **kicked** from **${interaction.guild.name}**!\n**Reason:** ${reason}`).catch(() => null);
                    } catch (error) {
                        await i.update({ content: `${error} Failed to kick **${user.tag}**.`, components: [] });
                    }
                } else if (i.customId === "cancel_kick") {
                    await i.update({ content: `${error} Kick cancelled.`, components: [] });
                }
                collector.stop();
            });

            collector.on("end", async (_, reason) => {
                if (reason === "time") {
                    await interaction.editReply({ components: [] }).catch(() => null);
                    await interaction.followUp({ content: `${error} Confirmation timed out.` });
                }
            });

        } catch (err) {
            console.error(`❌ Error in ${module.exports.conf.name} command:`, err);
            interaction.editReply({ content: `${global.deps.config.settings.emojis.error} An error occurred while executing this command.` });
        }
    }
};
