'use strict';

const { Client, GatewayIntentBits, PermissionFlagsBits, REST, Routes } = require('discord.js');
const config = require('./config');
const { Bridge } = require('./bridge');
const { commands } = require('./commands');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const bridge = new Bridge(config.socket);

bridge.on('ready', () => console.log('[arsBot] ✔ Conectado al plugin de Minecraft.'));
bridge.on('disconnect', () => console.log('[arsBot] ⚠ Conexión perdida con el plugin.'));
bridge.on('fatal', (err) => console.error('[arsBot] ✖', err));
bridge.on('log', (m) => console.log('[arsBot]', m));

async function registerCommands(guildId) {
  const body = [...commands.values()].map((c) => c.builder.toJSON());
  const rest = new REST({ version: '10' }).setToken(config.token);
  try {
    if (guildId) {
      await rest.put(Routes.applicationGuildCommands(client.user.id, guildId), { body });
      console.log(`[arsBot] ✔ Comandos registrados en el servidor ${guildId}.`);
    } else {
      await rest.put(Routes.applicationCommands(client.user.id), { body });
      console.log('[arsBot] ✔ Comandos globales registrados (pueden tardar ~1h en propagarse).');
    }
  } catch (e) {
    console.error('[arsBot] ✖ Error registrando comandos:', e.message);
  }
}

function isAllowed(interaction) {
  const member = interaction.member;
  const { roles, users } = config.admin;

  // Si no hay roles/usuarios configurados, se exige el permiso "Administrador".
  if (roles.length === 0 && users.length === 0) {
    return Boolean(member && member.permissions && member.permissions.has(PermissionFlagsBits.Administrator));
  }
  if (users.includes(interaction.user.id)) return true;
  if (member && member.roles && member.roles.cache.some((r) => roles.includes(r.id))) return true;
  return Boolean(member && member.permissions && member.permissions.has(PermissionFlagsBits.Administrator));
}

client.once('ready', async () => {
  console.log(`[arsBot] ✔ Bot listo como ${client.user.tag}`);
  await registerCommands(config.guildId);
  bridge.connect();
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const cmd = commands.get(interaction.commandName);
  if (!cmd) return;

  await interaction.deferReply({ ephemeral: true }).catch(() => {});

  if (!isAllowed(interaction)) {
    await interaction.editReply({ content: '⛔ No tienes permisos para usar este comando.' }).catch(() => {});
    return;
  }

  try {
    await cmd.run(interaction, bridge);
  } catch (e) {
    console.error('[arsBot] Error ejecutando comando:', e);
    await interaction.editReply({ content: `❌ Error: ${e.message}` }).catch(() => {});
  }
});

client
  .login(config.token)
  .catch((e) => {
    console.error('[arsBot] ✖ No se pudo iniciar sesión en Discord:', e.message);
    console.error('[arsBot] Revisa BOT_TOKEN en el archivo .env');
    process.exit(1);
  });
