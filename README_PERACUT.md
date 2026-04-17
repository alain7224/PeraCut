# 🍐 PeraCut - Editor de Fotos y Videos con IA

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-19-blue)](https://react.dev/)

> **PeraCut** es una aplicación web progresiva (PWA) moderna para editar fotos y videos directamente desde tu navegador.

## ✨ Características

- 🎬 **Edición de Videos** - Crea videos con timeline libre, transiciones (fade, slide, zoom) y plantillas
- 📸 **Edición de Fotos** - Filtros, ajustes y efectos profesionales
- 📤 **Exportar PNG/JPEG** - Descarga tu foto con todos los filtros baked-in en alta calidad
- 🎞 **Renderizar MP4** - Exporta el video final usando FFmpeg WASM (sin servidor externo)
- 💾 **Guardar/Cargar Proyecto** - Descarga el estado editable como `.peracut.json` y recupéralo después
- 🎭 **Stickers SVG** - Superpón emojis y decoraciones sobre tu foto
- 🎥 **Grabación Directa** - Graba desde tu cámara web
- 🎨 **48 Plantillas** - 6 estilos × 2 formatos × 4 duraciones (15s/25s/35s/60s)
- 🎵 **Panel de Audio** - Sube tu música (mp3/m4a/wav) o usa links a librerías gratuitas
- 🔊 **SFX incluidos** - Beep, Whoosh, Clap, Riser, Pop generados en el repo
- ⏱️ **Límite de exportación** - Máximo 7 minutos por video
- 🌍 **Multiidioma** - 5 idiomas soportados
- 📱 **PWA** - Funciona en web, Android e iPhone
- 🔐 **Llave Maestra** - Acceso sin registro

## 🚀 Inicio Rápido

```bash
git clone https://github.com/alain7224/PeraCut.git
cd PeraCut
pnpm install
pnpm dev
```

Abre http://localhost:3000

## 📤 Exportar tu trabajo

### Fotos (PNG / JPEG)

1. Carga una imagen en el **Editor de Fotos**.
2. Aplica filtros, ajustes o stickers desde la barra lateral.
3. Pulsa el botón **Guardar** (cabecera, arriba a la derecha).
4. En la pestaña **"Exportar imagen"**:
   - Elige el formato: **PNG** (sin pérdida) o **JPEG** (comprimido).
   - Elige la calidad: Alta (95 %), Media (80 %) o Baja (60 %).
5. Pulsa **"Descargar PNG/JPEG"** — el archivo se descargará en tu máquina.

> Los filtros (brillo, contraste, saturación, preset) y los stickers quedan **baked** en el archivo final.

### Videos (MP4)

1. Selecciona **Crear Video** en la pantalla de inicio o entra al editor.
2. Configura las escenas y el tipo de transición en la barra lateral.
3. Pulsa el botón **Guardar**.
4. En la pestaña **"Renderizar video"**:
   - Pulsa **"Renderizar MP4"** — FFmpeg se descarga automáticamente la primera vez (~30 MB).
   - Espera a que la barra de progreso llegue al 100 %.
   - Previsualiza el video y pulsa **"Descargar MP4"**.

> El renderizado se ejecuta **completamente en el navegador** (FFmpeg WASM). No requiere ningún servicio externo ni servidor.

## 💾 Guardar y Cargar Proyectos

El estado editable de tu proyecto se puede serializar como un archivo JSON.

### Guardar

1. Pulsa **Guardar** en la cabecera.
2. Ve a la pestaña **"Proyecto"**.
3. Pulsa **"Guardar proyecto (.peracut.json)"** — se descarga un archivo `Mi-Proyecto.peracut.json`.

El JSON incluye: tipo de proyecto, ajustes de filtros, stickers y (para video) escenas y transiciones.

### Cargar

1. Pulsa **Guardar** → pestaña **"Proyecto"**.
2. Pulsa **"Cargar proyecto existente…"** y selecciona el `.peracut.json`.
3. El editor restaurará todos los ajustes guardados.

> ⚠️ Cargar un proyecto reemplaza el estado actual del editor.

## 🎭 Stickers

En el modo foto, la barra lateral incluye una sección **Stickers**. Pulsa cualquier sticker para colocarlo en el centro del canvas. Puedes eliminar stickers individualmente con el botón ✕ que aparece al pasar el ratón por encima.

Los stickers disponibles son: Estrella ⭐, Corazón ❤️, Sonrisa 😊, Fuego 🔥, Corona 👑, Rayo ⚡, Música 🎵, Flor 🌸.

## 📱 Instalación en Dispositivos

### Android (Chrome)
1. Abre PeraCut en Chrome
2. Menú (⋮) → "Instalar aplicación"

### iPhone (Safari)
1. Abre PeraCut en Safari
2. Compartir (↑) → "Añadir a pantalla de inicio"

## 🔧 Desarrollo

```bash
pnpm dev              # Servidor de desarrollo
pnpm build            # Build producción
pnpm check            # Type-check TypeScript
pnpm test             # Tests unitarios (requiere vitest)
pnpm db:push          # Migraciones BD (opcional, sólo con DATABASE_URL)
```

### Variables de entorno (todas opcionales)

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | MySQL — proyectos persistidos en BD |
| `PERACUT_MASTER_KEY` | Clave admin para exportar leads como CSV |
| `OAUTH_SERVER_URL` | URL del servidor OAuth (si usas autenticación) |

Sin `DATABASE_URL` el editor funciona en modo **solo cliente**: los proyectos se guardan/cargan localmente como archivos JSON.

## 🛠️ Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS 4
- **Backend:** Express 4, tRPC 11
- **BD:** MySQL/TiDB, Drizzle ORM (opcional)
- **Video:** FFmpeg WASM (`@ffmpeg/ffmpeg`)
- **Storage:** S3 (opcional)

## 📝 Licencia

MIT © 2026 Alain Aguilera

---

**¿Preguntas?** Abre un issue en GitHub.

---

## 🎨 Sistema de Plantillas

### Cómo funciona
Las plantillas son estructuras de video predefinidas. Cada plantilla tiene:
- **Estilo** (cutout, split, flash, glitch, bars, zoom)
- **Formato** (9:16 vertical o 16:9 horizontal)
- **Duración exacta** (15s, 25s, 35s o 60s)

Al aplicar una plantilla, se crea una línea de tiempo con escenas preconfiguradas. Si tu material es más corto que la duración, la plantilla lo rellena según su estrategia (`loop`, `freeze`, o `stretch`). Si es más largo, se recorta automáticamente.

### Añadir nuevas plantillas
1. Abre `client/src/lib/templateRegistry.ts`
2. Añade una nueva entrada en `STYLE_DEFS` con el nuevo `styleId`, nombre, descripción, estrategia de relleno, efectos y distribución de escenas por duración.
3. El sistema genera automáticamente todas las combinaciones de duración × formato.

### Añadir un music pack (futuro)
El sistema de audio está preparado para añadir packs de música:
1. Coloca los archivos de audio (con licencia verificada para redistribución comercial) en `client/public/music/<pack-name>/`
2. Crea un archivo `client/public/music/<pack-name>/manifest.json` con metadata (título, artista, duración, licencia)
3. Referencia los tracks desde las plantillas via `sfxTrack` o crea una sección "music" en el `MusicPanel` que cargue el manifest

### SFX incluidos (`client/public/sfx/`)
Los archivos WAV se generan con `node scripts/generateSfx.mjs`:
- `beep.wav` — tono 440Hz, 0.3s
- `whoosh.wav` — barrido de frecuencia, 0.5s
- `clap.wav` — ruido percusivo, 0.2s
- `riser.wav` — tono ascendente, 1.0s
- `pop.wav` — transiente corto, 0.1s

### Límite de exportación
El límite es de **7 minutos**. Se muestra una advertencia en el editor cuando el timeline supera 7:00, y se bloquea el botón de exportación. La lógica está en `client/src/lib/durationValidation.ts`.

