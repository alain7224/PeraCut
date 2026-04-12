# 🍐 PeraCut - Editor de Fotos y Videos con IA

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-19-blue)](https://react.dev/)

> **PeraCut** es una aplicación web progresiva (PWA) moderna para editar fotos y videos directamente desde tu navegador.

## ✨ Características

- 🎬 **Edición de Videos** - Crea videos con timeline libre
- 📸 **Edición de Fotos** - Filtros y efectos profesionales
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
git clone https://github.com/alain7224/peracut.git
cd peracut
pnpm install
pnpm dev
```

Abre http://localhost:3000

## 📱 Instalación en Dispositivos

### Android (Chrome)
1. Abre PeraCut en Chrome
2. Menú (⋮) → "Instalar aplicación"

### iPhone (Safari)
1. Abre PeraCut en Safari
2. Compartir (↑) → "Añadir a pantalla de inicio"

## 🔧 Desarrollo

```bash
pnpm dev              # Desarrollo
pnpm build            # Build producción
pnpm test             # Tests
pnpm db:push          # Migraciones BD
```

## 📖 Documentación

- [DOCUMENTACION.md](./DOCUMENTACION.md) - Guía completa
- [ARQUITECTURA.md](./ARQUITECTURA.md) - Detalles técnicos

## 🛠️ Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS 4
- **Backend:** Express 4, tRPC 11
- **BD:** MySQL/TiDB, Drizzle ORM
- **Video:** FFmpeg.js
- **Storage:** S3 (Manus)

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

