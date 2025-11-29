# Discord Bot

## Overview
A simple Discord bot built with Node.js and discord.js 

## Project Structure
- `index.js` - Main bot entry point
- `package.json` - Project dependencies and scripts

### Slash Commands
- `/minky` - Get a random Minky cat image (displayed in pink embed)
- `/addresponder` - Add a new autoresponder with trigger phrase, response message, and optional channel restriction (Admin only)
- `/deleteresponder` - Delete an autoresponder by trigger phrase (Admin only)
- `/install` - Get Kettu installation instructions (ephemeral, interactive buttons for Android/iOS)

### Autoresponder
- Server-specific storage (each Discord server has its own autoresponders)
- In-memory storage keyed by guild ID
- Supports optional channel-specific restrictions
- Case-insensitive trigger matching
- Requires Administrator permissions to add

## User Preferences
- Node.js runtime
- discord.js library for Discord API interaction
