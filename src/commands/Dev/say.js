const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: "say",
  aliases: ["s"],
  category: "Dev",
  description: "If your owner then this command work",
  cooldown: 5,
  args: false,
  owner: true,
  execute: async (message, args, client) => {
    let allowedUsers = ["239496212699545601", "622786214776406017"];
    if (!allowedUsers.includes(message.author.id)) return;

    const sayMessage = message.content.split(' ').slice(1).join(' ');
    if (!sayMessage) {
      const me = new EmbedBuilder()
        .setColor('#ff0000')
        .setAuthor({name: `Hey ${message.author.tag}`, iconURL: client.user.displayAvatarURL({dynamic: true})});
      return message.reply({embeds: [me]});
    }

    if (sayMessage) {
      message.delete();
      message.channel.send({content: `${sayMessage}`}), {
        allowedMentions: { parse: ["users"] },
      };
    }
  },
};
