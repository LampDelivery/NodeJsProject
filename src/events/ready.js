const { REST, Routes } = require('discord.js');
const { loadAutoresponders, loadMinkyIntervalsFromDb, minkyIntervals } = require('../utils/database');
const { sendMinkyToChannel } = require('../utils/helpers');

module.exports = {
  name: 'clientReady',
  once: true,
  async execute(client) {
    console.log(`Logged in as ${client.user.tag}`);

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

    try {
      const commands = [];
      client.commands.forEach(command => {
        commands.push(command.data.toJSON());
      });

      console.log('Registering slash commands...');
      await rest.put(
        Routes.applicationCommands(client.user.id),
        { body: commands }
      );
      console.log('Slash commands registered!');
    } catch (error) {
      console.error('Error registering commands:', error);
    }

    await loadAutoresponders();
    
    const intervals = await loadMinkyIntervalsFromDb();
    for (const row of intervals) {
      const channel = await client.channels.fetch(row.channel_id).catch(() => null);
      if (channel) {
        const key = `${row.guild_id}-${row.channel_id}`;
        const timer = setInterval(() => sendMinkyToChannel(channel), row.interval_ms);
        minkyIntervals[key] = {
          timer,
          interval: row.interval_str,
          channelId: row.channel_id,
          guildId: row.guild_id
        };
      }
    }
    console.log(`Loaded ${intervals.length} minky intervals from database`);
  }
};
