exports.conf = {
    name: "help", // ✅ This should exist!
    description: "Displays a list of all commands or info about a specific command.",
    usage: "help [command]",
    aliases: ["commands", "h"]
};

exports.run = async (client, message, args) => {
    const commandName = args[0]?.toLowerCase();
    let embed = new global.deps.discordjs.EmbedBuilder()
        .setColor(global.deps.config.settings.colors.embeds.default)
        .setTitle(`${global.deps.config.settings.emojis.info} Help Menu`)
        .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });

    if (!commandName) {
        let commandList = client.prefixCommands.map(cmd => `\`${cmd.conf.name}\` - ${cmd.conf.description || "No description"}`).join("\n");
        embed.setDescription(commandList || `${global.deps.config.settings.emojis.error} No commands found!`);
        return message.channel.send({ embeds: [embed] });
    }

    const cmd = client.prefixCommands.get(commandName) || client.prefixCommands.get(client.prefixAliases.get(commandName));
    if (!cmd) {
        return message.channel.send(`${global.deps.config.settings.emojis.error} Command \`${commandName}\` not found!`);
    }

    embed.setDescription(`**Name:** ${cmd.conf.name}\n**Description:** ${cmd.conf.description || "No description"}\n**Usage:** \`${cmd.conf.usage || "No usage info"}\``);
    message.channel.send({ embeds: [embed] });
};
