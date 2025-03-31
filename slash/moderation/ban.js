const path = global.deps.path;

module.exports = {
    conf: {
        name: "ban",
        category: path.basename(path.dirname(__filename))
    },

    data: new global.deps.discordjs.SlashCommandBuilder()
        .setName("ban")
        .setDescription("Ban a user from the server.")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("The user to ban")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("reason")
                .setDescription("Reason for banning")
                .setRequired(false)),

    run: async (client, interaction) => {
        try {
            const { discordjs, config } = global.deps;
            const { PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = discordjs;
            const { success, error, ban } = config.settings.emojis;
            const { default: embedColor } = config.settings.colors.embeds;

            const user = interaction.options.getUser("user");
            const reason = interaction.options.getString("reason") || "No reason provided";
            const member = await interaction.guild.members.fetch(user.id).catch(() => null);

            if (!member) return interaction.reply({ content: `${error} User is not in the server!`, flags: 64 });

            if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers))
                return interaction.reply({ content: `${error} You don't have permission to ban members!`, flags: 64 });

            if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers))
                return interaction.reply({ content: `${error} I don't have permission to ban members!`, flags: 64 });

            if (member.roles.highest.position >= interaction.guild.members.me.roles.highest.position)
                return interaction.reply({ content: `${error} I cannot ban this user due to role hierarchy.`, flags: 64 });

            // Create confirmation buttons
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

            const confirmEmbed = new EmbedBuilder()
                .setColor(embedColor)
                .setDescription(`⚠️ Are you sure you want to ban **${user.tag}**?\n**Reason:** ${reason}`);

            const message = await interaction.reply({ embeds: [confirmEmbed], components: [row], fetchReply: true });

            // Collect button interaction
            const filter = (i) => i.user.id === interaction.user.id;
            const collector = message.createMessageComponentCollector({ filter, time: 15000 });

            collector.on("collect", async (i) => {
                if (i.customId === "confirm_ban") {
                    await member.ban({ reason });

                    const bannedEmbed = new EmbedBuilder()
                        .setColor(embedColor)
                        .setDescription(`${success} Banned **${user.tag}**.\n**Reason:** ${reason}`);

                    await interaction.editReply({ embeds: [bannedEmbed], components: [] });

                    await user.send(`${ban} You have been **banned** from **${interaction.guild.name}**!\n**Reason:** ${reason}`).catch(() => null);
                } else if (i.customId === "cancel_ban") {
                    await interaction.editReply({ content: `${error} Ban canceled.`, components: [] });
                }

                collector.stop();
            });

            collector.on("end", async (_, reason) => {
                if (reason === "time") {
                    await interaction.editReply({ content: `${error} Confirmation timed out.`, components: [] });
                }
            });

        } catch (err) {
            console.error(`❌ Error in ${module.exports.conf.name} command:`, err);
            interaction.reply({ content: `${global.deps.config.settings.emojis.error} An error occurred while executing this command.`, flags: 64 });
        }
    }
};
