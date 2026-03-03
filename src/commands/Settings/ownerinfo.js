const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "ownerinfo",
  category: "Settings",
  aliases: ["about", "botinfo"],
  description: "Displays information about the bot.",
  args: false,
  usage: "",
  userPerms: [],
  owner: false,
  execute: async (message, args, client) => {
    try {
      const embed = new EmbedBuilder()
        .setAuthor({ name: "Bot Information", iconURL: client.user.displayAvatarURL() })
        .setFooter({ text: `Requested By ${message.author.username}`, iconURL: message.author.displayAvatarURL() })
        .setColor('#ff0000')
        .setTitle("Hey, It's A Quality Music Bot With Breathtaking Feature")
        .setDescription("Use `help` to explore commands and features.");

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Error showing bot information: ", error);
      message.reply("An error occurred while trying to fetch bot information.");
    }
  },
};
