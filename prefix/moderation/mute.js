const path = global.deps.path;

module.exports = {
    conf: {
        name: "mute",
        aliases: ["silence", "timeout"],
        category: path.basename(path.dirname(__filename))
    },

    run: async (client, message, args) => {
        try {
            const { discordjs, config } = global.deps;
            const { PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = discordjs;
            const { success, error, mute } = config.settings.emojis;
            const { default: embedColor } = config.settings.colors.embeds;

            // Permission check
            if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers))
                return message.reply(`${error} You don't have permission to mute members!`);

            if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ModerateMembers))
                return message.reply(`${error} I don't have permission to mute members!`);

            // Get target user
            const target = message.mentions.users.first() || client.users.cache.get(args[0]);
            if (!target) return message.reply(`${error} Please mention a user to mute!`);

            // Prevent self-mute & bot mute
            if (target.id === message.author.id) return message.reply(`${error} You cannot mute yourself!`);
            if (target.id === client.user.id) return message.reply(`${error} I cannot mute myself!`);

            // Parse duration
            const durationString = args[1]?.toLowerCase();
            function parseDuration(input) {
                const match = input?.match(/^(\d+)(s|m|h|d)$/);
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
                return message.reply(`${error} Invalid duration format! Use **Xs, Xm, Xh, or Xd** (e.g., 10m, 2h, 1d).`);
            }

            // Fetch member
            const member = await message.guild.members.fetch(target.id).catch(() => null);
            if (!member) return message.reply(`${error} User is not in the server!`);

            // Role hierarchy check
            if (
                member.roles.highest.position >= message.guild.members.me.roles.highest.position ||
                member.roles.highest.position >= message.member.roles.highest.position
            ) {
                return message.reply(`${error} You cannot mute this user due to role hierarchy.`);
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
                .setDescription(`⚠️ Are you sure you want to mute **${target.tag}** for **${durationString}**?`);

            const msg = await message.reply({ embeds: [confirmEmbed], components: [row] });

            // Button interaction collector
            const filter = (i) => i.user.id === message.author.id;
            const collector = msg.createMessageComponentCollector({ filter, time: 15000 });

            collector.on("collect", async (i) => {
                if (i.customId === "confirm_mute") {
                    try {
                        await member.timeout(durationMs);

                        const mutedEmbed = new EmbedBuilder()
                            .setColor(embedColor)
                            .setDescription(`${success} Muted **${target.tag}** for **${durationString}**.`);

                        await i.update({ embeds: [mutedEmbed], components: [] });

                        await target.send(`${mute} You have been **muted** in **${message.guild.name}** for **${durationString}**!`).catch(() => null);
                    } catch (error) {
                        await i.update({ content: `${error} Failed to mute **${target.tag}**.`, components: [] });
                    }
                } else if (i.customId === "cancel_mute") {
                    await i.update({ content: `${error} Mute cancelled.`, components: [] });
                }
                collector.stop();
            });

            collector.on("end", async (_, reason) => {
                if (reason === "time") {
                    await msg.edit({ components: [] }).catch(() => null);
                    await message.reply(`${error} Confirmation timed out.`);
                }
            });

        } catch (err) {
            console.error(`❌ Error in ${module.exports.conf.name} command:`, err);
            message.reply(`${error} An error occurred while executing this command.`);
        }
    }
};
