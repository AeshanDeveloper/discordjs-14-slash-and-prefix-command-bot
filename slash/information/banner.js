const path = global.deps.path;

module.exports = {
    conf: {
        name: "banner", // Command Name
        category: path.basename(path.dirname(__filename)) // Command Category (must match settings.json)
    },

    data: new global.deps.discordjs.SlashCommandBuilder()
        .setName("banner")
        .setDescription("Get a user's profile banner.")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("The user whose banner you want to see.")
                .setRequired(false)
        ),

    run: async (client, interaction) => {
        try {
            const user = interaction.options.getUser("user") || interaction.user;
            const userData = await client.users.fetch(user.id, { force: true });

            if (!userData.banner) {
                return interaction.reply({
                    content: `${global.deps.config.settings.emojis.error} This user has no profile banner!`,
                    flags: 64
                });
            }

            const bannerURL = userData.bannerURL({ dynamic: true, size: 4096 });

            const embed = new global.deps.discordjs.EmbedBuilder()
                .setColor(global.deps.config.settings.colors.embeds.default)
                .setTitle(`${user.tag}'s Banner`)
                .setImage(bannerURL)
                .setFooter({
                    text: `Requested by ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                });

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error(`❌ Error in ${module.exports.conf.name} command:`, error);
            interaction.reply({
                content: `${global.deps.config.settings.emojis.error} An error occurred while executing this command.`,
                ephemeral: true
            });
        }
    }
};
