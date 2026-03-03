module.exports = {
  token: process.env.DISCORD_TOKEN || '', // bot token
  clientId: process.env.CLIENT_ID || "",
  prefix: process.env.PREFIX || '!!', // bot prefix
  ownerID: (process.env.OWNER_IDS || '').split(','), // owner ids
  SpotifyID: process.env.SPOTIFY_ID || 'e6f84fbec2b44a77bf35a20c5ffa54b8', // spotify client id
  SpotifySecret: process.env.SPOTIFY_SECRET || '498f461b962443cfaf9539c610e2ea81', // spotify client secret
  ankushcolor: '#ff0000', // embed colour
  bugReportChannel: "", // ID of the channel where bug reports will be sent
  embedColor: '#ff0000', // Using your existing ankushcolor
  supportServer: "", // Support server link

  nodes: [
    {
      url: process.env.LAVALINK_URL || 'lavalinkv4.serenetia.com:80',
      name: process.env.LAVALINK_NAME || 'MUSIC',
      auth: process.env.LAVALINK_AUTH || process.env.LAVALINK_PASSWORD || 'youshallnotpass',
      secure: process.env.LAVALINK_SECURE === 'true'
    }
  ],
};
