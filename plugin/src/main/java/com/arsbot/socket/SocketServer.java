package com.arsbot.socket;

import com.arsbot.ArsBotPlugin;
import org.bukkit.Bukkit;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.logging.Level;

/**
 * Servidor de sockets al que se conecta el bot de Discord.
 * Protocolo: JSON delimitado por saltos de línea (una petición por línea).
 * Cada cliente debe autenticarse con {"action":"auth","token":"..."}.
 */
public final class SocketServer {

    private final ArsBotPlugin plugin;
    private final Set<SocketClientHandler> clients = ConcurrentHashMap.newKeySet();

    private ServerSocket serverSocket;
    private ExecutorService pool;
    private volatile boolean running = false;
    private Thread acceptThread;

    public SocketServer(ArsBotPlugin plugin) {
        this.plugin = plugin;
    }

    public synchronized void start() {
        if (running) {
            return;
        }
        String host = plugin.getConfig().getString("socket.host", "127.0.0.1");
        int port = plugin.getConfig().getInt("socket.port", 25590);
        String token = plugin.getConfig().getString("socket.token", "");

        try {
            serverSocket = new ServerSocket();
            serverSocket.bind(new InetSocketAddress(host, port));
        } catch (IOException e) {
            plugin.getLogger().log(Level.SEVERE, "No se pudo abrir el socket " + host + ":" + port, e);
            return;
        }

        pool = Executors.newCachedThreadPool(runnable -> {
            Thread t = new Thread(runnable, "ArsBot-Socket-Client");
            t.setDaemon(true);
            return t;
        });
        running = true;

        acceptThread = new Thread(this::acceptLoop, "ArsBot-Socket-Accept");
        acceptThread.setDaemon(true);
        acceptThread.start();

        plugin.getLogger().info("Socket del bot escuchando en " + host + ":" + port);
    }

    private void acceptLoop() {
        while (running && !serverSocket.isClosed()) {
            try {
                Socket socket = serverSocket.accept();
                SocketClientHandler handler = new SocketClientHandler(plugin, this, socket);
                clients.add(handler);
                try {
                    pool.execute(handler);
                } catch (RuntimeException e) {
                    clients.remove(handler);
                    handler.close();
                }
            } catch (IOException e) {
                if (running) {
                    plugin.getLogger().log(Level.WARNING, "Error aceptando conexión del bot", e);
                }
            }
        }
    }

    public void remove(SocketClientHandler handler) {
        clients.remove(handler);
    }

    public int connectedClients() {
        return clients.size();
    }

    public synchronized void stop() {
        running = false;
        try {
            if (serverSocket != null) {
                serverSocket.close();
            }
        } catch (IOException ignored) {
            // ya cerrado
        }
        for (SocketClientHandler handler : clients) {
            handler.close();
        }
        clients.clear();
        if (pool != null) {
            pool.shutdownNow();
            pool = null;
        }
        plugin.getLogger().info("Socket del bot detenido.");
    }

    /** Envuelve la ejecución de código que toca la API de Bukkit en el hilo principal. */
    public void onMain(Runnable task) {
        if (Bukkit.isPrimaryThread()) {
            task.run();
        } else {
            Bukkit.getScheduler().runTask(plugin, task);
        }
    }

    public String getToken() {
        return plugin.getConfig().getString("socket.token", "");
    }

    public String getServerName() {
        return plugin.getServer().getName();
    }
}
