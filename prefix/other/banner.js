exports.conf = {
  name: "banner",
  description: "Get a user's profile banner.",
  usage: "banner [@user]",
  aliases: ["profilebanner"]
};

exports.run = async (client, message, args) => {
  const user = message.mentions.users.first() || message.author;
  const userData = await client.users.fetch(user.id, { force: true });

  if (!userData.banner) {
      return message.channel.send(`${global.deps.config.settings.emojis.error} This user has no profile banner!`);
  }

  const bannerURL = userData.bannerURL({ dynamic: true, size: 4096 });

  const embed = new global.deps.discordjs.EmbedBuilder()
      .setColor(global.deps.config.settings.colors.embeds.default)
      .setTitle(`${user.tag}'s Banner`)
      .setImage(bannerURL)
      .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });

  message.channel.send({ embeds: [embed] });
};
