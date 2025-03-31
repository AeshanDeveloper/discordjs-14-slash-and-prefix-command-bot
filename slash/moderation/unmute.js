const path = global.deps.path;

module.exports = {
    conf: {
        name: "unmute", // Command Name
        category: path.basename(path.dirname(__filename)) // Command Category (must match settings.json)
    },

    data: new global.deps.discordjs.SlashCommandBuilder()
        .setName("unmute")
        .setDescription("Unmute a user in the server.")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("The user to unmute")
                .setRequired(true)
        ),

    run: async (client, interaction) => {
        try {
            const emojis = global.deps.config.settings.emojis;

            if (!interaction.member.permissions.has(global.deps.discordjs.PermissionsBitField.Flags.MuteMembers)) {
                return interaction.reply({
                    content: `${emojis.error} You don't have permission to unmute members!`,
                    flags: 64
                });
            }

            const target = interaction.options.getUser("user");
            const member = await interaction.guild.members.fetch(target.id).catch(() => null);

            if (!member) {
                return interaction.reply({
                    content: `${emojis.error} User is not in the server!`,
                    flags: 64
                });
            }

            await member.timeout(null);

            const embed = new global.deps.discordjs.EmbedBuilder()
                .setColor(global.deps.config.settings.colors.embeds.default)
                .setTitle(`${emojis.mute_remove} User Unmuted`)
                .setDescription(`**${target.tag}** has been unmuted.`)
                .setFooter({
                    text: `Unmuted by ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                });

            await interaction.reply({ embeds: [embed] });

            // Send DM notification
            await target.send(`${emojis.mute_remove} You have been **unmuted** in **${interaction.guild.name}**!`).catch(() => null);

        } catch (error) {
            console.error(`❌ Error in ${module.exports.conf.name} command:`, error);
            interaction.reply({
                content: `${global.deps.config.settings.emojis.error} An error occurred while executing this command.`,
                ephemeral: true
            });
        }
    }
};
