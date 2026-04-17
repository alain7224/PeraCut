# 🍐 PeraCut - Editor de Fotos y Videos con IA

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-19-blue)](https://react.dev/)

> **PeraCut** es una aplicación web progresiva (PWA) moderna para editar fotos y videos directamente desde tu navegador con un diseño inspirado en CapCut.

## ✨ Características

### 🎨 UI Renovada Estilo CapCut 2026
- **3 Temas Visuales**: Light, Graphite y Midnight con efectos glass morphism
- **Diseño Fixed Viewport**: Layout fijo que no se estira verticalmente
- **Paneles Laterales con Scroll**: Solo los paneles izquierdo y derecho permiten scroll
- **Vista Previa Central Grande**: Con botón de fullscreen/minimizar
- **Timeline Estilo CapCut**:
  - Timeline media en la parte inferior con clips sin huecos visibles
  - Timeline audio debajo del timeline media
  - Botón + translúcido entre clips para añadir transiciones
- **Flujo Optimizado**: Plantilla → Cargar archivos → Timeline cronológico

### 🎬 Edición de Videos
- Crea videos con timeline libre
- 48 plantillas profesionales (6 estilos × 2 formatos × 4 duraciones)
- Transiciones suaves: fade, slide, zoom, wipe
- Control de velocidad (0.25x - 2x)
- Límite de exportación: 7 minutos máximo

### 📸 Edición de Fotos
- Filtros y efectos profesionales
- Ajustes de brillo, contraste, saturación y rotación
- Exportar en PNG/JPEG con calidad seleccionable
- Stickers SVG decorativos

### 🎵 Audio y Música
- Panel de audio integrado
- Sube tu música (mp3/m4a/wav)
- 5 efectos de sonido incluidos
- Sincronización con timeline

### 📱 PWA Completa
- Funciona en web, Android e iPhone
- Instalable como app nativa
- Sin necesidad de App Store
- Funciona offline

### 🌍 Multiidioma
- Español (ES)
- Inglés (EN)
- Francés (FR)
- Rumano (RO)
- Portugués (PT)

## 🚀 Inicio Rápido

```bash
# Clonar repositorio
git clone https://github.com/alain7224/PeraCut.git
cd PeraCut

# Instalar dependencias
pnpm install

# Ejecutar en desarrollo
pnpm dev
```

Abre http://localhost:3000

## 📤 Exportar tu trabajo

### Fotos (PNG / JPEG)

1. Carga una imagen en el **Editor de Fotos**
2. Aplica filtros, ajustes o stickers desde la barra lateral
3. Pulsa el botón **Guardar** (cabecera, arriba a la derecha)
4. En la pestaña **"Exportar imagen"**:
   - Elige el formato: **PNG** (sin pérdida) o **JPEG** (comprimido)
   - Elige la calidad: Alta (95%), Media (80%) o Baja (60%)
5. Pulsa **"Descargar PNG/JPEG"**

> Los filtros (brillo, contraste, saturación, preset) y los stickers quedan **baked** en el archivo final.

### Videos (MP4)

1. Selecciona **Crear Video** o entra al editor
2. Configura las escenas y el tipo de transición
3. Pulsa el botón **Guardar**
4. En la pestaña **"Renderizar video"**:
   - Pulsa **"Renderizar MP4"** — FFmpeg se descarga automáticamente la primera vez (~30 MB)
   - Espera a que la barra de progreso llegue al 100%
   - Previsualiza el video y pulsa **"Descargar MP4"**

> El renderizado se ejecuta **completamente en el navegador** (FFmpeg WASM). No requiere ningún servicio externo.

## 💾 Guardar y Cargar Proyectos

### Guardar

1. Pulsa **Guardar** en la cabecera
2. Ve a la pestaña **"Proyecto"**
3. Pulsa **"Guardar proyecto (.peracut.json)"**

El JSON incluye: tipo de proyecto, ajustes de filtros, stickers y (para video) escenas y transiciones.

### Cargar

1. Pulsa **Guardar** → pestaña **"Proyecto"**
2. Pulsa **"Cargar proyecto existente…"** y selecciona el `.peracut.json`
3. El editor restaurará todos los ajustes guardados

> ⚠️ Cargar un proyecto reemplaza el estado actual del editor.

## 🎭 Stickers

En el modo foto, la barra lateral incluye una sección **Stickers**. Los stickers disponibles son:

⭐ Estrella | ❤️ Corazón | 😊 Sonrisa | 🔥 Fuego | 👑 Corona | ⚡ Rayo | 🎵 Música | 🌸 Flor

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
pnpm test             # Tests unitarios
pnpm db:push          # Migraciones BD (opcional)
```

### Variables de entorno (todas opcionales)

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | MySQL — proyectos persistidos en BD |
| `PERACUT_MASTER_KEY` | Clave admin para exportar leads como CSV |
| `OAUTH_SERVER_URL` | URL del servidor OAuth |

Sin `DATABASE_URL` el editor funciona en modo **solo cliente**: los proyectos se guardan/cargan localmente como archivos JSON.

## 🛠️ Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS 4
- **Backend:** Express 4, tRPC 11
- **BD:** MySQL/TiDB, Drizzle ORM (opcional)
- **Video:** FFmpeg WASM (`@ffmpeg/ffmpeg`)
- **Storage:** S3 (opcional)

## 🎨 Sistema de Temas

### Temas Disponibles

1. **Light** - Tema claro estilo iOS con glass morphism
2. **Graphite** - Tema gris profesional
3. **Midnight** - Tema oscuro azul/negro profundo

El tema se cambia desde el selector en la cabecera del editor.

## 🎨 Sistema de Plantillas

### Cómo funciona

Las plantillas son estructuras de video predefinidas. Cada plantilla tiene:
- **Estilo** (cutout, split, flash, glitch, bars, zoom)
- **Formato** (9:16 vertical o 16:9 horizontal)
- **Duración exacta** (15s, 25s, 35s o 60s)

Al aplicar una plantilla, se crea una línea de tiempo con escenas preconfiguradas.

### Añadir nuevas plantillas

1. Abre `client/src/lib/templateRegistry.ts`
2. Añade una nueva entrada en `STYLE_DEFS` con el nuevo `styleId`
3. El sistema genera automáticamente todas las combinaciones

### SFX incluidos (`client/public/sfx/`)

Los archivos WAV se generan con `node scripts/generateSfx.mjs`:
- `beep.wav` — tono 440Hz, 0.3s
- `whoosh.wav` — barrido de frecuencia, 0.5s
- `clap.wav` — ruido percusivo, 0.2s
- `riser.wav` — tono ascendente, 1.0s
- `pop.wav` — transiente corto, 0.1s

### Límite de exportación

El límite es de **7 minutos**. Se muestra una advertencia en el editor cuando el timeline supera 7:00, y se bloquea el botón de exportación. La lógica está en `client/src/lib/durationValidation.ts`.

## 📝 Licencia

MIT © 2026 Alain Aguilera

---

**¿Preguntas?** Abre un issue en GitHub.
