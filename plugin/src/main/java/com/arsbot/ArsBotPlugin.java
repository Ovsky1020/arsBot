package com.arsbot;

import com.arsbot.command.ArsCommand;
import com.arsbot.gui.InventoryViewer;
import com.arsbot.socket.SocketServer;
import org.bukkit.command.PluginCommand;
import org.bukkit.plugin.java.JavaPlugin;

public final class ArsBotPlugin extends JavaPlugin {

    private SocketServer socketServer;
    private InventoryViewer inventoryViewer;

    @Override
    public void onEnable() {
        saveDefaultConfig();
        reloadConfig();

        InfoUtil.serverStart = System.currentTimeMillis();

        inventoryViewer = new InventoryViewer(this);
        getServer().getPluginManager().registerEvents(inventoryViewer, this);

        PluginCommand command = getCommand("arsbot");
        if (command != null) {
            ArsCommand executor = new ArsCommand(this, inventoryViewer);
            command.setExecutor(executor);
            command.setTabCompleter(executor);
        }

        startSocket();
        getLogger().info("ArsBot habilitado. Usa /arsbot help para ver los comandos.");
    }

    /** Detiene el socket actual y lo vuelve a arrancar si está habilitado en config.yml. */
    public void startSocket() {
        stopSocket();
        if (getConfig().getBoolean("socket.enabled", true)) {
            socketServer = new SocketServer(this);
            socketServer.start();
        }
    }

    public void stopSocket() {
        if (socketServer != null) {
            socketServer.stop();
            socketServer = null;
        }
    }

    @Override
    public void onDisable() {
        stopSocket();
        getLogger().info("ArsBot deshabilitado.");
    }
}
