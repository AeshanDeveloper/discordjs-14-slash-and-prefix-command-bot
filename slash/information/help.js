const path = global.deps.path;

module.exports = {
    conf: {
        name: "help", // Command Name
        category: path.basename(path.dirname(__filename)) // Command Category (must match settings.json)
    },

    data: new global.deps.discordjs.SlashCommandBuilder()
        .setName("help")
        .setDescription("Displays a list of all commands or info about a specific command.")
        .addStringOption(option =>
            option.setName("command")
                .setDescription("Get details about a specific command.")
                .setRequired(false)
        ),

    run: async (client, interaction) => {
        try {
            const commandName = interaction.options.getString("command")?.toLowerCase();
            const emojis = global.deps.config.settings.emojis;
            

            const embed = new global.deps.discordjs.EmbedBuilder()
                .setColor(global.deps.config.settings.colors.embeds.default)
                .setTitle(`${emojis.info} Help Menu`)
                .setFooter({
                    text: `Requested by ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                });

            if (commandName) {
                const cmd = client.slashCommands.get(commandName);
                if (!cmd) {
                    return interaction.reply({
                        content: `${emojis.error} Command \`${commandName}\` not found!`,
                        flags: 64
                    });
                }

                embed.setDescription(`${emojis.command} **Name:** ${cmd.conf.name}\n${emojis.description} **Description:** ${cmd.data.description || "No description"}\n${emojis.usage} **Usage:** \`/${cmd.conf.name}\``);
                return interaction.reply({ embeds: [embed] });
            }

            const commands = [...client.slashCommands.values()];
            const commandsPerPage = 5;
            const totalPages = Math.ceil(commands.length / commandsPerPage);
            let currentPage = 0;

            const getPage = (page) => {
                const start = page * commandsPerPage;
                const end = start + commandsPerPage;
                return commands.slice(start, end).map(cmd => `${emojis.slash} \`/${cmd.conf.name}\` - ${cmd.data.description || "No description"}`).join("\n") || `${emojis.error} No commands found!`;
            };

            embed.setDescription(getPage(currentPage))
                .setFooter({
                    text: `Page ${currentPage + 1} of ${totalPages} | Requested by ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                });

            const firstBtn = new global.deps.discordjs.ButtonBuilder()
                .setCustomId("first")
                .setEmoji(emojis.first)
                .setStyle(2)
                .setDisabled(currentPage === 0);

            const prevBtn = new global.deps.discordjs.ButtonBuilder()
                .setCustomId("previous")
                .setEmoji(emojis.previous)
                .setStyle(2)
                .setDisabled(currentPage === 0);

            const nextBtn = new global.deps.discordjs.ButtonBuilder()
                .setCustomId("next")
                .setEmoji(emojis.next)
                .setStyle(2)
                .setDisabled(currentPage === totalPages - 1);

            const lastBtn = new global.deps.discordjs.ButtonBuilder()
                .setCustomId("last")
                .setEmoji(emojis.last)
                .setStyle(2)
                .setDisabled(currentPage === totalPages - 1);

            const row = new global.deps.discordjs.ActionRowBuilder().addComponents(firstBtn, prevBtn, nextBtn, lastBtn);

            const message = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

            const collector = message.createMessageComponentCollector({ time: 60000 });

            collector.on("collect", async (i) => {
                if (i.user.id !== interaction.user.id) {
                    return i.reply({ content: `${emojis.error} You cannot control this menu!`, flags: 64 });
                }

                if (i.customId === "first") currentPage = 0;
                if (i.customId === "previous" && currentPage > 0) currentPage--;
                if (i.customId === "next" && currentPage < totalPages - 1) currentPage++;
                if (i.customId === "last") currentPage = totalPages - 1;

                embed.setDescription(getPage(currentPage))
                    .setFooter({
                        text: `Page ${currentPage + 1} of ${totalPages} | Requested by ${interaction.user.tag}`,
                        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                    });

                firstBtn.setDisabled(currentPage === 0);
                prevBtn.setDisabled(currentPage === 0);
                nextBtn.setDisabled(currentPage === totalPages - 1);
                lastBtn.setDisabled(currentPage === totalPages - 1);

                await i.update({ embeds: [embed], components: [row] });
            });

            collector.on("end", () => {
                interaction.editReply({ components: [] });
            });

        } catch (error) {
            console.error(`❌ Error in ${module.exports.conf.name} command:`, error);
            interaction.reply({
                content: `${global.deps.config.settings.emojis.error} An error occurred while executing this command.`,
                flags: 64
            });
        }
    }
};
