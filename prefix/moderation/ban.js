exports.name = "ban";
exports.aliases = ["banish", "remove"];
exports.description = "Ban a user from the server.";
exports.usage = "<user> [reason]";
exports.category = "moderation";

exports.conf = {
    enabled: true, // Enable or disable the command
    cooldown: 5, // Cooldown in seconds
    requiredPermissions: ["BanMembers"], // Permissions required to use the command
};

exports.run = async (client, message, args) => {

    // Check if the user has permission to ban members
    if (!message.member.permissions.has(global.deps.discordjs.PermissionsBitField.Flags.BanMembers)) {
        return message.reply(`${global.deps.config.settings.emojis.error} You don't have permission to ban members!`);
    }

    // Ensure the bot has ban permissions
    if (!message.guild.members.me.permissions.has(global.deps.discordjs.PermissionsBitField.Flags.BanMembers)) {
        return message.reply(`${global.deps.config.settings.emojis.error} I don't have permission to ban members!`);
    }

    // Get target user
    const target = message.mentions.users.first() || client.users.cache.get(args[0]);
    if (!target) {
        return message.reply(`${global.deps.config.settings.emojis.error} Please mention a user to ban!`);
    }

    // Get reason for the ban
    const reason = args.slice(1).join(" ") || "No reason provided";

    // Fetch the member from the server
    const member = await message.guild.members.fetch(target.id).catch(() => null);
    if (!member) {
        return message.reply(`${global.deps.config.settings.emojis.error} User is not in the server!`);
    }

    // Check if the bot can ban the user (hierarchy check)
    if (member.roles.highest.position >= message.guild.members.me.roles.highest.position) {
        return message.reply(`${global.deps.config.settings.emojis.error} I cannot ban this user due to role hierarchy.`);
    }

    // Confirmation prompt with reactions ✅ ❌
    const embed = new global.deps.discordjs.EmbedBuilder()
        .setColor(global.deps.config.settings.colors.embeds.default)
        .setDescription(`Are you sure you want to ban **${target.tag}**?\n**Reason:** ${reason}`);

    const msg = await message.reply({ embeds: [embed] });

    await msg.react(global.deps.config.settings.emojis.success); // ✅ Confirm
    await msg.react(global.deps.config.settings.emojis.error); // ❌ Cancel

    const filter = (reaction, user) => 
        [global.deps.config.settings.emojis.success, global.deps.config.settings.emojis.error].includes(reaction.emoji.name) &&
        user.id === message.author.id;

    const collector = msg.createReactionCollector({ filter, time: 15000 });

    collector.on("collect", async (reaction) => {
        if (reaction.emoji.name === global.deps.config.settings.emojis.success) {
            try {
                await member.ban({ reason });

                const confirmEmbed = new global.deps.discordjs.EmbedBuilder()
                    .setColor(global.deps.config.settings.colors.embeds.default)
                    .setDescription(`${global.deps.config.settings.emojis.success} Banned **${target.tag}**.\n**Reason:** ${reason}`);

                await message.reply({ embeds: [confirmEmbed] });

                // Send DM only if ban was successful
                await target.send(`${global.deps.config.settings.emojis.ban} You have been **banned** from **${message.guild.name}**!\n**Reason:** ${reason}`).catch(() => null);
            } catch (error) {
                await message.reply({ content: `${global.deps.config.settings.emojis.error} Failed to ban **${target.tag}**. I may not have permission to ban them.` });
            }
        } else if (reaction.emoji.name === global.deps.config.settings.emojis.error) {
            const cancelEmbed = new global.deps.discordjs.EmbedBuilder()
                .setColor(global.deps.config.settings.colors.embeds.default)
                .setDescription(`${global.deps.config.settings.emojis.error} Ban cancelled.`);

            await message.reply({ embeds: [cancelEmbed] });
        }

        collector.stop(); // Stop collecting reactions after a response
    });

    collector.on("end", async (_, reason) => {
        if (reason === "time") {
            await message.reply(`${global.deps.config.settings.emojis.error} Ban confirmation timed out.`);
        }
    });
};

exports.conf = {
    name: "ban", // ✅ Fix: This was missing
    enabled: true,
    cooldown: 5,
    requiredPermissions: ["BanMembers"],
};
