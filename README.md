# arsBot · Agenda escolar 📚

App móvil estilo Notion para organizarte: **horario de clases, tareas y notas**.
Es una **PWA**, así que se instala en el móvil como una app normal y funciona **sin conexión**.

![stack](https://img.shields.io/badge/React-19-61dafb) ![stack](https://img.shields.io/badge/Vite-8-646cff) ![stack](https://img.shields.io/badge/Tailwind-4-38bdf8) ![pwa](https://img.shields.io/badge/PWA-offline-5a0fc8) ![deploy](https://img.shields.io/badge/GitHub%20Pages-live-2ea043)

## 📲 Probarla en el móvil

**URL publicada:** <https://ovsky1020.github.io/arsBot/>

Escanea esto con la cámara del móvil (o abre la URL directamente):

![QR de la app](art/qr-pages.png)

### Instalarla como app

1. Abre la URL en **Chrome** (Android) o **Safari** (iPhone).
2. Android: menú `⋮` → **Instalar aplicación**.
   iPhone: botón **Compartir** → **Añadir a la pantalla de inicio**.
3. Se abre a pantalla completa, con icono propio y **funciona sin internet**.

> Tus datos se guardan en el propio dispositivo (`localStorage`): no hay cuentas ni servidor.
> Si cambias de móvil, usa **Ajustes → Exportar** y luego **Importar** en el nuevo.

## ✨ Qué tiene

| Pestaña      | Qué hace                                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Hoy**      | Saludo, la clase que tienes ahora (o la siguiente) con cuenta atrás, añadir tarea rápido, tareas vencidas/hoy/próximas y clases del día. |
| **Horario**  | Vista **día** (lista) y **semana** (rejilla por horas). Tocas un hueco vacío y creas la clase a esa hora. Colores por asignatura.        |
| **Tareas**   | Filtros (Todas / Hoy / 7 días / Hechas), agrupadas por vencidas, hoy, mañana, semana, más adelante y sin fecha. Prioridad alta/media/baja. |
| **Notas**    | Notas con markdown básico (`#`, listas, `**negrita**`, `` `código` ``), fijado con chincheta y búsqueda.                                |
| **Ajustes**  | Nombre, tema claro/oscuro/auto, mostrar fin de semana, exportar e importar copia, cargar ejemplos o borrar todo.                        |

## 🚀 Desarrollo

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + build de producción en dist/
npm run preview    # sirve dist/ en http://localhost:4173
npm run icons      # regenera los iconos de la PWA desde art/icon-source.png
```

## 🌍 Despliegue automático

El workflow [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) compila y
publica la app en **GitHub Pages** en cada push a `main`.

Como Pages sirve el repo en `https://<usuario>.github.io/arsBot/`, el build usa la variable
`BASE_PATH=/arsBot/` para que las rutas del bundle, del manifest y del service worker sean correctas
(en local se usa `/`).

> ⚙️ **Ajuste único:** la primera vez hay que activar Pages a mano en
> **Settings → Pages → Source → GitHub Actions** (GitHub no permite activarlo vía API).
> Hecho eso, cada push a `main` publica automáticamente.

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

- Recordatorios con notificaciones.
- Sincronización entre dispositivos (API + login).
- Bot de Telegram que consulte la misma agenda.
