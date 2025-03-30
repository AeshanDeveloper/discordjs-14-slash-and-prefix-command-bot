global.deps.discordjs = require("discord.js");

exports.run = async (client, message, args) => {
    if (!message.member.permissions.has(global.deps.discordjs.PermissionFlagsBits.BanMembers)) {
        return message.reply(`${global.deps.config.settings.emojis.error} | You don't have permission to ban members.`);
    }

    const user = message.mentions.users.first() || await client.users.fetch(args[0]).catch(() => null);
    if (!user) {
        return message.reply(`${global.deps.config.settings.emojis.error} | Please mention a valid user or provide their ID.`);
    }

    const reason = args.slice(1).join(" ") || "No reason provided";
    const member = await message.guild.members.fetch(user.id).catch(() => null);

    if (!member) {
        return message.reply(`${global.deps.config.settings.emojis.error} | This user is not in the server.`);
    }

    if (!member.bannable) {
        return message.reply(`${global.deps.config.settings.emojis.error} | I can't ban this user.`);
    }

    const confirmEmbed = new global.deps.discordjs.EmbedBuilder()
        .setColor(global.deps.config.settings.colors.embeds.ban)
        .setDescription(`Are you sure you want to ban **${user.tag}**?`);

    const buttons = new global.deps.discordjs.ActionRowBuilder().addComponents(
        new global.deps.discordjs.ButtonBuilder()
            .setCustomId("confirm_ban")
            .setLabel("Confirm")
            .setStyle(global.deps.discordjs.ButtonStyle.Success)
            .setEmoji(global.deps.config.settings.emojis.success),
        new global.deps.discordjs.ButtonBuilder()
            .setCustomId("cancel_ban")
            .setLabel("Cancel")
            .setStyle(global.deps.discordjs.ButtonStyle.Danger)
            .setEmoji(global.deps.config.settings.emojis.error)
    );

    const msg = await message.reply({ embeds: [confirmEmbed], components: [buttons] });

    const collector = msg.createMessageComponentCollector({ time: 15000 });
    collector.on("collect", async (interaction) => {
        if (interaction.user.id !== message.author.id) return;

        if (interaction.customId === "confirm_ban") {
            await member.ban({ reason });
            await interaction.update({ content: `${global.deps.config.settings.emojis.success} | **${user.tag}** has been banned.`, embeds: [], components: [] });
            user.send(`${global.deps.config.settings.emojis.notification} | You have been banned from **${message.guild.name}** for: ${reason}`).catch(() => null);
        } else {
            await interaction.update({ content: `${global.deps.config.settings.emojis.error} | Ban canceled.`, embeds: [], components: [] });
        }
    });
};

exports.conf = {
    name: "ban",
    aliases: ["banish", "remove"],
    description: "Bans a user from the server.",
    category: "moderation"
};
