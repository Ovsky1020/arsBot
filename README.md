# arsBot · Agenda escolar 📚

App móvil estilo Notion para organizarte: **horario de clases, tareas y notas**.
Es una **PWA** (se instala en el móvil como una app normal) y funciona **sin conexión**, así que no depende de que tu PC esté encendido.

![stack](https://img.shields.io/badge/React-19-61dafb) ![stack](https://img.shields.io/badge/Vite-8-646cff) ![stack](https://img.shields.io/badge/Tailwind-4-38bdf8) ![pwa](https://img.shields.io/badge/PWA-offline-5a0fc8)

## ✨ Qué tiene

| Pestaña  | Qué hace                                                                                |
| -------- | --------------------------------------------------------------------------------------- |
| **Hoy**  | Saludo, la clase que tienes ahora (o la siguiente) con cuenta atrás, añadir tarea rápido, tareas vencidas/hoy/próximas y las clases del día. |
| **Horario** | Vista **día** (lista) y **semana** (rejilla por horas). Tocas un hueco vacío y creas la clase a esa hora. Colores por asignatura. |
| **Tareas** | Filtros (Todas / Hoy / 7 días / Hechas), agrupadas por vencidas, hoy, mañana, semana, más adelante y sin fecha. Prioridad alta/media/baja. |
| **Notas** | Notas con markdown básico (`#`, listas, `**negrita**`, `` `código` ``), fijado con chincheta y búsqueda. |
| **Ajustes** | Nombre, tema claro/oscuro/auto, mostrar fin de semana, exportar e importar copia, cargar ejemplos o borrar todo. |

## 🚀 Desarrollo

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + build de producción en dist/
npm run preview    # sirve dist/ en http://localhost:4173
npm run icons      # regenera los iconos de la PWA desde art/icon-source.png
```

## 📱 Instalarla en el móvil

1. Abre la URL en **Chrome** (Android) o **Safari** (iOS).
2. Android: menú `⋮` → **Instalar aplicación**. iOS: botón Compartir → **Añadir a la pantalla de inicio**.
3. Listo: se abre a pantalla completa y funciona offline.

> Los datos se guardan en el propio dispositivo (`localStorage`). No hay cuentas ni servidor:
> lo que apuntes es tuyo y privado. Usa **Ajustes → Exportar** si quieres hacer copia
> o pasar la agenda a otro teléfono.

## 🧱 Estructura

```
src/
├─ App.tsx                 # pestañas + FAB + hojas de edición
├─ components/             # BottomNav, Sheet (modal), filas, editores, iconos
├─ views/                  # Hoy · Horario · Tareas · Notas · Ajustes
├─ lib/                    # fechas (es-ES), paleta, markdown ligero, seed
└─ store/StoreProvider.tsx # estado global + persistencia en localStorage
```

## 🗺️ Próximos pasos posibles

- Recordatorios con notificaciones (push local).
- Sincronización entre dispositivos (API + login).
- Bot de Telegram que consulte la misma agenda.
