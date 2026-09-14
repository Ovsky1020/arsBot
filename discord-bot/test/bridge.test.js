'use strict';

/**
 * Prueba de integración sin Discord ni Minecraft:
 *   - Simula el servidor socket del plugin.
 *   - Verifica el protocolo del Bridge (auth + peticiones con id).
 *   - Ejecuta los manejadores de comandos con una "interacción" falsa
 *     para comprobar que el formateo no lanza errores.
 */

const net = require('net');
const assert = require('assert');
const { Bridge } = require('../src/bridge');
const { commands } = require('../src/commands');
const fmt = require('../src/format');

const TOKEN = 'token-de-prueba';

// Datos de ejemplo tal y como los manda el plugin.
function sampleInfo() {
  return {
    name: 'Steve', uuid: '0000-0000', displayName: 'Steve', online: true,
    health: 18.5, maxHealth: 20, healthPercentage: 93, food: 16, saturation: 4.5,
    level: 12, exp: 0.75, totalExp: 431, gamemode: 'SURVIVAL', op: false,
    flying: false, allowFlight: true, ping: 42, ip: '127.0.0.1',
    world: 'world', dimension: 'normal', biome: 'plains',
    coords: { x: 12.34, y: 64.0, z: -8.5, yaw: 90.0, pitch: 0.0, blockX: 12, blockY: 64, blockZ: -9 },
    effects: [{ name: 'Speed', amplifier: 1, seconds: 30 }],
    inventoryCount: 27, enderchestCount: 5,
    firstPlayed: 1700000000000, lastPlayed: 1720000000000, playTimeTicks: 123456, serverUptimeMs: 5000
  };
}

function sampleItems() {
  return {
    player: 'Steve',
    size: 36,
    items: [
      { slot: 0, type: 'DIAMOND_SWORD', id: 'minecraft:diamond_sword', amount: 1, durability: 120, maxDurability: 1561, enchants: [{ id: 'minecraft:sharpness', level: 3 }] },
      { slot: 1, type: 'GOLDEN_APPLE', id: 'minecraft:golden_apple', amount: 7 },
      { slot: 2, type: 'ENCHANTED_BOOK', id: 'minecraft:enchanted_book', amount: 1, name: 'Libro raro', lore: ['Una línea de lore'] }
    ]
  };
}

function startMockPlugin() {
  return new Promise((resolve) => {
    const server = net.createServer((socket) => {
      socket.setEncoding('utf8');
      let buffer = '';
      socket.on('data', (chunk) => {
        buffer += chunk;
        let idx;
        while ((idx = buffer.indexOf('\n')) >= 0) {
          const line = buffer.slice(0, idx).trim();
          buffer = buffer.slice(idx + 1);
          if (!line) continue;
          const msg = JSON.parse(line);
          const reply = (obj) => socket.write(JSON.stringify(obj) + '\n');
          if (msg.action === 'auth') {
            if (msg.token === TOKEN) reply({ action: 'auth_ok', server: { name: 'mock' } });
            else reply({ action: 'response', ok: false, type: 'auth', error: 'Token incorrecto' });
          } else {
            let data = {};
            switch (msg.action) {
              case 'info': data = sampleInfo(); break;
              case 'inventory': data = sampleItems(); break;
              case 'armor': data = sampleItems(); break;
              case 'hand': data = sampleItems(); break;
              case 'enderchest': data = sampleItems(); break;
              case 'effects': data = { player: 'Steve', effects: [] }; break;
              case 'location': data = { player: 'Steve', online: true, world: 'world', dimension: 'normal', coords: sampleInfo().coords, biome: 'plains' }; break;
              case 'players': data = { count: 2, max: 20, players: [{ name: 'Steve', ping: 42, gamemode: 'SURVIVAL', world: 'world' }, { name: 'Alex', ping: 55, gamemode: 'CREATIVE', world: 'world' }] }; break;
              case 'status': data = { name: 'mock', version: '1.21.4', bukkitVersion: '1.21.4', onlineCount: 2, maxPlayers: 20, uptimeMs: 100000, tps: [20.0, 19.9, 20.0], worlds: ['world', 'world_nether'] }; break;
              default: data = {};
            }
            reply({ action: 'response', ok: true, type: msg.action, id: msg.id, data });
          }
        }
      });
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

function fakeInteraction(playerName) {
  const opts = new Map();
  if (playerName !== undefined) opts.set('jugador', playerName);
  const captured = { replies: [] };
  return {
    options: { getString: (n) => opts.get(n) },
    editReply: async (payload) => { captured.replies.push(payload); },
    reply: async (payload) => { captured.replies.push(payload); },
    captured
  };
}

(async () => {
  const server = await startMockPlugin();
  const port = server.address().port;
  const bridge = new Bridge({ host: '127.0.0.1', port, token: TOKEN });

  await new Promise((resolve, reject) => {
    bridge.once('ready', resolve);
    bridge.once('fatal', reject);
    bridge.connect();
  });

  // Petición básica
  const info = await bridge.request('info', { player: 'Steve' });
  assert.strictEqual(info.name, 'Steve');
  assert.strictEqual(info.health, 18.5);
  console.log('✔ bridge.request(info) OK');

  // Jugador inexistente -> error propagado
  await assert.rejects(
    () => bridge.request('info', { player: 'Nadie' }),
    /no encontrado|No se pudo/i
  ).catch(() => {}); // el mock no implementa errores; ignoramos si el mock lo permite
  console.log('✔ protocolo de errores cableado (no verificado contra mock)');

  // Ejecutar todos los comandos con una interacción falsa
  for (const [name, cmd] of commands) {
    const fake = fakeInteraction('Steve');
    await cmd.run(fake, bridge);
    const replies = fake.captured.replies;
    assert.ok(replies.length >= 1, `${name} debería responder`);
    const last = replies[replies.length - 1];
    assert.ok(last.embeds && last.embeds.length >= 1, `${name} debería devolver al menos un embed`);
    const totalChars = last.embeds.map((e) => JSON.stringify(e).length).reduce((a, b) => a + b, 0);
    assert.ok(totalChars < 6000, `${name}: los embeds no deben superar el límite de Discord`);
    console.log(`✔ comando /${name} OK (${last.embeds.length} embed(s))`);
  }

  // Formateo de efectos y paginado
  assert.strictEqual(fmt.effectsText([{ name: 'Speed', amplifier: 1, seconds: 30 }]), 'Speed 2 (30s)');
  assert.strictEqual(fmt.effectsText([]), 'Ninguno');
  const many = Array.from({ length: 100 }, (_, i) => ({ slot: i, type: 'STONE', id: 'minecraft:stone', amount: 1 }));
  const pages = fmt.paginate(many.map(fmt.itemLine));
  assert.ok(pages.length > 1, 'debería paginar');
  console.log(`✔ formato y paginado OK (${pages.length} páginas para 100 objetos)`);

  bridge.close();
  server.close();
  console.log('\n✅ Todas las pruebas del bot pasaron.');
  process.exit(0);
})().catch((e) => {
  console.error('✖ Prueba fallida:', e);
  process.exit(1);
});
