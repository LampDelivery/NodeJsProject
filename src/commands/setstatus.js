const { SlashCommandBuilder } = require('discord.js');

const OWNER_ID = process.env.DISCORD_OWNER_ID;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setstatus')
    .setDescription('Set bot status (Owner only)')
    .addStringOption(option =>
      option.setName('status')
        .setDescription('Bot status')
        .addChoices(
          { name: 'Online', value: 'online' },
          { name: 'Idle', value: 'idle' },
          { name: 'Do Not Disturb', value: 'dnd' }
        )
        .setRequired(true))
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Status message')
        .setRequired(true)),
  
  async execute(interaction) {
    if (!OWNER_ID || interaction.user.id !== OWNER_ID) {
      return interaction.reply({
        content: '❌ Only the bot owner can use this command.',
        ephemeral: true
      });
    }

    const status = interaction.options.getString('status');
    const message = interaction.options.getString('message');

    try {
      await interaction.client.user.setPresence({
        activities: [{ name: message, type: 0 }],
        status: status
      });

      await interaction.reply({
        content: `✅ Bot status updated to **${status}** with message: "${message}"`,
        ephemeral: true
      });
    } catch (err) {
      console.error('Error setting bot status:', err);
      await interaction.reply({
        content: '❌ Failed to update bot status.',
        ephemeral: true
      });
    }
  }
};
