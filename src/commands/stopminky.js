const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { minkyIntervals, deleteMinkyIntervalFromDb } = require('../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stopminky')
    .setDescription('Stop scheduled Minky images for a channel')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to stop Minky images in')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)),
  
  async execute(interaction) {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({
        content: '❌ You need Administrator permissions to use this command.',
        ephemeral: true
      });
    }

    const channel = interaction.options.getChannel('channel');
    const guildId = interaction.guildId;
    const key = `${guildId}-${channel.id}`;

    if (!minkyIntervals[key]) {
      return interaction.reply({
        content: `❌ No scheduled Minky images found for ${channel}.`,
        ephemeral: true
      });
    }

    clearInterval(minkyIntervals[key].timer);
    delete minkyIntervals[key];
    await deleteMinkyIntervalFromDb(guildId, channel.id);

    await interaction.reply(`✅ Stopped scheduled Minky images for ${channel}.`);
  }
};
