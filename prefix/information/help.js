const path = global.deps.path;

module.exports = {
    conf: {
        name: "help", // Command Name
        aliases: ["h"], // Alternative names
        category: path.basename(path.dirname(__filename)) // Command Category (must match settings.json)
    },

    run: async (client, message, args) => {
        try {
            const commandName = args[0]?.toLowerCase();
            const emojis = global.deps.config.settings.emojis;

            const embed = new global.deps.discordjs.EmbedBuilder()
                .setColor(global.deps.config.settings.colors.embeds.help)
                .setTitle(`${emojis.info} Help Menu`)
                .setFooter({
                    text: `Requested by ${message.author.tag}`,
                    iconURL: message.author.displayAvatarURL({ dynamic: true })
                });

            if (commandName) {
                const cmd = client.prefixCommands.get(commandName) || client.prefixCommands.get(client.prefixAliases.get(commandName));
                if (!cmd) {
                    return message.reply(`${emojis.error} Command \`${commandName}\` not found!`);
                }

                embed.setDescription(`${emojis.command} **Name:** ${cmd.conf.name}\n${emojis.description} **Category:** ${cmd.conf.category}\n${emojis.usage} **Usage:** \`${global.deps.config.prefix}${cmd.conf.name}\``);
                return message.reply({ embeds: [embed] });
            }

            const commands = [...client.prefixCommands.values()];
            const commandsPerPage = 5;
            const totalPages = Math.ceil(commands.length / commandsPerPage);
            let currentPage = 0;

            const getPage = (page) => {
                const start = page * commandsPerPage;
                const end = start + commandsPerPage;
                return commands.slice(start, end).map(cmd => `${emojis.bullet_point} \`${global.deps.config.prefix}${cmd.conf.name}\``).join("\n") || `${emojis.error} No commands found!`;
            };

            embed.setDescription(getPage(currentPage))
                .setFooter({
                    text: `Page ${currentPage + 1} of ${totalPages} | Requested by ${message.author.tag}`,
                    iconURL: message.author.displayAvatarURL({ dynamic: true })
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

            const msg = await message.reply({ embeds: [embed], components: [row] });

            const collector = msg.createMessageComponentCollector({ time: 60000 });

            collector.on("collect", async (i) => {
                if (i.user.id !== message.author.id) {
                    return i.reply({ content: `${emojis.error} You cannot control this menu!`, ephemeral: true });
                }

                if (i.customId === "first") currentPage = 0;
                if (i.customId === "previous" && currentPage > 0) currentPage--;
                if (i.customId === "next" && currentPage < totalPages - 1) currentPage++;
                if (i.customId === "last") currentPage = totalPages - 1;

                embed.setDescription(getPage(currentPage))
                    .setFooter({
                        text: `Page ${currentPage + 1} of ${totalPages} | Requested by ${message.author.tag}`,
                        iconURL: message.author.displayAvatarURL({ dynamic: true })
                    });

                firstBtn.setDisabled(currentPage === 0);
                prevBtn.setDisabled(currentPage === 0);
                nextBtn.setDisabled(currentPage === totalPages - 1);
                lastBtn.setDisabled(currentPage === totalPages - 1);

                await i.update({ embeds: [embed], components: [row] });
            });

            collector.on("end", () => {
                msg.edit({ components: [] }).catch(() => { });
            });

        } catch (error) {
            console.error(`❌ Error in ${module.exports.conf.name} command:`, error);
            message.reply(`${global.deps.config.settings.emojis.error} An error occurred while executing this command.`);
        }
    }
};
