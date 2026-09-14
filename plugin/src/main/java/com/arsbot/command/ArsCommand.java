package com.arsbot.command;

import com.arsbot.InfoUtil;
import com.arsbot.gui.InventoryViewer;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import org.bukkit.Bukkit;
import org.bukkit.ChatColor;
import org.bukkit.World;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.command.TabCompleter;
import org.bukkit.entity.Player;
import org.bukkit.plugin.java.JavaPlugin;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.TimeUnit;

/**
 * Implementa el comando /arsbot y sus subcomandos.
 * Los JSON de InfoUtil se formatean aquí como texto para el chat/consola.
 */
public final class ArsCommand implements CommandExecutor, TabCompleter {

    private static final String[] SUBCOMMANDS = {
            "info", "inv", "echest", "armor", "hand", "effects", "where", "players", "status", "view", "reload", "help"
    };
    private static final String[] VIEW_KINDS = {"inv", "echest", "armor"};

    private final JavaPlugin plugin;
    private final InventoryViewer viewer;

    public ArsCommand(JavaPlugin plugin, InventoryViewer viewer) {
        this.plugin = plugin;
        this.viewer = viewer;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (args.length == 0) {
            sendHelp(sender);
            return true;
        }
        String sub = args[0].toLowerCase(Locale.ROOT);
        switch (sub) {
            case "info":
                cmdInfo(sender, args);
                break;
            case "inv":
            case "inventory":
                cmdInventory(sender, args, false);
                break;
            case "echest":
            case "ender":
                cmdEnderChest(sender, args, false);
                break;
            case "armor":
            case "armour":
                cmdArmor(sender, args, false);
                break;
            case "hand":
                cmdHand(sender, args, false);
                break;
            case "effects":
                cmdEffects(sender, args);
                break;
            case "where":
            case "loc":
            case "coords":
                cmdWhere(sender, args);
                break;
            case "players":
            case "list":
            case "who":
                cmdPlayers(sender);
                break;
            case "status":
                cmdStatus(sender);
                break;
            case "view":
            case "ver":
                cmdView(sender, args);
                break;
            case "reload":
                cmdReload(sender);
                break;
            case "help":
                sendHelp(sender);
                break;
            default:
                sender.sendMessage(ChatColor.RED + "Subcomando desconocido: " + args[0] + ". Usa /arsbot help.");
                return true;
        }
        return true;
    }

    // ------------------------------------------------------------------
    // Subcomandos
    // ------------------------------------------------------------------

    private void cmdInfo(CommandSender sender, String[] args) {
        if (!perm(sender, "info")) {
            return;
        }
        Player target = targetOrSelf(sender, args, 1);
        if (target == null) {
            return;
        }
        JsonObject o = InfoUtil.playerInfo(target);
        String d = ChatColor.DARK_AQUA + "●" + ChatColor.AQUA + " " + o.get("name").getAsString() + ChatColor.DARK_AQUA + " ●";
        sender.sendMessage(ChatColor.GOLD + "====" + ChatColor.YELLOW + " Ficha de " + d + ChatColor.GOLD + " ====");
        sender.sendMessage(keyVal("UUID", o.get("uuid").getAsString()));
        sender.sendMessage(keyVal("Nombre visible", o.get("displayName").getAsString()));
        sender.sendMessage(keyVal("Vida", o.get("health").getAsDouble() + "/" + o.get("maxHealth").getAsDouble()
                + " (" + o.get("healthPercentage").getAsInt() + "%)"));
        sender.sendMessage(keyVal("Hambre", o.get("food").getAsInt() + " (" + o.get("saturation").getAsDouble() + " sat.)"));
        sender.sendMessage(keyVal("Nivel / EXP", o.get("level").getAsInt() + " niveles, " + o.get("exp").getAsDouble()
                + " barra (" + o.get("totalExp").getAsInt() + " EXP total)"));
        sender.sendMessage(keyVal("Modo de juego", o.get("gamemode").getAsString()));
        sender.sendMessage(keyVal("Operador", yesNo(o.get("op").getAsBoolean())));
        sender.sendMessage(keyVal("Volando", o.get("flying").getAsBoolean() + " (permitido: " + o.get("allowFlight").getAsBoolean() + ")"));
        sender.sendMessage(keyVal("Ping", o.get("ping").getAsInt() + " ms"));
        sender.sendMessage(keyVal("IP", o.get("ip").getAsString()));
        JsonObject coords = o.getAsJsonObject("coords");
        sender.sendMessage(keyVal("Ubicación", String.format(Locale.ROOT, "%.2f, %.2f, %.2f",
                coords.get("x").getAsDouble(), coords.get("y").getAsDouble(), coords.get("z").getAsDouble())));
        sender.sendMessage(keyVal("Mundo", o.get("world").getAsString() + " (" + o.get("dimension").getAsString() + ")"));
        sender.sendMessage(keyVal("Bioma", o.get("biome").getAsString()));
        sender.sendMessage(keyVal("Objetos", o.get("inventoryCount").getAsInt() + " en inventario, "
                + o.get("enderchestCount").getAsInt() + " en EnderChest"));
        sender.sendMessage(keyVal("Efectos", effectsLine(o.getAsJsonArray("effects"))));
        sender.sendMessage(keyVal("Primera conexión", date(o.get("firstPlayed").getAsLong())));
        sender.sendMessage(keyVal("Última conexión", date(o.get("lastPlayed").getAsLong())));
        sender.sendMessage(keyVal("Tiempo jugado", duration(o.get("playTimeTicks").getAsLong() * 50)));
    }

    private void cmdInventory(CommandSender sender, String[] args, boolean silent) {
        if (!perm(sender, "inventory")) {
            return;
        }
        Player target = targetOrSelf(sender, args, 1);
        if (target == null) {
            return;
        }
        JsonObject o = InfoUtil.inventory(target);
        sender.sendMessage(ChatColor.GOLD + "==== " + ChatColor.YELLOW + "Inventario de "
                + o.get("player").getAsString() + ChatColor.GRAY + " (" + itemsCount(o) + " objetos)" + ChatColor.GOLD + " ====");
        printItems(sender, o);
    }

    private void cmdEnderChest(CommandSender sender, String[] args, boolean silent) {
        if (!perm(sender, "inventory")) {
            return;
        }
        Player target = targetOrSelf(sender, args, 1);
        if (target == null) {
            return;
        }
        JsonObject o = InfoUtil.enderChest(target);
        sender.sendMessage(ChatColor.GOLD + "==== " + ChatColor.LIGHT_PURPLE + "EnderChest de "
                + o.get("player").getAsString() + ChatColor.GRAY + " (" + itemsCount(o) + " objetos)" + ChatColor.GOLD + " ====");
        printItems(sender, o);
    }

    private void cmdArmor(CommandSender sender, String[] args, boolean silent) {
        if (!perm(sender, "inventory")) {
            return;
        }
        Player target = targetOrSelf(sender, args, 1);
        if (target == null) {
            return;
        }
        JsonObject o = InfoUtil.armor(target);
        sender.sendMessage(ChatColor.GOLD + "==== " + ChatColor.YELLOW + "Armadura de "
                + o.get("player").getAsString() + ChatColor.GOLD + " ====");
        printItems(sender, o);
    }

    private void cmdHand(CommandSender sender, String[] args, boolean silent) {
        if (!perm(sender, "inventory")) {
            return;
        }
        Player target = targetOrSelf(sender, args, 1);
        if (target == null) {
            return;
        }
        JsonObject o = InfoUtil.hand(target);
        sender.sendMessage(ChatColor.GOLD + "==== " + ChatColor.YELLOW + "Manos de "
                + o.get("player").getAsString() + ChatColor.GOLD + " ====");
        printItems(sender, o);
    }

    private void cmdEffects(CommandSender sender, String[] args) {
        if (!perm(sender, "info")) {
            return;
        }
        Player target = targetOrSelf(sender, args, 1);
        if (target == null) {
            return;
        }
        JsonObject o = InfoUtil.effects(target);
        sender.sendMessage(ChatColor.GOLD + "==== " + ChatColor.YELLOW + "Efectos de "
                + o.get("player").getAsString() + ChatColor.GOLD + " ====");
        sender.sendMessage(keyVal("Efectos", effectsLine(o.getAsJsonArray("effects"))));
    }

    private void cmdWhere(CommandSender sender, String[] args) {
        if (!perm(sender, "location")) {
            return;
        }
        Player target = targetOrSelf(sender, args, 1);
        if (target == null) {
            return;
        }
        JsonObject o = InfoUtil.location(target);
        JsonObject coords = o.getAsJsonObject("coords");
        sender.sendMessage(ChatColor.GOLD + "==== " + ChatColor.YELLOW + "Ubicación de "
                + o.get("player").getAsString() + ChatColor.GOLD + " ====");
        sender.sendMessage(keyVal("Coordenadas", String.format(Locale.ROOT, "%.2f, %.2f, %.2f",
                coords.get("x").getAsDouble(), coords.get("y").getAsDouble(), coords.get("z").getAsDouble())));
        sender.sendMessage(keyVal("Bloque", coords.get("blockX").getAsInt() + ", " + coords.get("blockY").getAsInt()
                + ", " + coords.get("blockZ").getAsInt()));
        sender.sendMessage(keyVal("Mundo", o.get("world").getAsString() + " (" + o.get("dimension").getAsString() + ")"));
        sender.sendMessage(keyVal("Bioma", o.get("biome").getAsString()));
    }

    private void cmdPlayers(CommandSender sender) {
        if (!perm(sender, "status")) {
            return;
        }
        List<Player> players = new ArrayList<>(Bukkit.getOnlinePlayers());
        sender.sendMessage(ChatColor.GOLD + "==== " + ChatColor.YELLOW + "Jugadores conectados ("
                + players.size() + "/" + Bukkit.getMaxPlayers() + ")" + ChatColor.GOLD + " ====");
        if (players.isEmpty()) {
            sender.sendMessage(ChatColor.GRAY + "No hay nadie conectado.");
            return;
        }
        StringBuilder sb = new StringBuilder();
        for (Player p : players) {
            sb.append(ChatColor.GREEN).append(p.getName()).append(ChatColor.GRAY)
                    .append(" [").append(p.getPing()).append("ms]").append(ChatColor.WHITE).append(", ");
        }
        sender.sendMessage(sb.substring(0, sb.length() - 2));
    }

    private void cmdStatus(CommandSender sender) {
        if (!perm(sender, "status")) {
            return;
        }
        sender.sendMessage(ChatColor.GOLD + "==== " + ChatColor.YELLOW + "Estado del servidor" + ChatColor.GOLD + " ====");
        sender.sendMessage(keyVal("Versión", Bukkit.getVersion()));
        sender.sendMessage(keyVal("Jugadores", Bukkit.getOnlinePlayers().size() + "/" + Bukkit.getMaxPlayers()));
        double[] tps = Bukkit.getTPS();
        StringBuilder tpsStr = new StringBuilder();
        for (double t : tps) {
            tpsStr.append(String.format(Locale.ROOT, "%.1f", t)).append(", ");
        }
        sender.sendMessage(keyVal("TPS (1m, 5m, 15m)", tpsStr.substring(0, tpsStr.length() - 2)));
        sender.sendMessage(keyVal("Uptime", duration(System.currentTimeMillis() - InfoUtil.serverStart)));
        List<World> worlds = Bukkit.getWorlds();
        StringBuilder worldsStr = new StringBuilder();
        for (World w : worlds) {
            worldsStr.append(w.getName()).append(", ");
        }
        sender.sendMessage(keyVal("Mundos", worldsStr.substring(0, worldsStr.length() - 2)));
    }

    private void cmdView(CommandSender sender, String[] args) {
        if (!(sender instanceof Player)) {
            sender.sendMessage(ChatColor.RED + "Este subcomando solo puede usarse dentro del juego.");
            return;
        }
        Player viewer = (Player) sender;
        if (!perm(sender, "inventory")) {
            return;
        }
        Player target = targetOrSelf(sender, args, 1);
        if (target == null) {
            return;
        }
        String kind = args.length >= 3 ? args[2].toLowerCase(Locale.ROOT) : "inv";
        switch (kind) {
            case "inv":
            case "inventory":
                viewer.openInventory(viewer, target);
                break;
            case "echest":
            case "ender":
                viewer.openEnderChest(viewer, target);
                break;
            case "armor":
            case "armour":
                viewer.openArmor(viewer, target);
                break;
            default:
                viewer.sendMessage(ChatColor.RED + "Tipo de vista no válido. Usa: inv, echest o armor.");
                return;
        }
        viewer.sendMessage(ChatColor.GREEN + "Abriendo vista de " + kind + " de " + target.getName()
                + ". (Solo lectura: clic izquierdo para inspeccionar un objeto).");
    }

    private void cmdReload(CommandSender sender) {
        if (!perm(sender, "reload")) {
            return;
        }
        plugin.reloadConfig();
        plugin.startSocket();
        sender.sendMessage(ChatColor.GREEN + "Configuración de ArsBot recargada y socket reiniciado.");
    }

    // ------------------------------------------------------------------
    // Utilidades de salida
    // ------------------------------------------------------------------

    private String keyVal(String key, String value) {
        return ChatColor.AQUA + key + ": " + ChatColor.WHITE + value;
    }

    private String yesNo(boolean b) {
        return b ? ChatColor.GREEN + "sí" : ChatColor.RED + "no";
    }

    private void printItems(CommandSender sender, JsonObject o) {
        JsonArray items = o.getAsJsonArray("items");
        if (items.isEmpty()) {
            sender.sendMessage(ChatColor.GRAY + "(vacío)");
            return;
        }
        for (JsonElement el : items) {
            JsonObject it = el.getAsJsonObject();
            String label = it.has("label") ? ChatColor.GOLD + "[" + it.get("label").getAsString() + "] " : "";
            StringBuilder line = new StringBuilder();
            line.append(ChatColor.GRAY).append("slot ").append(it.get("slot").getAsInt()).append(": ");
            line.append(label);
            if ("AIR".equals(it.get("type").getAsString())) {
                line.append(ChatColor.GRAY).append("vacío");
                sender.sendMessage(line.toString());
                continue;
            }
            String name = it.has("name") ? it.get("name").getAsString()
                    : it.get("id").getAsString().replace("minecraft:", "").replace('_', ' ');
            line.append(ChatColor.WHITE).append(name).append(ChatColor.GRAY).append(" x").append(it.get("amount").getAsInt());
            if (it.has("durability") && it.get("maxDurability").getAsInt() > 0) {
                int left = it.get("maxDurability").getAsInt() - it.get("durability").getAsInt();
                line.append(ChatColor.GRAY).append(" (").append(left).append('/')
                        .append(it.get("maxDurability").getAsInt()).append(')');
            }
            if (it.has("enchants")) {
                JsonArray enchants = it.getAsJsonArray("enchants");
                if (!enchants.isEmpty()) {
                    line.append(ChatColor.AQUA).append(" [");
                    for (int i = 0; i < enchants.size(); i++) {
                        if (i > 0) {
                            line.append(", ");
                        }
                        JsonObject e = enchants.get(i).getAsJsonObject();
                        line.append(e.get("id").getAsString().replace("minecraft:", "")).append(' ')
                                .append(e.get("level").getAsInt());
                    }
                    line.append(']');
                }
            }
            if (it.has("lore")) {
                JsonArray lore = it.getAsJsonArray("lore");
                for (JsonElement l : lore) {
                    line.append(ChatColor.DARK_GRAY).append("  | ").append(l.getAsString());
                }
            }
            sender.sendMessage(line.toString());
        }
    }

    private String effectsLine(JsonArray effects) {
        if (effects.isEmpty()) {
            return "ninguno";
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < effects.size(); i++) {
            if (i > 0) {
                sb.append(", ");
            }
            JsonObject e = effects.get(i).getAsJsonObject();
            sb.append(e.get("name").getAsString()).append(' ').append(e.get("amplifier").getAsInt() + 1)
                    .append(" (").append(e.get("seconds").getAsInt()).append("s)");
        }
        return sb.toString();
    }

    private int itemsCount(JsonObject o) {
        return o.getAsJsonArray("items").size();
    }

    private static String duration(long millis) {
        long days = TimeUnit.MILLISECONDS.toDays(millis);
        long hours = TimeUnit.MILLISECONDS.toHours(millis) % 24;
        long minutes = TimeUnit.MILLISECONDS.toMinutes(millis) % 60;
        long seconds = TimeUnit.MILLISECONDS.toSeconds(millis) % 60;
        StringBuilder sb = new StringBuilder();
        if (days > 0) {
            sb.append(days).append("d ");
        }
        if (hours > 0) {
            sb.append(hours).append("h ");
        }
        sb.append(minutes).append("m ").append(seconds).append('s');
        return sb.toString();
    }

    private static String date(long millis) {
        java.text.SimpleDateFormat fmt = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm");
        return fmt.format(new java.util.Date(millis));
    }

    // ------------------------------------------------------------------
    // Permisos y búsqueda de objetivo
    // ------------------------------------------------------------------

    private boolean perm(CommandSender sender, String node) {
        if (sender.hasPermission("arsbot.use") || sender.hasPermission("arsbot." + node)) {
            return true;
        }
        sender.sendMessage(ChatColor.RED + "No tienes permiso (arsbot." + node + ").");
        return false;
    }

    private Player targetOrSelf(CommandSender sender, String[] args, int index) {
        Player target;
        if (args.length > index) {
            target = InfoUtil.findPlayer(args[index]);
            if (target == null) {
                sender.sendMessage(ChatColor.RED + "Jugador no encontrado (¿está conectado?): " + args[index]);
                return null;
            }
        } else if (sender instanceof Player) {
            target = (Player) sender;
        } else {
            sender.sendMessage(ChatColor.RED + "La consola debe indicar el nombre de un jugador.");
            return null;
        }
        return target;
    }

    // ------------------------------------------------------------------
    // Ayuda y autocompletado
    // ------------------------------------------------------------------

    private void sendHelp(CommandSender sender) {
        sender.sendMessage(ChatColor.GOLD + "==== " + ChatColor.YELLOW + "ArsBot — Comandos de administración" + ChatColor.GOLD + " ====");
        sender.sendMessage(ChatColor.AQUA + "/arsbot info <jugador>" + ChatColor.GRAY + " — Ficha completa del jugador.");
        sender.sendMessage(ChatColor.AQUA + "/arsbot inv <jugador>" + ChatColor.GRAY + " — Lista su inventario.");
        sender.sendMessage(ChatColor.AQUA + "/arsbot echest <jugador>" + ChatColor.GRAY + " — Lista su cofre de ender.");
        sender.sendMessage(ChatColor.AQUA + "/arsbot armor <jugador>" + ChatColor.GRAY + " — Muestra su armadura.");
        sender.sendMessage(ChatColor.AQUA + "/arsbot hand <jugador>" + ChatColor.GRAY + " — Muestra sus manos.");
        sender.sendMessage(ChatColor.AQUA + "/arsbot effects <jugador>" + ChatColor.GRAY + " — Efectos activos.");
        sender.sendMessage(ChatColor.AQUA + "/arsbot where <jugador>" + ChatColor.GRAY + " — Coordenadas, mundo y bioma.");
        sender.sendMessage(ChatColor.AQUA + "/arsbot view <jugador> [inv|echest|armor]" + ChatColor.GRAY + " — Abre una GUI de solo lectura.");
        sender.sendMessage(ChatColor.AQUA + "/arsbot players" + ChatColor.GRAY + " — Lista de conectados.");
        sender.sendMessage(ChatColor.AQUA + "/arsbot status" + ChatColor.GRAY + " — Estado del servidor.");
        sender.sendMessage(ChatColor.AQUA + "/arsbot reload" + ChatColor.GRAY + " — Recarga la configuración.");
        sender.sendMessage(ChatColor.GRAY + "Puedes omitir <jugador> para ver tus propios datos.");
    }

    @Override
    public List<String> onTabComplete(CommandSender sender, Command command, String alias, String[] args) {
        if (args.length == 1) {
            return filter(SUBCOMMANDS, args[0]);
        }
        if (args.length == 2) {
            if (isPlayerSub(args[0])) {
                return onlineNames(args[1]);
            }
            if (args[0].equalsIgnoreCase("view")) {
                return onlineNames(args[1]);
            }
        }
        if (args.length == 3 && args[0].equalsIgnoreCase("view")) {
            return filter(VIEW_KINDS, args[2]);
        }
        return Collections.emptyList();
    }

    private boolean isPlayerSub(String sub) {
        switch (sub.toLowerCase(Locale.ROOT)) {
            case "info":
            case "inv":
            case "inventory":
            case "echest":
            case "ender":
            case "armor":
            case "armour":
            case "hand":
            case "effects":
            case "where":
            case "loc":
            case "coords":
            case "view":
            case "ver":
                return true;
            default:
                return false;
        }
    }

    private List<String> onlineNames(String prefix) {
        List<String> names = new ArrayList<>();
        for (Player p : Bukkit.getOnlinePlayers()) {
            names.add(p.getName());
        }
        return filter(names, prefix);
    }

    private List<String> filter(String[] options, String prefix) {
        List<String> list = new ArrayList<>();
        for (String s : options) {
            if (s.startsWith(prefix.toLowerCase(Locale.ROOT))) {
                list.add(s);
            }
        }
        return list;
    }

    private List<String> filter(List<String> options, String prefix) {
        List<String> list = new ArrayList<>();
        for (String s : options) {
            if (s.toLowerCase(Locale.ROOT).startsWith(prefix.toLowerCase(Locale.ROOT))) {
                list.add(s);
            }
        }
        return list;
    }
}
