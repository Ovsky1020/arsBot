'use strict';

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fmt = require('./format');

const COLOR = 0x2ecc71;

function playerOption(builder) {
  return builder.addStringOption((o) =>
    o.setName('jugador').setDescription('Nombre del jugador (en el juego)').setRequired(false)
  );
}

function embedBase(title) {
  return new EmbedBuilder().setColor(COLOR).setTitle(title).setTimestamp();
}

function sendError(interaction, message) {
  return interaction.editReply({ content: `❌ ${message}` });
}

/** Comandos y sus manejadores. */
const commands = new Map();

commands.set('info', {
  builder: playerOption(new SlashCommandBuilder()
    .setName('info')
    .setDescription('Ficha completa de un jugador')),
  async run(interaction, bridge) {
    const jugador = interaction.options.getString('jugador') || undefined;
    const d = await bridge.request('info', { player: jugador });
    const c = d.coords || {};
    const embed = embedBase(`🧾 Ficha de ${d.name}`)
      .setDescription(`**${d.displayName}** · ${d.gamemode ? fmt.gm(d.gamemode) : ''}`)
      .addFields(
        { name: '❤️ Vida', value: `${d.health}/${d.maxHealth} (${d.healthPercentage}%)`, inline: true },
        { name: '🍗 Hambre', value: `${d.food} (${d.saturation} sat.)`, inline: true },
        { name: '⭐ Nivel / EXP', value: `${d.level} · ${d.exp} barra (${d.totalExp} total)`, inline: true },
        { name: '📍 Ubicación', value: `${fmt.coordsText(c)}\nMundo: ${d.world} (${d.dimension})\nBioma: ${d.biome}`, inline: true },
        { name: '🔌 Ping / IP', value: `${d.ping} ms · ${d.ip}`, inline: true },
        { name: '🕹 Estado', value: `OP: ${d.op ? 'sí' : 'no'} · Volando: ${d.flying ? 'sí' : 'no'}`, inline: true },
        { name: '🎒 Objetos', value: `Inventario: ${d.inventoryCount} · EnderChest: ${d.enderchestCount}`, inline: true },
        { name: '✨ Efectos', value: fmt.effectsText(d.effects), inline: false },
        { name: '⏱ Tiempo jugado', value: fmt.duration(d.playTimeTicks * 50), inline: true },
        { name: '📅 Primera conexión', value: fmt.date(d.firstPlayed), inline: true },
        { name: '📅 Última conexión', value: fmt.date(d.lastPlayed), inline: true }
      )
      .setFooter({ text: `UUID: ${d.uuid}` });
    await interaction.editReply({ embeds: [embed] });
  }
});

function itemCommand(name, description, action, title) {
  return {
    builder: playerOption(new SlashCommandBuilder().setName(name).setDescription(description)),
    async run(interaction, bridge) {
      const jugador = interaction.options.getString('jugador') || undefined;
      const d = await bridge.request(action, { player: jugador });
      const lines = (d.items || []).map(fmt.itemLine);
      const pages = fmt.paginate(lines);
      const embeds = pages.map((fields, i) =>
        embedBase(`${title} de ${d.player}${pages.length > 1 ? ` (${i + 1}/${pages.length})` : ''}`)
          .addFields(fields)
      );
      await interaction.editReply({ embeds });
    }
  };
}

commands.set('inventario', itemCommand('inventario', 'Ver el inventario de un jugador', 'inventory', '🎒 Inventario'));
commands.set('echest', itemCommand('echest', 'Ver el cofre de ender de un jugador', 'enderchest', '📦 EnderChest'));
commands.set('armadura', itemCommand('armadura', 'Ver la armadura de un jugador', 'armor', '🛡 Armadura'));
commands.set('manos', itemCommand('manos', 'Ver lo que lleva un jugador en las manos', 'hand', '✋ Manos'));

commands.set('efectos', {
  builder: playerOption(new SlashCommandBuilder()
    .setName('efectos')
    .setDescription('Ver los efectos de poción activos de un jugador')),
  async run(interaction, bridge) {
    const jugador = interaction.options.getString('jugador') || undefined;
    const d = await bridge.request('effects', { player: jugador });
    const embed = embedBase(`✨ Efectos de ${d.player}`).setDescription(fmt.effectsText(d.effects));
    await interaction.editReply({ embeds: [embed] });
  }
});

commands.set('donde', {
  builder: playerOption(new SlashCommandBuilder()
    .setName('donde')
    .setDescription('Ver la ubicación de un jugador')),
  async run(interaction, bridge) {
    const jugador = interaction.options.getString('jugador') || undefined;
    const d = await bridge.request('location', { player: jugador });
    const embed = embedBase(`📍 Ubicación de ${d.player}`).addFields(
      { name: 'Coordenadas', value: fmt.coordsText(d.coords), inline: false },
      { name: 'Mundo', value: `${d.world} (${d.dimension})`, inline: true },
      { name: 'Bioma', value: d.biome, inline: true }
    );
    await interaction.editReply({ embeds: [embed] });
  }
});

commands.set('jugadores', {
  builder: new SlashCommandBuilder()
    .setName('jugadores')
    .setDescription('Ver quién está conectado al servidor'),
  async run(interaction, bridge) {
    const d = await bridge.request('players');
    const lines = (d.players || []).map(
      (p) => `**${fmt.escapeMarkdown(p.name)}** · ${p.ping}ms · ${fmt.gm(p.gamemode)} · ${p.world}`
    );
    const embed = embedBase(`👥 Jugadores conectados (${d.count}/${d.max})`)
      .setDescription(lines.join('\n') || 'No hay nadie conectado.');
    await interaction.editReply({ embeds: [embed] });
  }
});

commands.set('estado', {
  builder: new SlashCommandBuilder()
    .setName('estado')
    .setDescription('Ver el estado del servidor de Minecraft'),
  async run(interaction, bridge) {
    const d = await bridge.request('status');
    const embed = embedBase('🖥 Estado del servidor').addFields(
      { name: 'Versión', value: d.bukkitVersion || d.version, inline: true },
      { name: 'Jugadores', value: `${d.onlineCount}/${d.maxPlayers}`, inline: true },
      { name: 'TPS (1m/5m/15m)', value: (d.tps || []).map((t) => t.toFixed(1)).join(' / '), inline: true },
      { name: 'Uptime', value: fmt.duration(d.uptimeMs), inline: true },
      { name: 'Mundos', value: (d.worlds || []).join(', ') || '—', inline: false }
    );
    await interaction.editReply({ embeds: [embed] });
  }
});

module.exports = { commands, sendError };
