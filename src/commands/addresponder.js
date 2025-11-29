const { SlashCommandBuilder } = require('discord.js');
const { responders, saveAutoresponder } = require('../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addresponder')
    .setDescription('Add a new autoresponder')
    .addStringOption(option =>
      option.setName('trigger')
        .setDescription('Trigger phrase')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('response')
        .setDescription('Response message')
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Optional channel restriction')
        .setRequired(false)),
  
  async execute(interaction) {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({
        content: '❌ You need Administrator permissions to use this command.',
        ephemeral: true
      });
    }

    const guildId = interaction.guildId;
    if (!responders[guildId]) responders[guildId] = [];

    const trigger = interaction.options.getString('trigger').toLowerCase();
    const response = interaction.options.getString('response');
    const channel = interaction.options.getChannel('channel');

    const channelId = channel?.id || null;
    const existingIndex = responders[guildId].findIndex(r => r.trigger === trigger && r.channelId === channelId);
    if (existingIndex !== -1) {
      return interaction.reply({
        content: `❌ An autoresponder with trigger "${trigger}"${channel ? ` in ${channel}` : ''} already exists. Delete it first to replace it.`,
        ephemeral: true
      });
    }

    responders[guildId].push({
      trigger,
      response,
      channelId
    });

    await saveAutoresponder(guildId, trigger, response, channelId);

    await interaction.reply(`✅ Autoresponder added for trigger: "${trigger}"${channel ? ` in ${channel}` : ''}`);
  }
};
