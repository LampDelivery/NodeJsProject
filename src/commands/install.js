const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('install')
    .setDescription('Get installation instructions'),
  
  async execute(interaction) {
    const isAliucord = interaction.guildId === '811255666990907402';
    
    if (isAliucord) {
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('install_android')
            .setLabel('Android')
            .setStyle(ButtonStyle.Success)
        );

      await interaction.reply({
        embeds: [{
          title: 'Aliucord Installation',
          description: 'Select your platform to get installation instructions:',
          color: 0x5865F2
        }],
        components: [row],
        ephemeral: true
      });
    } else {
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('install_android')
            .setLabel('Android')
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId('install_ios')
            .setLabel('iOS')
            .setStyle(ButtonStyle.Primary)
        );

      await interaction.reply({
        embeds: [{
          title: 'Kettu Installation',
          description: 'Select your platform to get installation instructions:',
          color: 0x5865F2
        }],
        components: [row],
        ephemeral: true
      });
    }
  }
};
