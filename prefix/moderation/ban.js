const path = global.deps.path;

module.exports = {
    conf: {
        name: "ban",
        aliases: ["banish", "remove"],
        category: path.basename(path.dirname(__filename))
    },

    run: async (client, message, args) => {
        try {
            const { discordjs, config } = global.deps;
            const { PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = discordjs;
            const { success, error, ban } = config.settings.emojis;
            const { default: embedColor } = config.settings.colors.embeds;

            // Check if the user has permission to ban
            if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers))
                return message.reply(`${error} You don't have permission to ban members!`);

            // Ensure the bot has permission
            if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers))
                return message.reply(`${error} I don't have permission to ban members!`);

            // Get target user
            const target = message.mentions.users.first() || client.users.cache.get(args[0]);
            if (!target) return message.reply(`${error} Please mention a user to ban!`);

            // Prevent self-ban
            if (target.id === message.author.id) return message.reply(`${error} You cannot ban yourself!`);

            // Prevent bot ban
            if (target.id === client.user.id) return message.reply(`${error} I cannot ban myself!`);

            // Get reason
            const reason = args.slice(1).join(" ") || "No reason provided";

            // Fetch member from the server
            const member = await message.guild.members.fetch(target.id).catch(() => null);
            if (!member) return message.reply(`${error} User is not in the server!`);

            // Role hierarchy check
            if (
                member.roles.highest.position >= message.guild.members.me.roles.highest.position ||
                member.roles.highest.position >= message.member.roles.highest.position
            ) {
                return message.reply(`${error} You cannot ban this user due to role hierarchy.`);
            }

            // Confirmation buttons
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("confirm_ban")
                    .setLabel("✅ Confirm")
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId("cancel_ban")
                    .setLabel("❌ Cancel")
                    .setStyle(ButtonStyle.Danger)
            );

            // Confirmation embed
            const confirmEmbed = new EmbedBuilder()
                .setColor(embedColor)
                .setDescription(`⚠️ Are you sure you want to ban **${target.tag}**?\n**Reason:** ${reason}`);

            const msg = await message.reply({ embeds: [confirmEmbed], components: [row] });

            // Button interaction collector
            const filter = (i) => i.user.id === message.author.id;
            const collector = msg.createMessageComponentCollector({ filter, time: 15000 });

            collector.on("collect", async (i) => {
                if (i.customId === "confirm_ban") {
                    await member.ban({ reason });

                    const bannedEmbed = new EmbedBuilder()
                        .setColor(embedColor)
                        .setDescription(`${success} Banned **${target.tag}**.\n**Reason:** ${reason}`);

                    await message.reply({ embeds: [bannedEmbed], components: [] });

                    await target.send(`${ban} You have been **banned** from **${message.guild.name}**!\n**Reason:** ${reason}`).catch(() => null);
                } else if (i.customId === "cancel_ban") {
                    await message.reply({ content: `${error} Ban canceled.`, components: [] });
                }

                collector.stop();
            });

            collector.on("end", async (_, reason) => {
                if (reason === "time") {
                    await message.reply({ content: `${error} Confirmation timed out.`, components: [] });
                }
            });

        } catch (err) {
            console.error(`❌ Error in ${module.exports.conf.name} command:`, err);
            message.reply(`${error} An error occurred while executing this command.`);
        }
    }
};
