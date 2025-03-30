exports.name = "help"; // Ensure this exists
exports.description = "Displays a list of all commands or info about a specific command.";
exports.options = [
    {
        name: "command",
        type: 3, // STRING type
        description: "Get details about a specific command.",
        required: false
    }
];

exports.run = async (client, interaction) => {
    const commandName = interaction.options.getString("command")?.toLowerCase();
    const embed = new global.deps.discordjs.EmbedBuilder()
        .setColor(global.deps.config.settings.colors.embeds.default)
        .setTitle(`${global.deps.config.settings.emojis.info} Help Menu`)
        .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });

    if (!commandName) {
        const commandList = client.slashCommands.map(cmd => `\`/${cmd.name}\` - ${cmd.description || "No description"}`).join("\n");
        embed.setDescription(commandList || `${global.deps.config.settings.emojis.error} No commands found!`);
        return interaction.reply({ embeds: [embed] });
    }

    const cmd = client.slashCommands.get(commandName);
    if (!cmd) {
        return interaction.reply({ content: `${global.deps.config.settings.emojis.error} Command \`${commandName}\` not found!`, flags: 64 });
    }

    embed.setDescription(`**Name:** ${cmd.name}\n**Description:** ${cmd.description || "No description"}\n**Usage:** \`/${cmd.name}\``);
    interaction.reply({ embeds: [embed] });
};
