const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');

const ALIUCORD_GUILD_ID = '811255666990907402';
const PLUGIN_LIST_CHANNEL_ID = '811275162715553823';
const PLUGINS_PER_PAGE = 5;

let cachedPlugins = [];
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000;

function parsePluginMessage(message) {
  const content = message.content;
  if (!content) return null;

  // First priority: extract .zip file URL - this is critical
  const zipMatch = content.match(/<?(https?:\/\/[^\s>]+\.zip)>?/i);
  if (!zipMatch) return null;
  
  const downloadLink = zipMatch[1];

  // Look for plugin name in **bold** format
  const nameMatch = content.match(/\*\*([^*]+)\*\*/);
  if (!nameMatch) return null;
  
  const name = nameMatch[1].trim();
  if (!name) return null;

  const lines = content.split('\n').map(l => l.trim()).filter(l => l);
  let description = '';
  let info = '';
  const author = message.author?.username || 'Unknown';

  // Collect description and info lines
  for (const line of lines) {
    if (line.startsWith('**') || line.startsWith('<')) continue; // Skip name and links
    if (line.toLowerCase().startsWith('info:')) {
      info = line.substring(4).trim();
    } else if (!line.startsWith('http')) {
      if (description) description += ' ';
      description += line;
    }
  }

  return {
    name,
    description: description || 'No description',
    downloadLink,
    info,
    author,
    messageId: message.id
  };
}

async function fetchPlugins(client) {
  const now = Date.now();
  if (cachedPlugins.length > 0 && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedPlugins;
  }

  try {
    const channel = await client.channels.fetch(PLUGIN_LIST_CHANNEL_ID);
    if (!channel) return [];

    const messages = await channel.messages.fetch({ limit: 100 });
    const plugins = [];

    messages.forEach(message => {
      const plugin = parsePluginMessage(message);
      if (plugin) {
        plugins.push(plugin);
      }
    });

    cachedPlugins = plugins;
    cacheTimestamp = now;
    return plugins;
  } catch (err) {
    console.error('Error fetching plugins:', err);
    return cachedPlugins.length > 0 ? cachedPlugins : [];
  }
}

function filterPlugins(plugins, search) {
  if (!search) return plugins;
  
  const searchLower = search.toLowerCase();
  return plugins.filter(plugin => 
    plugin.name.toLowerCase().includes(searchLower) ||
    plugin.description.toLowerCase().includes(searchLower) ||
    plugin.author.toLowerCase().includes(searchLower)
  );
}

function formatPlugin(plugin) {
  let text = `[**${plugin.name}**](${plugin.downloadLink})\n`;
  text += `${plugin.description}`;
  if (plugin.info) {
    text += ` - ${plugin.info}`;
  }
  return text;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('plugins')
    .setDescription('Browse Aliucord plugins')
    .addStringOption(option =>
      option.setName('search')
        .setDescription('Search for plugins by name, description, or author')
        .setRequired(false)),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const search = interaction.options.getString('search');
    const allPlugins = await fetchPlugins(interaction.client);
    const plugins = search ? filterPlugins(allPlugins, search) : allPlugins.slice(0, 5);

    if (plugins.length === 0) {
      return interaction.editReply('No plugins found.');
    }

    let content = '';
    if (search) {
      content += `**Search results for: "${search}"**\n\n`;
    }

    plugins.forEach((plugin, index) => {
      content += formatPlugin(plugin);
      if (index < plugins.length - 1) content += '\n\n';
    });

    await interaction.editReply(content);
  },

  async executePrefix(message, args) {
    const search = args.join(' ') || null;
    const allPlugins = await fetchPlugins(message.client);
    const plugins = search ? filterPlugins(allPlugins, search) : allPlugins.slice(0, 5);

    if (plugins.length === 0) {
      return message.reply('No plugins found.');
    }

    let content = '';
    if (search) {
      content += `**Search results for: "${search}"**\n\n`;
    }

    plugins.forEach((plugin, index) => {
      content += formatPlugin(plugin);
      if (index < plugins.length - 1) content += '\n\n';
    });

    await message.reply(content);
  },

  fetchPlugins,
  filterPlugins,
  ALIUCORD_GUILD_ID
};
