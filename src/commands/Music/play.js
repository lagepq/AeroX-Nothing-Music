const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'play',
  category: 'Music',
  aliases: ['p'],
  description: 'Plays songs from different platforms.',
  args: false,
  cooldown: 3,
  usage: '[song name or song link]',
  userPrams: [],
  botPrams: ['EmbedLinks'],
  owner: false,
  inVoiceChannel: true,
  sameVoiceChannel: true,
  execute: async (message, args, client) => {
    try {
      if (!message.guild.members.me.permissions.has(PermissionsBitField.resolve(["Speak", "Connect"]))) {
        return replyError(message, client, "I don't have the necessary permissions to connect or speak in the voice channel.");
      }

      const { channel } = message.member.voice;
      if (!channel) {
        return replyError(message, client, 'You need to be in a voice channel to use this command.');
      }

      if (!message.guild.members.cache
        .get(client.user.id)
        .permissionsIn(channel)
        .has(PermissionsBitField.resolve(["Speak", "Connect"]))) {
        return replyError(message, client, "I don't have permission to join and speak in your voice channel.");
      }

      const query = args.join(' ').trim();
      if (!query) {
        return replyError(message, client, 'Please provide a song name or link to play.');
      }

      if (!client.manager) {
        return replyError(message, client, 'Music manager is not properly initialized. Please contact the support team.');
      }

      let player;
      try {
        player = await createOrRecoverPlayer(client, message.guild.id, channel.id, message.channel.id, message.guild.shardId || 0);
      } catch (error) {
        console.error('Error creating player:', error);

        if (String(error?.message || '').includes('No nodes are online')) {
          return replyError(message, client, 'No audio nodes are online right now. Please try again later.');
        }

        if (error?.status === 400) {
          return replyError(message, client, 'Failed to connect to the voice channel (voice session error). Rejoin the channel and try again.');
        }

        return replyError(message, client, `Failed to create music player: ${error.message || 'Unknown error'}`);
      }

      let result;
      try {
        result = await player.search(query, { requester: message.author });

        if (!result || !result.tracks || !result.tracks.length) {
          return replyError(message, client, 'No results found for your query.');
        }
      } catch (error) {
        console.error('Error searching for tracks:', error);
        return replyError(message, client, `Error searching for tracks: ${error.message}`);
      }

      const MIN_DURATION = 30000;

      if (result.type === 'PLAYLIST') {
        const validTracks = result.tracks.filter(track => track.isStream || track.length >= MIN_DURATION);

        if (!validTracks.length) {
          return replyError(message, client, 'No songs in the playlist are streams or longer than 30 seconds.');
        }

        for (const track of validTracks) {
          player.queue.add(track);
        }

        const playlistName = result.playlist && result.playlist.name ? result.playlist.name : 'Unknown Playlist';
        const embed = new EmbedBuilder()
          .setColor(client.ankushcolor || '#FF0000')
          .setTitle('Playlist Added to Queue')
          .setDescription(`**${playlistName}** with ${validTracks.length} valid track(s) has been added to the queue.`)
          .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });

        if (!player.playing && !player.paused) {
          try {
            await player.play();
          } catch (error) {
            console.error('Error starting playback:', error);
          }
        }

        return message.reply({ embeds: [embed] });
      }

      const track = result.tracks[0];

      if (!track.isStream && track.length < MIN_DURATION) {
        return replyError(message, client, 'This track is shorter than 30 seconds and cannot be added to the queue.');
      }

      player.queue.add(track);

      const embed = new EmbedBuilder()
        .setColor(client.ankushcolor || '#FF0000')
        .setTitle('Track Added to Queue')
        .setDescription(`**[${track.title}](${track.uri})** by ${track.author} has been added to the queue.`)
        .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });

      if (!player.playing && !player.paused) {
        try {
          await player.play();
        } catch (error) {
          console.error('Error starting playback:', error);
        }
      }

      return message.reply({ embeds: [embed] });
    } catch (mainError) {
      console.error('Main error in play command:', mainError);
      return replyError(message, client, `An error occurred: ${mainError.message}`);
    }
  },
};

async function createOrRecoverPlayer(client, guildId, voiceId, textId, shardId) {
  const existing = client.manager.players.get(guildId);

  if (existing && existing.voiceId && existing.voiceId !== voiceId) {
    await existing.destroy();
  }

  try {
    return await client.manager.createPlayer({
      guildId,
      voiceId,
      textId,
      shardId,
      deaf: true,
    });
  } catch (error) {
    const isVoiceSessionError = error?.status === 400 || String(error?.message || '').toLowerCase().includes('session');

    if (!isVoiceSessionError) {
      throw error;
    }

    const stale = client.manager.players.get(guildId);
    if (stale) {
      await stale.destroy();
    }

    return await client.manager.createPlayer({
      guildId,
      voiceId,
      textId,
      shardId,
      deaf: true,
    });
  }
}

function replyError(message, client, description) {
  const embed = new EmbedBuilder()
    .setColor(client.ankushcolor || '#FF0000')
    .setDescription(description);

  return message.reply({ embeds: [embed] });
}
