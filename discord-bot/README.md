# arsBot — Bot de Discord

Bot de administración que se conecta al plugin **ArsBot** (Paper) por socket TCP y expone comandos
de barra para consultar información de los jugadores y del servidor.

## Requisitos

- Node.js **18+**
- El plugin ArsBot instalado y con su socket activo (ver el `README.md` raíz).

## Instalación

```bash
npm install
cp .env.example .env   # y edita los valores
npm start
```

## Pruebas (sin Discord ni Minecraft)

```bash
npm test
```

Ejecuta un servidor socket falso y comprueba el protocolo completo del puente y el formateo de todos
los comandos.

## Configuración (.env)

| Variable | Descripción |
|---|---|
| `BOT_TOKEN` | Token del bot de Discord (obligatorio) |
| `GUILD_ID` | ID del servidor para registrar comandos al instante (opcional) |
| `SOCKET_HOST` | IP del plugin (`127.0.0.1` si está en la misma máquina) |
| `SOCKET_PORT` | Puerto del socket (por defecto `25590`) |
| `SOCKET_TOKEN` | Token secreto compartido con `config.yml` del plugin |
| `ADMIN_ROLE_IDS` | Roles de Discord autorizados (opcional, separados por comas) |
| `ADMIN_USER_IDS` | Usuarios autorizados (opcional, separados por comas) |

## Comandos

`/info`, `/inventario`, `/echest`, `/armadura`, `/manos`, `/efectos`, `/donde`, `/jugadores`, `/estado`.
