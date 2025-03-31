const client = require("../index");
const { Collection, REST, Routes } = global.deps.discordjs;
const fs = global.deps.fs;
const path = global.deps.path;
const config = require("../config.js");

client.on("ready", async () => {
    try {
        client.prefixCommands = new Collection();
        client.prefixAliases = new Collection();
        client.slashCommands = new Collection();
        const slashCommandsLoader = [];

        console.log("📂 Loading commands...");

        // Prefix Commands Loader
        try {
            const prefixCommandFolders = fs.readdirSync("./prefix");
            for (const folder of prefixCommandFolders) {
                const folderPath = `./prefix/${folder}`;
                const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith(".js"));

                const categorySettings = config.settings.commands[folder];
                if (!categorySettings?.enabled) {
                    console.log(`⚠️ Skipping category ${folder}, disabled in settings.`);
                    continue;
                }

                for (const file of commandFiles) {
                    try {
                        const filePath = `../${folderPath}/${file}`;
                        const props = require(filePath);

                        if (!props.conf?.name) {
                            console.log(`⚠️ Skipping ${file} in ${folder}, missing 'conf.name'`);
                            continue;
                        }

                        if (!categorySettings[props.conf.name]?.enabled) {
                            console.log(`⚠️ Skipping ${props.conf.name} in ${folder}, disabled in settings.`);
                            continue;
                        }

                        client.prefixCommands.set(props.conf.name, props);
                        props.conf.aliases?.forEach(alias => client.prefixAliases.set(alias, props.conf.name));

                        console.log(`✅ Prefix | Loaded: ${props.conf.name} (${folder})`);
                    } catch (err) {
                        console.error(`❌ Error loading prefix command ${file} (${folder}):`, err);
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
                const folderPath = `./slash/${folder}`;
                const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith(".js"));

                const categorySettings = config.settings.commands[folder];
                if (!categorySettings?.enabled) {
                    console.log(`⚠️ Skipping category ${folder}, disabled in settings.`);
                    continue;
                }

                for (const file of commandFiles) {
                    try {
                        const filePath = `../${folderPath}/${file}`;
                        const props = require(filePath);

                        if (!props.conf?.name) {
                            console.log(`⚠️ Skipping ${file} in ${folder}, missing 'name'`);
                            continue;
                        }

                        if (!categorySettings[props.conf.name]?.enabled) {
                            console.log(`⚠️ Skipping ${props.conf.name} in ${folder}, disabled in settings.`);
                            continue;
                        }

                        client.slashCommands.set(props.conf.name, props);
                        slashCommandsLoader.push(props.data.toJSON());

                        console.log(`✅ Slash | Loaded: ${props.conf.name} (${folder})`);
                    } catch (err) {
                        console.error(`❌ Error loading slash command ${file} (${folder}):`, err);
                    }
                }
            }
        } catch (err) {
            console.error("❌ Error loading slash commands:", err);
        }

        // Register Slash Commands
        try {
            const rest = new REST({ version: "10" }).setToken(config.token);
            await rest.put(Routes.applicationCommands(client.user.id), { body: slashCommandsLoader });

            console.log(`✅ Successfully loaded ${slashCommandsLoader.length} application [/] commands.`);
        } catch (err) {
            console.error("❌ Failed to load application [/] commands:", err);
        }

        console.log(`──────────────────────────────────────────
➤ | ${client.user.tag} Online! | Developed By Aeshan
──────────────────────────────────────────`);

        client.user.setActivity(config.botStatus || "Developed By Aeshan");
        process.title = config.botStatus ? `${config.botStatus} | Developed By Aeshan` : "Discord Bot | Developed By Aeshan";

    } catch (err) {
        console.error("❌ Critical error during bot startup:", err);
    }
});
