package com.arsbot.gui;

import com.arsbot.InfoUtil;
import org.bukkit.Bukkit;
import org.bukkit.ChatColor;
import org.bukkit.OfflinePlayer;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.inventory.InventoryClickEvent;
import org.bukkit.event.inventory.InventoryCloseEvent;
import org.bukkit.inventory.Inventory;
import org.bukkit.inventory.InventoryHolder;
import org.bukkit.inventory.ItemStack;
import org.bukkit.inventory.meta.ItemMeta;
import org.bukkit.plugin.java.JavaPlugin;

import java.util.Locale;
import java.util.UUID;

/**
 * Abre un inventario virtual (GUI) en el que el administrador puede VER
 * el inventario, el cofre de ender o la armadura de un jugador.
 * Es de solo lectura: mover objetos no altera el inventario real.
 */
public final class InventoryViewer implements Listener {

    private static final String TITLE_INV = "Inventario de ";
    private static final String TITLE_ENDER = "EnderChest de ";
    private static final String TITLE_ARMOR = "Armadura de ";

    private final JavaPlugin plugin;

    public InventoryViewer(JavaPlugin plugin) {
        this.plugin = plugin;
    }

    public void openInventory(Player viewer, Player target) {
        ItemStack[] contents = target.getInventory().getStorageContents(); // 36 slots (hotbar + inventario)
        Inventory inv = Bukkit.createInventory(new ViewHolder(target.getUniqueId(), Kind.INVENTORY),
                ceil9(contents.length), TITLE_INV + target.getName());
        inv.setContents(contents);
        viewer.openInventory(inv);
    }

    public void openEnderChest(Player viewer, Player target) {
        Inventory inv = Bukkit.createInventory(new ViewHolder(target.getUniqueId(), Kind.ENDER_CHEST),
                ceil9(target.getEnderChest().getSize()), TITLE_ENDER + target.getName());
        inv.setContents(target.getEnderChest().getContents());
        viewer.openInventory(inv);
    }

    public void openArmor(Player viewer, Player target) {
        Inventory inv = Bukkit.createInventory(new ViewHolder(target.getUniqueId(), Kind.ARMOR),
                9, TITLE_ARMOR + target.getName());
        ItemStack[] armor = target.getInventory().getArmorContents();
        ItemStack[] slots = new ItemStack[9];
        slots[0] = armor[0]; // Botas
        slots[1] = armor[1]; // Pantalones
        slots[2] = armor[2]; // Peto
        slots[3] = armor[3]; // Casco
        slots[8] = target.getInventory().getItemInOffHand();
        inv.setContents(slots);
        viewer.openInventory(inv);
    }

    @EventHandler
    public void onClick(InventoryClickEvent event) {
        if (!(event.getInventory().getHolder() instanceof ViewHolder)) {
            return;
        }
        if (!(event.getWhoClicked() instanceof Player)) {
            return;
        }
        event.setCancelled(true); // Solo lectura.
        Player viewer = (Player) event.getWhoClicked();
        if (event.getClickedInventory() != event.getView().getTopInventory()) {
            return;
        }
        if (event.getCurrentItem() == null || event.getCurrentItem().getType().isAir()) {
            return;
        }
        if (event.isLeftClick()) {
            viewer.sendMessage(InfoUtil.itemPretty(event.getCurrentItem()));
        }
    }

    @EventHandler
    public void onClose(InventoryCloseEvent event) {
        if (!(event.getInventory().getHolder() instanceof ViewHolder)) {
            return;
        }
        ViewHolder holder = (ViewHolder) event.getInventory().getHolder();
        final Player viewer = (Player) event.getPlayer();
        final OfflinePlayer target = Bukkit.getOfflinePlayer(holder.target());
        final String msg;
        if (holder.kind() == Kind.ENDER_CHEST) {
            msg = ChatColor.GRAY + "Cerrada la vista del EnderChest de " + target.getName()
                    + ". Es solo lectura: no se guardó ningún cambio.";
        } else {
            msg = ChatColor.GRAY + "Vista cerrada. Nada ha sido modificado.";
        }
        plugin.getServer().getScheduler().runTask(plugin, new Runnable() {
            @Override
            public void run() {
                viewer.sendMessage(msg);
            }
        });
    }

    private static int ceil9(int size) {
        return Math.max(9, (int) Math.ceil(size / 9.0) * 9);
    }

    private enum Kind {
        INVENTORY, ENDER_CHEST, ARMOR
    }

    /** Marcador que identifica nuestros inventarios virtuales de solo lectura. */
    public static final class ViewHolder implements InventoryHolder {
        private final UUID target;
        private final Kind kind;

        public ViewHolder(UUID target, Kind kind) {
            this.target = target;
            this.kind = kind;
        }

        public UUID target() {
            return target;
        }

        public Kind kind() {
            return kind;
        }

        @Override
        public Inventory getInventory() {
            return null;
        }
    }

    /** Describe un objeto de forma legible. */
    public static String describe(ItemStack item) {
        if (item == null || item.getType().isAir()) {
            return "vacío";
        }
        String name = item.getType().name().toLowerCase(Locale.ROOT);
        ItemMeta meta = item.getItemMeta();
        if (meta != null && meta.hasDisplayName()) {
            name = meta.getDisplayName();
        }
        return name + " x" + item.getAmount();
    }
}
