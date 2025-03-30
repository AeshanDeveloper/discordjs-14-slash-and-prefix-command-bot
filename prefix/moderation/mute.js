global.deps.discordjs = require("discord.js");

exports.run = async (client, message, args) => {
    if (!message.member.permissions.has(global.deps.discordjs.PermissionsBitField.Flags.ModerateMembers)) {
        return message.reply(`${global.deps.config.settings.emojis.error} You do not have permission to mute members.`);
    }

    const user = message.mentions.members.first() || await message.guild.members.fetch(args[0]).catch(() => null);
    if (!user) {
        return message.reply(`${global.deps.config.settings.emojis.error} Please mention a valid user or provide a valid user ID.`);
    }

    if (user.communicationDisabledUntil) {
        return message.reply(`${global.deps.config.settings.emojis.error} This user is already muted.`);
    }

    const duration = args[1];
    if (!duration || isNaN(ms(duration))) {
        return message.reply(`${global.deps.config.settings.emojis.error} Please provide a valid duration (e.g., 10m, 1h, 2d).`);
    }

    const reason = args.slice(2).join(" ") || "No reason provided";

    const row = new global.deps.discordjs.ActionRowBuilder()
        .addComponents(
            new global.deps.discordjs.ButtonBuilder()
                .setCustomId("confirm_mute")
                .setLabel("Confirm")
                .setStyle(global.deps.discordjs.ButtonStyle.Success)
                .setEmoji(global.deps.config.settings.emojis.success),
            new global.deps.discordjs.ButtonBuilder()
                .setCustomId("cancel_mute")
                .setLabel("Cancel")
                .setStyle(global.deps.discordjs.ButtonStyle.Danger)
                .setEmoji(global.deps.config.settings.emojis.error)
        );

    const embed = new global.deps.discordjs.EmbedBuilder()
        .setColor(global.deps.config.settings.colors.embeds.mute)
        .setTitle(`${global.deps.config.settings.emojis.mute} Mute Confirmation`)
        .setDescription(`Are you sure you want to mute **${user.user.tag}**?\n\n**Duration:** ${duration}\n**Reason:** ${reason}`);

    const msg = await message.channel.send({ embeds: [embed], components: [row] });

    const filter = i => i.user.id === message.author.id;
    const collector = msg.createMessageComponentCollector({ filter, time: 15000 });

    collector.on("collect", async interaction => {
        if (interaction.customId === "confirm_mute") {
            await user.timeout(ms(duration), reason).catch(() => {
                return interaction.reply({ content: `${global.deps.config.settings.emojis.error} Failed to mute ${user.user.tag}.`, flags: 64 });
            });

            const successEmbed = new global.deps.discordjs.EmbedBuilder()
                .setColor(global.deps.config.settings.colors.embeds.mute)
                .setTitle(`${global.deps.config.settings.emojis.success} Mute Successful`)
                .setDescription(`**${user.user.tag}** has been muted.\n\n**Duration:** ${duration}\n**Reason:** ${reason}`);

            await interaction.update({ embeds: [successEmbed], components: [] });

            // Notify the muted user
            user.send({
                embeds: [
                    new global.deps.discordjs.EmbedBuilder()
                        .setColor(global.deps.config.settings.colors.embeds.mute)
                        .setTitle(`${global.deps.config.settings.emojis.notification} You have been muted`)
                        .setDescription(`You have been muted in **${message.guild.name}**.\n\n**Duration:** ${duration}\n**Reason:** ${reason}`)
                ]
            }).catch(() => null);
        } else if (interaction.customId === "cancel_mute") {
            await interaction.update({ content: `${global.deps.config.settings.emojis.error} Mute cancelled.`, embeds: [], components: [] });
        }
    });

    collector.on("end", collected => {
        if (collected.size === 0) {
            msg.edit({ content: `${global.deps.config.settings.emojis.error} Mute request timed out.`, embeds: [], components: [] });
        }
    });
};

exports.conf = {
    name: "mute",
    aliases: ["silence", "timeout"],
    description: "Mutes a user for a specified duration.",
    category: "moderation"
};
