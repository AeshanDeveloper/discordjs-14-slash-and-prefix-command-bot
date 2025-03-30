exports.name = "mute"; // Ensure this exists
exports.aliases = ["silence", "timeout"];
exports.description = "Mute a user in the server.";
exports.usage = "<user> <duration>";
exports.category = "moderation";

exports.run = async (client, message, args) => {
    if (!message.member.permissions.has(global.deps.discordjs.PermissionsBitField.Flags.MuteMembers)) {
        return message.reply(`${global.deps.config.settings.emojis.error} You don't have permission to mute members!`);
    }

    const target = message.mentions.users.first() || client.users.cache.get(args[0]);
    const durationString = args[1]?.toLowerCase();

    if (!target || !durationString) {
        return message.reply(`${global.deps.config.settings.emojis.error} Usage: \`${message.prefix}mute <user> <duration>\`\nExample: \`${message.prefix}mute @user 10m\``);
    }

    const member = await message.guild.members.fetch(target.id).catch(() => null);
    if (!member) {
        return message.reply(`${global.deps.config.settings.emojis.error} User is not in the server!`);
    }

    // Function to convert time string (e.g., "10m", "2h") to milliseconds
    function parseDuration(input) {
        const match = input.match(/^(\d+)(s|m|h|d)$/);
        if (!match) return null;

        const value = parseInt(match[1]);
        const unit = match[2];

        switch (unit) {
            case "s": return value * 1000;         // Seconds
            case "m": return value * 60 * 1000;    // Minutes
            case "h": return value * 60 * 60 * 1000; // Hours
            case "d": return value * 24 * 60 * 60 * 1000; // Days
            default: return null;
        }
    }

    const durationMs = parseDuration(durationString);
    if (!durationMs) {
        return message.reply(`${global.deps.config.settings.emojis.error} Invalid duration format! Use **Xs, Xm, Xh, or Xd** (e.g., 10m, 2h, 1d).`);
    }

    const row = new global.deps.discordjs.ActionRowBuilder().addComponents(
        new global.deps.discordjs.ButtonBuilder()
            .setCustomId("confirm_mute")
            .setLabel("Confirm")
            .setStyle(global.deps.discordjs.ButtonStyle.Success),
        new global.deps.discordjs.ButtonBuilder()
            .setCustomId("cancel_mute")
            .setLabel("Cancel")
            .setStyle(global.deps.discordjs.ButtonStyle.Danger)
    );

    const embed = new global.deps.discordjs.EmbedBuilder()
        .setColor(global.deps.config.settings.colors.embeds.default)
        .setDescription(`Are you sure you want to mute **${target.tag}** for **${durationString}**?`);

    const msg = await message.reply({ embeds: [embed], components: [row] });

    const collector = msg.createMessageComponentCollector({
        filter: (i) => i.user.id === message.author.id,
        time: 15000
    });

    collector.on("collect", async (interaction) => {
        if (interaction.customId === "confirm_mute") {
            try {
                await member.timeout(durationMs);

                const confirmEmbed = new global.deps.discordjs.EmbedBuilder()
                    .setColor(global.deps.config.settings.colors.embeds.default)
                    .setDescription(`${global.deps.config.settings.emojis.success} Muted **${target.tag}** for **${durationString}**.`);

                await interaction.update({ embeds: [confirmEmbed], components: [] });

                // Send DM only if mute was successful
                await target.send(`${global.deps.config.settings.emojis.mute} You have been **muted** in **${message.guild.name}** for **${durationString}**!`).catch(() => null);
            } catch (error) {
                await interaction.update({ content: `${global.deps.config.settings.emojis.error} Failed to mute **${target.tag}**. I may not have permission to mute them.`, embeds: [], components: [] });
            }
        } else if (interaction.customId === "cancel_mute") {
            const cancelEmbed = new global.deps.discordjs.EmbedBuilder()
                .setColor(global.deps.config.settings.colors.embeds.default)
                .setDescription(`${global.deps.config.settings.emojis.error} Mute cancelled.`);

            await interaction.update({ embeds: [cancelEmbed], components: [] });
        }
    });

    collector.on("end", async (_, reason) => {
        if (reason === "time") {
            await msg.edit({ components: [] }).catch(() => null);
        }
    });
};
