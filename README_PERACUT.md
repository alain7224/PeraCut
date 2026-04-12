# 🍐 PeraCut - Editor de Fotos y Videos con IA

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-19-blue)](https://react.dev/)

> **PeraCut** es una aplicación web progresiva (PWA) moderna para editar fotos y videos directamente desde tu navegador.

## ✨ Características

- 🎬 **Edición de Videos** - Crea videos de 15 segundos
- 📸 **Edición de Fotos** - Filtros y efectos profesionales
- 🎥 **Grabación Directa** - Graba desde tu cámara web
- 🎨 **15 Plantillas** - Plantillas predefinidas
- 🎭 **20+ Stickers** - Stickers personalizados
- 💬 **Comentarios** - Agrega comentarios
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
