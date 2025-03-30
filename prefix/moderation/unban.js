global.deps.discordjs = require("discord.js");

exports.run = async (client, message, args) => {
    if (!message.member.permissions.has(global.deps.discordjs.PermissionFlagsBits.BanMembers)) {
        return message.reply(`${global.deps.config.settings.emojis.error} | You don't have permission to unban members.`);
    }

    const userId = args[0];
    if (!userId || isNaN(userId)) {
        return message.reply(`${global.deps.config.settings.emojis.error} | Please provide a valid user ID.`);
    }

    const bannedUsers = await message.guild.bans.fetch();
    const bannedUser = bannedUsers.get(userId);

    if (!bannedUser) {
        return message.reply(`${global.deps.config.settings.emojis.error} | This user is not banned.`);
    }

    const confirmEmbed = new global.deps.discordjs.EmbedBuilder()
        .setColor(global.deps.config.settings.colors.embeds.unban || global.deps.config.settings.colors.embeds.default)
        .setDescription(`Are you sure you want to unban **${bannedUser.user.tag}**?`);

    const buttons = new global.deps.discordjs.ActionRowBuilder().addComponents(
        new global.deps.discordjs.ButtonBuilder()
            .setCustomId("confirm_unban")
            .setLabel("Confirm")
            .setStyle(global.deps.discordjs.ButtonStyle.Success)
            .setEmoji(global.deps.config.settings.emojis.success),
        new global.deps.discordjs.ButtonBuilder()
            .setCustomId("cancel_unban")
            .setLabel("Cancel")
            .setStyle(global.deps.discordjs.ButtonStyle.Danger)
            .setEmoji(global.deps.config.settings.emojis.error)
    );

    const msg = await message.reply({ embeds: [confirmEmbed], components: [buttons] });

    const collector = msg.createMessageComponentCollector({ time: 15000 });
    collector.on("collect", async (interaction) => {
        if (interaction.user.id !== message.author.id) return;

        if (interaction.customId === "confirm_unban") {
            await message.guild.bans.remove(userId);
            await interaction.update({ content: `${global.deps.config.settings.emojis.success} | **${bannedUser.user.tag}** has been unbanned.`, embeds: [], components: [] });

            bannedUser.user.send(`${global.deps.config.settings.emojis.notification} | You have been unbanned from **${message.guild.name}**.`).catch(() => null);
        } else {
            await interaction.update({ content: `${global.deps.config.settings.emojis.error} | Unban canceled.`, embeds: [], components: [] });
        }
    });
};

exports.conf = {
    name: "unban",
    aliases: ["pardon", "liftban"],
    description: "Unbans a user from the server.",
    category: "moderation"
};
