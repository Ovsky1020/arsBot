# arsBot — Panel de administración para Minecraft + Discord

Herramienta de administración para servidores **Paper 1.21.x** que te permite consultar toda la
información de los jugadores (vida, coordenadas, inventario, cofre de ender, armadura, efectos,
estado del servidor…) de dos formas:

1. **Dentro del juego**, con el comando `/arsbot` (para admins/ops).
2. **Desde Discord**, con un bot que usa comandos de barra (`/info`, `/inventario`, …) y se conecta
   al servidor por un socket TCP seguro con token.

> ⚠️ Es una herramienta de **solo lectura**: muestra información y vistas de inventario, pero no
> modifica el inventario real de los jugadores.

---

## Estructura del proyecto

```
arsBot/
├── plugin/                 # Plugin Paper 1.21.x (Java 21) + servidor socket
│   ├── src/main/java/com/arsbot/…
│   ├── src/main/resources/  # plugin.yml, config.yml
│   ├── build.gradle.kts
│   └── gradlew             # Gradle wrapper (no necesitas instalar Gradle)
└── discord-bot/            # Bot de Discord (Node.js + discord.js)
    ├── src/
    ├── test/
    └── .env.example
```

---

## Requisitos

| Componente | Requisito |
|---|---|
| Servidor | Paper **1.21.x** (Spigot compatible en su mayoría) |
| Java | **JDK 21** (para compilar el plugin) |
| Bot | **Node.js 18+** |
| Conexión | Puerto TCP abierto entre el bot y el servidor (por defecto `25590`) |

---

## 1) Instalar el plugin (Minecraft)

### Compilar

```bash
cd plugin
./gradlew build          # en Windows: gradlew.bat build
```

El jar se genera en `plugin/build/libs/arsbot-plugin-1.0.0.jar`.

### Instalar y configurar

1. Copia el `.jar` a la carpeta `plugins/` de tu servidor Paper.
2. Arranca el servidor una vez para que se genere `plugins/ArsBot/config.yml`.
3. Edita `plugins/ArsBot/config.yml`:

```yaml
socket:
  enabled: true
  host: "127.0.0.1"        # 127.0.0.1 = bot en la MISMA máquina (recomendado)
  port: 25590
  token: "TU_TOKEN_SECRETO_LARGO_Y_ALEATORIO"   # debe coincidir con el .env del bot
  max-connections: 10
```

4. Reinicia el servidor (o ejecuta `/arsbot reload`).

> 🔒 **Seguridad**: si el bot está en otra máquina, pon `host: "0.0.0.0"` y protege el puerto con
> firewall. El token actúa como contraseña: úsalo siempre y que sea largo.

### Permisos (in-game)

| Permiso | Permite |
|---|---|
| `arsbot.use` | Usar `/arsbot` (base) |
| `arsbot.info` | `info`, `effects` |
| `arsbot.inventory` | `inv`, `echest`, `armor`, `hand`, `view` |
| `arsbot.location` | `where` |
| `arsbot.status` | `players`, `status` |
| `arsbot.reload` | `reload` |

Por defecto todos los permisos son `default: op` (solo operadores).

### Comandos en el juego

```
/arsbot info <jugador>          → ficha completa (vida, hambre, nivel, modo, ping, IP, coordenadas…)
/arsbot inv <jugador>           → lista el inventario
/arsbot echest <jugador>        → lista el cofre de ender
/arsbot armor <jugador>         → muestra la armadura
/arsbot hand <jugador>          → muestra lo que lleva en las manos
/arsbot effects <jugador>       → efectos de poción activos
/arsbot where <jugador>         → coordenadas, mundo y bioma
/arsbot view <jugador> [inv|echest|armor]   → abre una GUI de SOLO LECTURA
/arsbot players                 → lista de conectados
/arsbot status                  → estado del servidor (TPS, uptime…)
/arsbot reload                  → recarga config.yml y reinicia el socket
/arsbot help                    → ayuda
```

> En la GUI `view` puedes hacer **clic izquierdo** sobre un objeto para ver sus detalles. Es solo
> lectura: no se guarda ningún cambio.

---

## 2) Instalar el bot (Discord)

```bash
cd discord-bot
npm install
cp .env.example .env
```

Edita `.env`:

```env
BOT_TOKEN=TU_TOKEN_DE_DISCORD
GUILD_ID=                # opcional: id del servidor para registrar los comandos al instante
SOCKET_HOST=127.0.0.1
SOCKET_PORT=25590
SOCKET_TOKEN=TU_TOKEN_SECRETO_LARGO_Y_ALEATORIO   # igual que en config.yml del plugin
ADMIN_ROLE_IDS=          # opcional: ids de rol de Discord que pueden usar el bot
ADMIN_USER_IDS=          # opcional: ids de usuario que pueden usar el bot
```

Arranca el bot:

```bash
npm start
```

### Crear el bot e invitarlo

1. Ve a <https://discord.com/developers/applications> → *New Application* → *Bot*.
2. Copia el **token** a `BOT_TOKEN`.
3. En *OAuth2 → URL Generator*, marca los scopes **`bot`** y **`applications.commands`** y el permiso
   **`Administrator`** (o al menos *Send Messages*, *Embed Links*).
4. Invita el bot con la URL generada.

### Comandos de Discord

| Comando | Descripción |
|---|---|
| `/info [jugador]` | Ficha completa |
| `/inventario [jugador]` | Inventario |
| `/echest [jugador]` | Cofre de ender |
| `/armadura [jugador]` | Armadura |
| `/manos [jugador]` | Manos |
| `/efectos [jugador]` | Efectos |
| `/donde [jugador]` | Ubicación |
| `/jugadores` | Conectados |
| `/estado` | Estado del servidor |

> Si omites `jugador`, el plugin devuelve los datos del propio administrador que ejecuta el comando
> (su personaje en el juego). **Restricción de acceso**: solo pueden usar el bot los roles/usuarios de
> `ADMIN_ROLE_IDS`/`ADMIN_USER_IDS` o, si no configuraste ninguno, quien tenga permiso de
> Administrador en el servidor de Discord.

---

## Protocolo del socket (referencia)

El bot y el plugin se comunican por TCP con JSON delimitado por saltos de línea (`\n`).

```
Bot  →  {"action":"auth","token":"..."}
Plugin → {"action":"auth_ok","server":{...}}          (o {"action":"response","ok":false,"type":"auth",...})

Bot  →  {"id":"1","action":"info","player":"Steve"}
Plugin → {"action":"response","ok":true,"type":"info","id":"1","data":{...}}

Bot  →  {"id":"2","action":"status"}
Plugin → {"action":"response","ok":true,"type":"status","id":"2","data":{...}}
```

Acciones disponibles: `info`, `inventory`, `enderchest`, `armor`, `hand`, `effects`, `location`,
`players`, `status`, `ping`. Todas devuelven `data` como objeto JSON (ver `InfoUtil.java` para el
esquema exacto de cada una).

---

## Solución de problemas

| Problema | Solución |
|---|---|
| El bot dice "no conectado al servidor" | ¿Plugin activo? ¿`socket.enabled: true`? ¿host/puerto/token coinciden en `.env` y `config.yml`? ¿Firewall? |
| "Token incorrecto" en la consola del plugin | Los `SOCKET_TOKEN`/`token` no coinciden. Cópialos idénticos. |
| Los comandos de Discord no aparecen | Registra con `GUILD_ID` (aparecen al instante) o espera ~1 h para globales. Verifica el scope `applications.commands`. |
| No tienes permiso en Discord | Configura `ADMIN_ROLE_IDS`/`ADMIN_USER_IDS` o dale el permiso Administrador a tu rol. |
| `./gradlew` no compila | Necesitas JDK 21 (`java -version`). El wrapper descarga Gradle solo. |

---

## Licencia

MIT — úsalo y modifícalo libremente. Este proyecto es solo de consulta/administración; úsalo
respetando las normas de tu servidor y la privacidad de tus jugadores.
