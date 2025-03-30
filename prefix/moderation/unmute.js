global.deps.discordjs = require("discord.js");

exports.run = async (client, message, args) => {
    if (!message.member.permissions.has(global.deps.discordjs.PermissionsBitField.Flags.ModerateMembers)) {
        return message.reply(`${global.deps.config.settings.emojis.error} You do not have permission to unmute members.`);
    }

    const user = message.mentions.members.first() || await message.guild.members.fetch(args[0]).catch(() => null);
    if (!user) {
        return message.reply(`${global.deps.config.settings.emojis.error} Please mention a valid user or provide a valid user ID.`);
    }

    if (!user.communicationDisabledUntil) {
        return message.reply(`${global.deps.config.settings.emojis.error} This user is not muted.`);
    }

    const reason = args.slice(1).join(" ") || "No reason provided";

    const row = new global.deps.discordjs.ActionRowBuilder()
        .addComponents(
            new global.deps.discordjs.ButtonBuilder()
                .setCustomId("confirm_unmute")
                .setLabel("Confirm")
                .setStyle(global.deps.discordjs.ButtonStyle.Success)
                .setEmoji(global.deps.config.settings.emojis.success),
            new global.deps.discordjs.ButtonBuilder()
                .setCustomId("cancel_unmute")
                .setLabel("Cancel")
                .setStyle(global.deps.discordjs.ButtonStyle.Danger)
                .setEmoji(global.deps.config.settings.emojis.error)
        );

    const embed = new global.deps.discordjs.EmbedBuilder()
        .setColor(global.deps.config.settings.colors.embeds.unmute)
        .setTitle(`${global.deps.config.settings.emojis.unmute} Unmute Confirmation`)
        .setDescription(`Are you sure you want to unmute **${user.user.tag}**?\n\n**Reason:** ${reason}`);

    const msg = await message.channel.send({ embeds: [embed], components: [row] });

    const filter = i => i.user.id === message.author.id;
    const collector = msg.createMessageComponentCollector({ filter, time: 15000 });

    collector.on("collect", async interaction => {
        if (interaction.customId === "confirm_unmute") {
            await user.timeout(null).catch(() => {
                return interaction.reply({ content: `${global.deps.config.settings.emojis.error} Failed to unmute ${user.user.tag}.`, flags: 64 });
            });

            const successEmbed = new global.deps.discordjs.EmbedBuilder()
                .setColor(global.deps.config.settings.colors.embeds.unmute)
                .setTitle(`${global.deps.config.settings.emojis.success} Unmute Successful`)
                .setDescription(`**${user.user.tag}** has been unmuted.\n\n**Reason:** ${reason}`);

            await interaction.update({ embeds: [successEmbed], components: [] });

            // Notify the unmuted user
            user.send({
                embeds: [
                    new global.deps.discordjs.EmbedBuilder()
                        .setColor(global.deps.config.settings.colors.embeds.unmute)
                        .setTitle(`${global.deps.config.settings.emojis.notification} You have been unmuted`)
                        .setDescription(`You have been unmuted in **${message.guild.name}**.\n\n**Reason:** ${reason}`)
                ]
            }).catch(() => null);
        } else if (interaction.customId === "cancel_unmute") {
            await interaction.update({ content: `${global.deps.config.settings.emojis.error} Unmute cancelled.`, embeds: [], components: [] });
        }
    });

    collector.on("end", collected => {
        if (collected.size === 0) {
            msg.edit({ content: `${global.deps.config.settings.emojis.error} Unmute request timed out.`, embeds: [], components: [] });
        }
    });
};

exports.conf = {
    name: "unmute",
    aliases: ["unsilence", "remove-timeout"],
    description: "Unmutes a user.",
    category: "moderation"
};
