'use strict';

const net = require('net');
const { EventEmitter } = require('events');

/**
 * Cliente TCP que habla con el servidor socket del plugin ArsBot.
 * Protocolo: JSON delimitado por saltos de línea.
 *   1. Al conectar envía {"action":"auth","token":"..."}.
 *   2. El plugin responde {"action":"auth_ok", ...} o {"action":"response","ok":false,"type":"auth",...}.
 *   3. Cada petición lleva un "id" y el plugin lo devuelve en la respuesta.
 */
class Bridge extends EventEmitter {
  constructor(opts) {
    super();
    this.host = opts.host;
    this.port = opts.port;
    this.token = opts.token;
    this.socket = null;
    this.buffer = '';
    this.pending = new Map();
    this.seq = 0;
    this.ready = false;
    this.closedByUser = false;
    this.reconnectTimer = null;
  }

  connect() {
    this.closedByUser = false;
    const socket = new net.Socket();
    this.socket = socket;
    socket.setEncoding('utf8');
    socket.setTimeout(15000);

    socket.on('connect', () => {
      this.buffer = '';
      this.send({ action: 'auth', token: this.token });
    });
    socket.on('data', (chunk) => this.onData(chunk));
    socket.on('close', () => this.onClose());
    socket.on('error', () => {
      // El evento 'close' se encarga del reintento.
    });
    socket.on('timeout', () => socket.destroy());

    socket.connect(this.port, this.host);
    return this;
  }

  onData(chunk) {
    this.buffer += chunk;
    let idx;
    while ((idx = this.buffer.indexOf('\n')) >= 0) {
      const line = this.buffer.slice(0, idx).trim();
      this.buffer = this.buffer.slice(idx + 1);
      if (!line) continue;
      let msg;
      try {
        msg = JSON.parse(line);
      } catch {
        continue;
      }
      this.onMessage(msg);
    }
  }

  onMessage(msg) {
    if (msg.action === 'auth_ok') {
      this.ready = true;
      this.emit('ready');
      return;
    }
    if (msg.action === 'response') {
      if (!msg.ok && msg.type === 'auth') {
        // Token incorrecto: no reintentar en bucle.
        this.closedByUser = true;
        this.emit('fatal', msg.error || 'Autenticación rechazada por el plugin.');
        if (this.socket) this.socket.destroy();
        return;
      }
      const id = msg.id != null ? String(msg.id) : null;
      if (id && this.pending.has(id)) {
        const p = this.pending.get(id);
        this.pending.delete(id);
        if (msg.ok) p.resolve(msg.data);
        else p.reject(new Error(msg.error || 'Error desconocido del plugin'));
      }
      return;
    }
  }

  send(obj) {
    if (this.socket && !this.socket.destroyed) {
      this.socket.write(JSON.stringify(obj) + '\n');
    }
  }

  request(action, payload = {}) {
    return new Promise((resolve, reject) => {
      if (!this.ready) {
        reject(new Error('El bot no está conectado al servidor de Minecraft.'));
        return;
      }
      const id = String(++this.seq);
      const timer = setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error('El servidor de Minecraft tardó demasiado en responder.'));
        }
      }, 12000);
      this.pending.set(id, {
        resolve: (v) => {
          clearTimeout(timer);
          resolve(v);
        },
        reject: (e) => {
          clearTimeout(timer);
          reject(e);
        }
      });
      this.send({ id, action, ...payload });
    });
  }

  onClose() {
    const wasReady = this.ready;
    this.ready = false;
    for (const [, p] of this.pending.values()) {
      p.reject(new Error('Conexión perdida con el servidor de Minecraft.'));
    }
    this.pending.clear();
    if (wasReady) this.emit('disconnect');
    if (!this.closedByUser) {
      this.emit('log', 'Sin conexión con el plugin. Reintentando en 5 segundos...');
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = setTimeout(() => this.connect(), 5000);
    }
  }

  close() {
    this.closedByUser = true;
    clearTimeout(this.reconnectTimer);
    if (this.socket) this.socket.destroy();
  }
}

module.exports = { Bridge };
