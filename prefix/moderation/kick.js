const path = global.deps.path;
module.exports = {
    conf: {
        name: "kick",
        aliases: ["boot", "remove"],
        category: path.basename(path.dirname(__filename))
    },

    run: async (client, message, args) => {
        try {
            const { discordjs, config } = global.deps;
            const { PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = discordjs;
            const { success, error, kick } = config.settings.emojis;
            const { default: embedColor } = config.settings.colors.embeds;

            if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
                return message.reply(`${error} You don't have permission to kick members!`);
            }

            if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.KickMembers)) {
                return message.reply(`${error} I don't have permission to kick members!`);
            }

            const target = message.mentions.users.first() || client.users.cache.get(args[0]);
            if (!target) {
                return message.reply(`${error} Please mention a user to kick!`);
            }

            const reason = args.slice(1).join(" ") || "No reason provided";

            const member = await message.guild.members.fetch(target.id).catch(() => null);
            if (!member) {
                return message.reply(`${error} User is not in the server!`);
            }

            if (
                member.roles.highest.position >= message.guild.members.me.roles.highest.position ||
                member.roles.highest.position >= message.member.roles.highest.position
            ) {
                return message.reply(`${error} You cannot kick this user due to role hierarchy.`);
            }

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("confirm_kick")
                    .setLabel("Confirm")
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId("cancel_kick")
                    .setLabel("Cancel")
                    .setStyle(ButtonStyle.Danger)
            );

            const embed = new EmbedBuilder()
                .setColor(embedColor)
                .setDescription(`Are you sure you want to kick **${target.tag}**?\n**Reason:** ${reason}`);

            const msg = await message.reply({ embeds: [embed], components: [row] });

            const collector = msg.createMessageComponentCollector({
                filter: (i) => i.user.id === message.author.id,
                time: 15000
            });

            collector.on("collect", async (interaction) => {
                if (interaction.customId === "confirm_kick") {
                    try {
                        await member.kick(reason);

                        const kickedEmbed = new EmbedBuilder()
                            .setColor(embedColor)
                            .setDescription(`${success} Kicked **${target.tag}**.\n**Reason:** ${reason}`);

                        await interaction.update({ embeds: [kickedEmbed], components: [] });

                        await target.send(`${kick} You have been **kicked** from **${message.guild.name}**!\n**Reason:** ${reason}`).catch(() => null);
                    } catch (error) {
                        await interaction.update({ content: `${error} Failed to kick **${target.tag}**.`, components: [] });
                    }
                } else if (interaction.customId === "cancel_kick") {
                    await interaction.update({ content: `${error} Kick cancelled.`, components: [] });
                }
            });

            collector.on("end", async (_, reason) => {
                if (reason === "time") {
                    await msg.edit({ components: [] }).catch(() => null);
                }
            });

        } catch (err) {
            console.error(`❌ Error in ${module.exports.conf.name} command:`, err);
            message.reply(`${global.deps.config.settings.emojis.error} An error occurred while executing this command.`);
        }
    }
};
