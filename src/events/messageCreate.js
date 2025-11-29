const { responders } = require('../utils/database');
const { sendMinkyToChannel } = require('../utils/helpers');

module.exports = {
  name: 'messageCreate',
  once: false,
  async execute(message) {
    if (message.author.bot) return;

    if (!message.guild) {
      await sendMinkyToChannel(message.channel);
      return;
    }

    const guildResponders = responders[message.guild.id] || [];

    for (const r of guildResponders) {
      const matches = message.content.toLowerCase().includes(r.trigger);
      const channelMatch = !r.channelId || message.channel.id === r.channelId;

      if (matches && channelMatch) {
        await message.reply(r.response);
        return;
      }
    }
  }
};
