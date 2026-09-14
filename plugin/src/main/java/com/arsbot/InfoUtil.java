package com.arsbot;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import org.bukkit.Bukkit;
import org.bukkit.ChatColor;
import org.bukkit.Location;
import org.bukkit.World;
import org.bukkit.enchantments.Enchantment;
import org.bukkit.entity.Player;
import org.bukkit.inventory.ItemStack;
import org.bukkit.inventory.meta.Damageable;
import org.bukkit.inventory.meta.ItemMeta;
import org.bukkit.inventory.meta.SkullMeta;
import org.bukkit.potion.PotionEffect;
import org.bukkit.Statistic;

import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Construye los datos (en JSON) que consume tanto el comando en el juego
 * como el bot de Discord a través del socket. La estructura de estos JSON
 * es el "contrato" del protocolo y debe coincidir con lo que espera el bot.
 */
public final class InfoUtil {

    /** Marca de tiempo en la que arrancó el plugin (para calcular el uptime). */
    public static long serverStart = System.currentTimeMillis();

    private InfoUtil() {}

    // ------------------------------------------------------------------
    // Búsqueda de jugadores
    // ------------------------------------------------------------------

    /** Busca un jugador conectado por nombre exacto o por prefijo (sin distinguir mayúsculas). */
    public static Player findPlayer(String name) {
        if (name == null || name.isEmpty()) {
            return null;
        }
        Player exact = Bukkit.getPlayerExact(name);
        if (exact != null) {
            return exact;
        }
        String lower = name.toLowerCase(Locale.ROOT);
        for (Player player : Bukkit.getOnlinePlayers()) {
            if (player.getName().toLowerCase(Locale.ROOT).startsWith(lower)) {
                return player;
            }
        }
        return null;
    }

    // ------------------------------------------------------------------
    // Ficha completa del jugador
    // ------------------------------------------------------------------

    public static JsonObject playerInfo(Player p) {
        JsonObject o = new JsonObject();
        o.addProperty("name", p.getName());
        o.addProperty("uuid", p.getUniqueId().toString());
        o.addProperty("displayName", p.getDisplayName());
        o.addProperty("online", p.isOnline());

        double health = p.getHealth();
        double maxHealth = p.getMaxHealth();
        o.addProperty("health", round1(health));
        o.addProperty("maxHealth", round1(maxHealth));
        o.addProperty("healthPercentage", percentage(health, maxHealth));

        o.addProperty("food", p.getFoodLevel());
        o.addProperty("saturation", round1(p.getSaturation()));
        o.addProperty("level", p.getLevel());
        o.addProperty("exp", round2(p.getExp()));
        o.addProperty("totalExp", p.getTotalExperience());
        o.addProperty("gamemode", p.getGameMode().name());
        o.addProperty("op", p.isOp());
        o.addProperty("flying", p.isFlying());
        o.addProperty("allowFlight", p.getAllowFlight());
        o.addProperty("ping", p.getPing());

        if (p.getAddress() != null && p.getAddress().getAddress() != null) {
            o.addProperty("ip", p.getAddress().getAddress().getHostAddress());
        } else {
            o.addProperty("ip", "?");
        }

        World world = p.getWorld();
        o.addProperty("world", world.getName());
        o.addProperty("dimension", world.getEnvironment().name().toLowerCase(Locale.ROOT));

        o.add("coords", coords(p.getLocation()));
        o.addProperty("biome", biomeAt(p.getLocation()));

        o.add("effects", effectsArray(p));

        o.addProperty("inventoryCount", occupiedSlots(p.getInventory().getStorageContents()));
        o.addProperty("enderchestCount", occupiedSlots(p.getEnderChest().getContents()));

        o.addProperty("firstPlayed", p.getFirstPlayed());
        o.addProperty("lastPlayed", p.getLastPlayed());
        o.addProperty("playTimeTicks", p.getStatistic(Statistic.PLAY_ONE_MINUTE));
        o.addProperty("serverUptimeMs", System.currentTimeMillis() - serverStart);
        return o;
    }

    // ------------------------------------------------------------------
    // Inventario / enderchest / armadura / mano
    // ------------------------------------------------------------------

    public static JsonObject inventory(Player p) {
        JsonObject o = base(p);
        JsonArray items = new JsonArray();
        ItemStack[] contents = p.getInventory().getStorageContents();
        for (int i = 0; i < contents.length; i++) {
            if (contents[i] != null && !contents[i].getType().isAir()) {
                items.add(item(contents[i], i, null));
            }
        }
        ItemStack offHand = p.getInventory().getItemInOffHand();
        if (offHand != null && !offHand.getType().isAir()) {
            items.add(item(offHand, 40, "mano secundaria"));
        }
        o.addProperty("size", contents.length);
        o.add("items", items);
        return o;
    }

    public static JsonObject enderChest(Player p) {
        JsonObject o = base(p);
        JsonArray items = new JsonArray();
        ItemStack[] contents = p.getEnderChest().getContents();
        for (int i = 0; i < contents.length; i++) {
            if (contents[i] != null && !contents[i].getType().isAir()) {
                items.add(item(contents[i], i, null));
            }
        }
        o.addProperty("size", contents.length);
        o.add("items", items);
        return o;
    }

    public static JsonObject armor(Player p) {
        JsonObject o = base(p);
        JsonArray items = new JsonArray();
        ItemStack[] armor = p.getInventory().getArmorContents(); // [botas, pantalones, peto, casco]
        String[] labels = {"Botas", "Pantalones", "Peto", "Casco"};
        for (int i = 0; i < armor.length; i++) {
            if (armor[i] != null && !armor[i].getType().isAir()) {
                items.add(item(armor[i], i, labels[i]));
            }
        }
        o.add("items", items);
        return o;
    }

    public static JsonObject hand(Player p) {
        JsonObject o = base(p);
        JsonArray items = new JsonArray();
        items.add(item(p.getInventory().getItemInMainHand(), 0, "Mano principal"));
        items.add(item(p.getInventory().getItemInOffHand(), 1, "Mano secundaria"));
        o.add("items", items);
        return o;
    }

    // ------------------------------------------------------------------
    // Efectos y ubicación
    // ------------------------------------------------------------------

    public static JsonObject effects(Player p) {
        JsonObject o = base(p);
        o.add("effects", effectsArray(p));
        return o;
    }

    public static JsonObject location(Player p) {
        JsonObject o = base(p);
        o.addProperty("online", p.isOnline());
        World world = p.getWorld();
        o.addProperty("world", world.getName());
        o.addProperty("dimension", world.getEnvironment().name().toLowerCase(Locale.ROOT));
        o.add("coords", coords(p.getLocation()));
        o.addProperty("biome", biomeAt(p.getLocation()));
        return o;
    }

    // ------------------------------------------------------------------
    // Estado del servidor (para el bot)
    // ------------------------------------------------------------------

    public static JsonObject playersList() {
        JsonObject o = new JsonObject();
        JsonArray players = new JsonArray();
        for (Player p : Bukkit.getOnlinePlayers()) {
            JsonObject po = new JsonObject();
            po.addProperty("name", p.getName());
            po.addProperty("uuid", p.getUniqueId().toString());
            po.addProperty("ping", p.getPing());
            po.addProperty("gamemode", p.getGameMode().name());
            po.addProperty("world", p.getWorld().getName());
            players.add(po);
        }
        o.addProperty("count", players.size());
        o.addProperty("max", Bukkit.getMaxPlayers());
        o.add("players", players);
        return o;
    }

    public static JsonObject serverStatus() {
        JsonObject o = new JsonObject();
        o.addProperty("name", Bukkit.getName());
        o.addProperty("version", Bukkit.getVersion());
        o.addProperty("bukkitVersion", Bukkit.getBukkitVersion());
        o.addProperty("onlineCount", Bukkit.getOnlinePlayers().size());
        o.addProperty("maxPlayers", Bukkit.getMaxPlayers());
        o.addProperty("uptimeMs", System.currentTimeMillis() - serverStart);

        JsonArray tps = new JsonArray();
        for (double t : Bukkit.getTPS()) {
            tps.add(round2(t));
        }
        o.add("tps", tps);

        JsonArray worlds = new JsonArray();
        for (World w : Bukkit.getWorlds()) {
            worlds.add(w.getName());
        }
        o.add("worlds", worlds);
        return o;
    }

    // ------------------------------------------------------------------
    // Constructores auxiliares
    // ------------------------------------------------------------------

    private static JsonObject base(Player p) {
        JsonObject o = new JsonObject();
        o.addProperty("player", p.getName());
        return o;
    }

    private static JsonObject coords(Location loc) {
        JsonObject c = new JsonObject();
        c.addProperty("x", round2(loc.getX()));
        c.addProperty("y", round2(loc.getY()));
        c.addProperty("z", round2(loc.getZ()));
        c.addProperty("yaw", round2(loc.getYaw()));
        c.addProperty("pitch", round2(loc.getPitch()));
        c.addProperty("blockX", loc.getBlockX());
        c.addProperty("blockY", loc.getBlockY());
        c.addProperty("blockZ", loc.getBlockZ());
        return c;
    }

    private static String biomeAt(Location loc) {
        try {
            return loc.getBlock().getBiome().getKey().getKey();
        } catch (Exception e) {
            return "desconocido";
        }
    }

    private static JsonArray effectsArray(Player p) {
        JsonArray arr = new JsonArray();
        for (PotionEffect effect : p.getActivePotionEffects()) {
            JsonObject o = new JsonObject();
            o.addProperty("id", effect.getType().getKey().toString());
            o.addProperty("name", effect.getType().getName());
            o.addProperty("amplifier", effect.getAmplifier());
            o.addProperty("durationTicks", effect.getDuration());
            o.addProperty("seconds", effect.getDuration() / 20);
            o.addProperty("ambient", effect.isAmbient());
            o.addProperty("particles", effect.hasParticles());
            o.addProperty("icon", effect.hasIcon());
            arr.add(o);
        }
        return arr;
    }

    private static JsonObject item(ItemStack item, int slot, String label) {
        JsonObject o = new JsonObject();
        o.addProperty("slot", slot);
        if (label != null) {
            o.addProperty("label", label);
        }
        if (item == null || item.getType().isAir()) {
            o.addProperty("type", "AIR");
            o.addProperty("id", "minecraft:air");
            o.addProperty("amount", 0);
            return o;
        }

        o.addProperty("type", item.getType().name());
        o.addProperty("id", item.getType().getKey().toString());
        o.addProperty("amount", item.getAmount());

        ItemMeta meta = item.getItemMeta();
        if (meta != null) {
            if (meta.hasDisplayName()) {
                o.addProperty("name", meta.getDisplayName());
            }
            if (meta.hasLore()) {
                JsonArray lore = new JsonArray();
                List<String> lines = meta.getLore();
                for (String line : lines) {
                    lore.add(line);
                }
                o.add("lore", lore);
            }
            if (meta instanceof Damageable) {
                Damageable damageable = (Damageable) meta;
                o.addProperty("durability", damageable.getDamage());
                o.addProperty("maxDurability", item.getType().getMaxDurability());
            }
            if (meta.isUnbreakable()) {
                o.addProperty("unbreakable", true);
            }
            if (meta.hasCustomModelData()) {
                o.addProperty("customModelData", meta.getCustomModelData());
            }
            if (meta instanceof SkullMeta) {
                SkullMeta skull = (SkullMeta) meta;
                if (skull.getOwningPlayer() != null) {
                    o.addProperty("owner", skull.getOwningPlayer().getName());
                }
            }
            if (meta.hasEnchants()) {
                JsonArray enchants = new JsonArray();
                for (Map.Entry<Enchantment, Integer> entry : meta.getEnchants().entrySet()) {
                    JsonObject e = new JsonObject();
                    e.addProperty("id", entry.getKey().getKey().toString());
                    e.addProperty("level", entry.getValue());
                    enchants.add(e);
                }
                o.add("enchants", enchants);
            }
        }
        return o;
    }

    private static int occupiedSlots(ItemStack[] contents) {
        int count = 0;
        for (ItemStack it : contents) {
            if (it != null && !it.getType().isAir()) {
                count++;
            }
        }
        return count;
    }

    // ------------------------------------------------------------------
    // Descripción de objetos en el chat
    // ------------------------------------------------------------------

    /** Convierte un objeto a una línea de chat legible (usado al hacer clic en la GUI). */
    public static String itemPretty(ItemStack item) {
        if (item == null || item.getType().isAir()) {
            return ChatColor.GRAY + "Vacío";
        }
        StringBuilder sb = new StringBuilder();
        ItemMeta meta = item.getItemMeta();
        String name = item.getType().name().toLowerCase(Locale.ROOT);
        if (meta != null && meta.hasDisplayName()) {
            name = meta.getDisplayName();
        }
        sb.append(ChatColor.YELLOW).append(name).append(ChatColor.GRAY).append(" x").append(item.getAmount());
        if (meta != null && meta instanceof Damageable) {
            Damageable damageable = (Damageable) meta;
            if (item.getType().getMaxDurability() > 0) {
                int left = item.getType().getMaxDurability() - damageable.getDamage();
                sb.append(ChatColor.GRAY).append(" (Durabilidad ").append(left).append('/')
                        .append(item.getType().getMaxDurability()).append(')');
            }
        }
        if (meta != null && meta.hasEnchants()) {
            sb.append(ChatColor.AQUA).append(" [");
            boolean first = true;
            for (Map.Entry<Enchantment, Integer> entry : meta.getEnchants().entrySet()) {
                if (!first) {
                    sb.append(", ");
                }
                sb.append(entry.getKey().getKey().getKey()).append(' ').append(entry.getValue());
                first = false;
            }
            sb.append(']');
        }
        return sb.toString();
    }

    // ------------------------------------------------------------------
    // Redondeos
    // ------------------------------------------------------------------

    public static double round1(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    public static double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private static int percentage(double part, double total) {
        if (total <= 0) {
            return 0;
        }
        return (int) Math.round(part / total * 100.0);
    }
}
