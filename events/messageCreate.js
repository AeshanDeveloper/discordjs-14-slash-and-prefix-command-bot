const config = require("../config.js");
const client = require("../index.js");

client.on("messageCreate", async (message) => {
    if (!message.guild || message.author.bot || !message.content.startsWith(config.prefix)) return;

    let commandName = message.content.toLowerCase().split(" ")[0].slice(config.prefix.length);
    let args = message.content.split(" ").slice(1);
    let command = client.prefixCommands.get(commandName) || client.prefixCommands.get(client.prefixAliases.get(commandName));

    if (!command) return;

    let categorySettings = config.settings.commands[command.conf?.category];
    let commandSettings = categorySettings?.[command.conf?.name];

    if (!categorySettings?.enabled || !commandSettings?.enabled) return;

    // Check for owner-only commands
    if (commandSettings.ownerOnly && !config.settings["bot-owners"].includes(message.author.id)) {
        return message.reply(`${config.settings.emojis.error} This command is only for bot owners!`);
    }

    // Execute the command
    try {
        await command.run(client, message, args);
    } catch (error) {
        console.error(`❌ Error in "${command.conf?.name}":`, error);
        message.reply(`${config.settings.emojis.error} An error occurred while executing this command.`);
    }
});
