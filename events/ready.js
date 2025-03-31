const client = require("../index");
const { Collection } = global.deps.discordjs;
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const fs = global.deps.fs;
const path = global.deps.path;
const config = require("../config.js");

client.on("ready", async () => {
    try {
        client.prefixCommands = new Collection();
        client.prefixAliases = new Collection();
        client.slashCommands = new Collection();
        const slashCommandsLoader = [];

        // Prefix Commands Loader
        try {
            const prefixCommandFolders = fs.readdirSync("./prefix");
            for (const folder of prefixCommandFolders) {
                const folderPath = path.join("./prefix", folder);
                const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith(".js"));

                const categorySettings = config.settings.commands[folder];
                if (!categorySettings || !categorySettings.enabled) {
                    console.log(`⚠️ Skipping category ${folder}, disabled in settings.`);
                    continue;
                }

                for (const file of commandFiles) {
                    try {
                        const filePath = path.resolve(__dirname, "../", folderPath, file);
                        const props = require(filePath);

                        if (!props.conf || !props.conf.name) {
                            console.log(`⚠️ Skipping ${file} in ${folder}, missing 'conf.name'`);
                            continue;
                        }

                        const commandSettings = categorySettings[props.conf.name];
                        if (!commandSettings || !commandSettings.enabled) {
                            console.log(`⚠️ Skipping ${props.conf.name} in ${folder}, disabled in settings.`);
                            continue;
                        }

                        console.log(`➤ Prefix | ${props.conf.name}/${folder} Command Loaded!`);
                        client.prefixCommands.set(props.conf.name, props);

                        if (props.conf.aliases && Array.isArray(props.conf.aliases)) {
                            props.conf.aliases.forEach(alias => {
                                client.prefixAliases.set(alias, props.conf.name);
                            });
                        }
                    } catch (err) {
                        console.error(`❌ Error loading prefix command ${file} in ${folder}:`, err);
                    }
                }
            }
        } catch (err) {
            console.error("❌ Error loading prefix commands:", err);
        }

        // Slash Commands Loader
        try {
            const slashCommandFolders = fs.readdirSync("./slash");
            for (const folder of slashCommandFolders) {
                const folderPath = path.join("./slash", folder);
                const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith(".js"));

                const categorySettings = config.settings.commands[folder];
                if (!categorySettings || !categorySettings.enabled) {
                    console.log(`⚠️ Skipping category ${folder}, disabled in settings.`);
                    continue;
                }

                for (const file of commandFiles) {
                    try {
                        const filePath = path.resolve(__dirname, "../", folderPath, file);
                        const props = require(filePath);

                        if (!props.name) {
                            console.log(`⚠️ Skipping ${file} in ${folder}, missing 'name'`);
                            continue;
                        }

                        const commandSettings = categorySettings[props.name];
                        if (!commandSettings || !commandSettings.enabled) {
                            console.log(`⚠️ Skipping ${props.name} in ${folder}, disabled in settings.`);
                            continue;
                        }

                        client.slashCommands.set(props.conf.name, props);
                        slashCommandsLoader.push({
                            name: props.name,
                            description: props.description || "No description provided.",
                            options: props.options || []
                        });

                        console.log(`➤ Slash | ${props.name}/${folder} Command Loaded!`);
                    } catch (err) {
                        console.error(`❌ Error loading slash command ${file} in ${folder}:`, err);
                    }
                }
            }
        } catch (err) {
            console.error("❌ Error loading slash commands:", err);
        }

        // Register Slash Commands
        try {
            const rest = new REST({ version: "10" }).setToken(config.token);
            await rest.put(Routes.applicationCommands(client.user.id), {
                body: slashCommandsLoader,
            });
            console.log("✅ Successfully loaded application [/] commands.");
        } catch (err) {
            console.error("❌ Failed to load application [/] commands:", err);
        }

        console.log(`──────────────────────────────────────────
➤ | ${client.user.tag} Online! | Developed By Aeshan
──────────────────────────────────────────`);
        client.user.setActivity(config.botStatus || "Developed By Aeshan");
        process.title = `${config.botStatus} | Developed By Aeshan`;

    } catch (err) {
        console.error("❌ Critical error during bot startup:", err);
    }
});
