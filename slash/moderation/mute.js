const path = global.deps.path;

module.exports = {
    conf: {
        name: "mute",
        category: path.basename(path.dirname(__filename))
    },

    data: new global.deps.discordjs.SlashCommandBuilder()
        .setName("mute")
        .setDescription("Mute a user in the server.")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("The user to mute")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("duration")
                .setDescription("Duration (e.g., 10m, 1h, 1d)")
                .setRequired(true)),

    run: async (client, interaction) => {
        try {
            const { discordjs, config } = global.deps;
            const { PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = discordjs;
            const { success, error, mute } = config.settings.emojis;
            const { default: embedColor } = config.settings.colors.embeds;

            const user = interaction.options.getUser("user");
            const durationString = interaction.options.getString("duration").toLowerCase();

            // Defer reply to prevent timeout
            await interaction.deferReply({ ephemeral: false });

            // Permission check
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers))
                return interaction.editReply({ content: `${error} You don't have permission to mute members!` });

            if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ModerateMembers))
                return interaction.editReply({ content: `${error} I don't have permission to mute members!` });

            // Prevent self-mute & bot mute
            if (user.id === interaction.user.id) return interaction.editReply({ content: `${error} You cannot mute yourself!` });
            if (user.id === client.user.id) return interaction.editReply({ content: `${error} I cannot mute myself!` });

            // Function to convert time string to milliseconds
            function parseDuration(input) {
                const match = input.match(/^(\d+)(s|m|h|d)$/);
                if (!match) return null;

                const value = parseInt(match[1]);
                const unit = match[2];

                switch (unit) {
                    case "s": return value * 1000;
                    case "m": return value * 60 * 1000;
                    case "h": return value * 60 * 60 * 1000;
                    case "d": return value * 24 * 60 * 60 * 1000;
                    default: return null;
                }
            }

            const durationMs = parseDuration(durationString);
            if (!durationMs) {
                return interaction.editReply({ content: `${error} Invalid duration format! Use **Xs, Xm, Xh, or Xd** (e.g., 10m, 2h, 1d).` });
            }

            // Fetch member
            const member = await interaction.guild.members.fetch(user.id).catch(() => null);
            if (!member) return interaction.editReply({ content: `${error} User is not in the server!` });

            // Role hierarchy check
            if (
                member.roles.highest.position >= interaction.guild.members.me.roles.highest.position ||
                member.roles.highest.position >= interaction.member.roles.highest.position
            ) {
                return interaction.editReply({ content: `${error} You cannot mute this user due to role hierarchy.` });
            }

            // Confirmation buttons
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("confirm_mute")
                    .setLabel("✅ Confirm")
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId("cancel_mute")
                    .setLabel("❌ Cancel")
                    .setStyle(ButtonStyle.Danger)
            );

            // Confirmation embed
            const confirmEmbed = new EmbedBuilder()
                .setColor(embedColor)
                .setDescription(`⚠️ Are you sure you want to mute **${user.tag}** for **${durationString}**?`);

            const msg = await interaction.editReply({ embeds: [confirmEmbed], components: [row] });

            // Button interaction collector
            const filter = (i) => i.user.id === interaction.user.id;
            const collector = msg.createMessageComponentCollector({ filter, time: 15000 });

            collector.on("collect", async (i) => {
                if (i.customId === "confirm_mute") {
                    try {
                        await member.timeout(durationMs);

                        const mutedEmbed = new EmbedBuilder()
                            .setColor(embedColor)
                            .setDescription(`${success} Muted **${user.tag}** for **${durationString}**.`);

                        await i.update({ embeds: [mutedEmbed], components: [] });

                        await user.send(`${mute} You have been **muted** in **${interaction.guild.name}** for **${durationString}**!`).catch(() => null);
                    } catch (error) {
                        await i.update({ content: `${error} Failed to mute **${user.tag}**.`, components: [] });
                    }
                } else if (i.customId === "cancel_mute") {
                    await i.update({ content: `${error} Mute cancelled.`, components: [] });
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
