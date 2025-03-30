const client = require("../index");
const { Collection } = global.deps.discordjs;
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const fs = global.deps.fs;
const path = global.deps.path;
const config = require("../config.js");

client.on("ready", () => {
    client.prefixCommands = new Collection();
    client.prefixAliases = new Collection();
    client.slashCommands = new Collection();
    const slashCommandsLoader = [];

    // Prefix Commands Loader
    const prefixCommandFolders = fs.readdirSync('./prefix');
    for (const folder of prefixCommandFolders) {
        const folderPath = path.join('./prefix', folder);
        const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.resolve(__dirname, "../", folderPath, file);
            const props = require(filePath);

            if (!props.conf || !props.conf.name) {
                console.log(`⚠️ Skipping ${file} in ${folder}, missing 'conf.name'`);
                continue;
            }

            console.log(`➤ Prefix | ${props.conf.name}/${folder} Command Loaded!`);
            client.prefixCommands.set(props.conf.name, props);

            if (props.conf.aliases && Array.isArray(props.conf.aliases)) {
                props.conf.aliases.forEach(alias => {
                    client.prefixAliases.set(alias, props.conf.name);
                });
            }
        }
    }

    // Slash Commands Loader
    const slashCommandFolders = fs.readdirSync('./slash');
    for (const folder of slashCommandFolders) {
        const folderPath = path.join('./slash', folder);
        const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.resolve(__dirname, "../", folderPath, file);
            const props = require(filePath);

            if (!props.name) {
                console.log(`⚠️ Skipping ${file} in ${folder}, missing 'name'`);
                continue;
            }

            client.slashCommands.set(props.name, props);
            slashCommandsLoader.push({
                name: props.name,
                description: props.description || "No description provided.",
                options: props.options || []
            });

            console.log(`➤ Slash | ${props.name}/${folder} Command Loaded!`);
        }
    }

    const rest = new REST({ version: "10" }).setToken(config.token);
    (async () => {
        try {
            await rest.put(Routes.applicationCommands(client.user.id), {
                body: slashCommandsLoader,
            });
            console.log("✅ Successfully loaded application [/] commands.");
        } catch (e) {
            console.log("❌ Failed to load application [/] commands. " + e);
        }
    })();

    console.log(`──────────────────────────────────────────
➤ | ${client.user.tag} Online! | Developed By UMUTXYP ♥ KADRXY
──────────────────────────────────────────`);
    client.user.setActivity(config.botStatus || "Developed By UMUTXYP ♥ KADRXY");

    process.title = config.botStatus + " | Developed By UMUTXYP ♥ KADRXY";
});
