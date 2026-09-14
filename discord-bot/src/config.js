'use strict';

require('dotenv').config();

function csv(value) {
  return String(value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

module.exports = {
  token: process.env.BOT_TOKEN || '',
  guildId: process.env.GUILD_ID || '',
  socket: {
    host: process.env.SOCKET_HOST || '127.0.0.1',
    port: parseInt(process.env.SOCKET_PORT || '25590', 10),
    token: process.env.SOCKET_TOKEN || ''
  },
  admin: {
    roles: csv(process.env.ADMIN_ROLE_IDS),
    users: csv(process.env.ADMIN_USER_IDS)
  }
};
