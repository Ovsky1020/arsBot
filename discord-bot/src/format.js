'use strict';

/** Utilidades para convertir los JSON del plugin en texto/embeds de Discord. */

const GM_ES = {
  SURVIVAL: 'Supervivencia',
  CREATIVE: 'Creativo',
  ADVENTURE: 'Aventura',
  SPECTATOR: 'Espectador'
};

function escapeMarkdown(s) {
  return String(s).replace(/([\\*_~`|>])/g, '\\$1');
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function itemName(it) {
  if (it.name) return it.name;
  return String(it.id || it.type || '').replace(/^minecraft:/, '').replace(/_/g, ' ');
}

function itemLine(it) {
  if (it.type === 'AIR' || it.amount === 0) {
    return `\`${it.slot}\` *(vacío)*`;
  }
  const name = itemName(it);
  let s = `\`${it.slot}\` **${escapeMarkdown(name)}** ×${it.amount}`;
  if (it.label) s = `**[${it.label}]** ${s}`;
  if (it.maxDurability && it.durability != null) {
    s += ` · 🛠 ${it.maxDurability - it.durability}/${it.maxDurability}`;
  }
  if (it.enchants && it.enchants.length) {
    s += ' · ✨ ' + it.enchants.map((e) => `${String(e.id).replace(/^minecraft:/, '')} ${e.level}`).join(', ');
  }
  if (it.lore && it.lore.length) {
    s += `\n> _${escapeMarkdown(it.lore.join(' | '))}_`;
  }
  return s;
}

/** Trocea una lista de líneas en "páginas" de campos aptos para embeds. */
function paginate(lines, perField = 8, fieldsPerEmbed = 5) {
  const pages = [];
  let currentFields = [];
  for (let i = 0; i < lines.length; i += perField) {
    const slice = lines.slice(i, i + perField);
    currentFields.push({
      name: `Objetos ${i + 1}–${Math.min(i + perField, lines.length)}`,
      value: slice.join('\n') || '(vacío)',
      inline: false
    });
    if (currentFields.length === fieldsPerEmbed) {
      pages.push(currentFields);
      currentFields = [];
    }
  }
  if (currentFields.length) pages.push(currentFields);
  if (pages.length === 0) pages.push([{ name: 'Objetos', value: '(vacío)', inline: false }]);
  return pages;
}

function effectsText(effects) {
  if (!effects || effects.length === 0) return 'Ninguno';
  return effects
    .map((e) => {
      const lvl = (e.amplifier || 0) + 1;
      return `${e.name || e.id} ${lvl} (${e.seconds}s)`;
    })
    .join(', ');
}

function duration(ms) {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  let out = '';
  if (d) out += `${d}d `;
  if (h) out += `${h}h `;
  out += `${m}m ${sec}s`;
  return out;
}

function date(ms) {
  return new Date(ms).toISOString().slice(0, 16).replace('T', ' ');
}

function coordsText(c) {
  return `${round2(c.x)}, ${round2(c.y)}, ${round2(c.z)} (bloque ${c.blockX}, ${c.blockY}, ${c.blockZ})`;
}

function gm(short) {
  return GM_ES[short] || short;
}

module.exports = {
  escapeMarkdown,
  round2,
  itemName,
  itemLine,
  paginate,
  effectsText,
  duration,
  date,
  coordsText,
  gm
};
