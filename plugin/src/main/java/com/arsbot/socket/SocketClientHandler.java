package com.arsbot.socket;

import com.arsbot.ArsBotPlugin;
import com.arsbot.InfoUtil;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonSyntaxException;
import org.bukkit.entity.Player;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.logging.Level;

/**
 * Maneja una conexión de un cliente (el bot de Discord).
 * Protocolo de línea JSON:
 *   -> {"action":"auth","token":"..."}
 *   <- {"action":"auth_ok","server":{...}}  |  {"action":"auth_fail","reason":"..."}
 *   -> {"action":"info","player":"Nombre"}  (o inventory/enderchest/armor/hand/effects/location/players/status)
 *   <- {"action":"response","ok":true,"type":"info","data":{...}}
 */
public final class SocketClientHandler implements Runnable {

    private static final Gson GSON = new Gson();

    private final ArsBotPlugin plugin;
    private final SocketServer server;
    private final Socket socket;
    private final AtomicBoolean authenticated = new AtomicBoolean(false);

    private BufferedWriter writer;
    private BufferedReader reader;

    public SocketClientHandler(ArsBotPlugin plugin, SocketServer server, Socket socket) {
        this.plugin = plugin;
        this.server = server;
        this.socket = socket;
    }

    @Override
    public void run() {
        try {
            socket.setSoTimeout(60_000); // 60 s sin actividad -> cerrar.
            reader = new BufferedReader(new InputStreamReader(socket.getInputStream(), StandardCharsets.UTF_8));
            writer = new BufferedWriter(new OutputStreamWriter(socket.getOutputStream(), StandardCharsets.UTF_8));

            String line;
            while ((line = reader.readLine()) != null) {
                if (line.isBlank()) {
                    continue;
                }
                handle(line.trim());
            }
        } catch (IOException e) {
            if (authenticated.get()) {
                plugin.getLogger().log(Level.INFO, "Bot desconectado: {0}", e.getMessage());
            }
        } finally {
            close();
        }
    }

    private void handle(String line) {
        JsonObject request;
        try {
            request = JsonParser.parseString(line).getAsJsonObject();
        } catch (JsonSyntaxException | IllegalStateException e) {
            sendError(null, "request", "JSON inválido");
            return;
        }

        String action = request.has("action") ? request.get("action").getAsString() : "";

        if (!authenticated.get()) {
            if ("auth".equals(action)) {
                authenticate(request);
            } else {
                sendError(null, "auth", "Autentícate primero con {\"action\":\"auth\",\"token\":\"...\"}");
            }
            return;
        }

        // Las peticiones que tocan la API de Bukkit se ejecutan en el hilo principal.
        server.onMain(() -> dispatch(action, request));
    }

    private void dispatch(String action, JsonObject request) {
        String id = request.has("id") ? request.get("id").getAsString() : null;
        try {
            switch (action.toLowerCase(Locale.ROOT)) {
                case "info":
                    respond(id, "info", InfoUtil.playerInfo(requirePlayer(request)));
                    break;
                case "inventory":
                case "inv":
                    respond(id, "inventory", InfoUtil.inventory(requirePlayer(request)));
                    break;
                case "enderchest":
                case "echest":
                case "ender":
                    respond(id, "enderchest", InfoUtil.enderChest(requirePlayer(request)));
                    break;
                case "armor":
                case "armour":
                    respond(id, "armor", InfoUtil.armor(requirePlayer(request)));
                    break;
                case "hand":
                    respond(id, "hand", InfoUtil.hand(requirePlayer(request)));
                    break;
                case "effects":
                    respond(id, "effects", InfoUtil.effects(requirePlayer(request)));
                    break;
                case "location":
                case "where":
                    respond(id, "location", InfoUtil.location(requirePlayer(request)));
                    break;
                case "players":
                case "list":
                    respond(id, "players", InfoUtil.playersList());
                    break;
                case "status":
                    respond(id, "status", InfoUtil.serverStatus());
                    break;
                case "ping":
                    respond(id, "ping", new JsonObject());
                    break;
                default:
                    sendError(id, "request", "Acción desconocida: " + action);
                    break;
            }
        } catch (RuntimeException e) {
            sendError(id, action, e.getMessage() == null ? "Error interno" : e.getMessage());
        }
    }

    private Player requirePlayer(JsonObject request) {
        if (!request.has("player")) {
            throw new IllegalArgumentException("Falta el campo \"player\"");
        }
        Player player = InfoUtil.findPlayer(request.get("player").getAsString());
        if (player == null) {
            throw new IllegalArgumentException("Jugador no encontrado o desconectado: "
                    + request.get("player").getAsString());
        }
        return player;
    }

    private void authenticate(JsonObject request) {
        String token = request.has("token") ? request.get("token").getAsString() : "";
        if (token.isEmpty() || !token.equals(server.getToken())) {
            sendError(null, "auth", "Token incorrecto");
            close();
            return;
        }
        if (server.connectedClients() > plugin.getConfig().getInt("socket.max-connections", 10)) {
            sendError(null, "auth", "Demasiadas conexiones");
            close();
            return;
        }
        authenticated.set(true);
        JsonObject out = new JsonObject();
        out.addProperty("action", "auth_ok");
        JsonObject meta = new JsonObject();
        meta.addProperty("name", server.getServerName());
        out.add("server", meta);
        send(out);
        plugin.getLogger().info("Bot de Discord autenticado correctamente.");
    }

    private void respond(String id, String type, JsonObject data) {
        JsonObject out = new JsonObject();
        out.addProperty("action", "response");
        out.addProperty("ok", true);
        out.addProperty("type", type);
        if (id != null) {
            out.addProperty("id", id);
        }
        out.add("data", data);
        send(out);
    }

    private void sendError(String id, String type, String message) {
        JsonObject out = new JsonObject();
        out.addProperty("action", "response");
        out.addProperty("ok", false);
        out.addProperty("type", type);
        if (id != null) {
            out.addProperty("id", id);
        }
        out.addProperty("error", message);
        send(out);
    }

    private synchronized void send(JsonObject json) {
        try {
            if (writer != null) {
                writer.write(GSON.toJson(json));
                writer.newLine();
                writer.flush();
            }
        } catch (IOException e) {
            close();
        }
    }

    public synchronized void close() {
        try {
            socket.close();
        } catch (IOException ignored) {
            // nada
        }
        server.remove(this);
    }
}
