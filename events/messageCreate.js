const config = require("../config.js");
const client = require("../index.js");

client.on("messageCreate", async (message) => {
    // Ignore the message if it's from a bot, not from a server, or doesn't start with the prefix
    if (!message.guild || message.author.bot || !message.content.startsWith(config.prefix)) return;

    let commandName = message.content.toLowerCase().split(" ")[0].slice(config.prefix.length);  // Get the command name
    let args = message.content.split(" ").slice(1);  // Get arguments for the command
    let command = client.prefixCommands.get(commandName) || client.prefixCommands.get(client.prefixAliases.get(commandName));  // Get the command from the prefixCommands map

    if (!command) return;  // If command is not found, exit

    let categorySettings = config.settings.commands[command.conf?.category];  // Get category settings
    let commandSettings = categorySettings?.[command.conf?.name];  // Get command-specific settings

    if (!categorySettings?.enabled || !commandSettings?.enabled) return;  // If category or command is disabled, exit

    // Check for owner-only or admin-only commands
    if (commandSettings.ownerOnly) {
        // Combine bot owners, administrators, and physical owners for permission checking
        const allowedUsers = [...config.settings.bot_owners, ...config.settings.administrators, ...config.settings.physical_owners];
        
        if (!allowedUsers.includes(message.author.id)) {
            return message.reply(`${config.settings.emojis.error} This command is only for bot owners or administrators!`);
        }
    }

    // Execute the command
    try {
        await command.run(client, message, args);
    } catch (error) {
        console.error(`❌ Error in "${command.conf?.name}":`, error);
        message.reply(`${config.settings.emojis.error} An error occurred while executing this command.`);
    }
});
