# PeraCut - Documentación Completa

## 📱 ¿Qué es PeraCut?

**PeraCut** es una aplicación web progresiva (PWA) para editar fotos y videos directamente desde tu navegador. Funciona en:
- ✅ **PC/Mac** - Desde cualquier navegador
- ✅ **Android** - Instalable como app nativa
- ✅ **iPhone** - Desde Safari sin necesidad de App Store

## 🎯 Características Principales

### 1. **Edición de Contenido**
- Editar fotos con filtros y efectos
- Crear videos de 15 segundos con 5-8 escenas
- Aplicar transiciones automáticas
- Agregar música y efectos de sonido
- Insertar marcos y stickers

### 2. **Grabación Directa**
- Grabar video desde cámara web (1280x720)
- Grabar audio desde micrófono
- Preview en tiempo real

### 3. **Plantillas Predefinidas**
- 15 plantillas profesionales
- Aplicación automática de efectos
- Personalización de colores y fondos

### 4. **Autenticación**
- Llave maestra para el creador (sin registro)
- Registro de usuarios con datos demográficos
- Recolección de: email, nombre, apellido, edad, país

### 5. **Multiidioma**
- Español (ES)
- Inglés (EN)
- Francés (FR)
- Rumano (RO)
- Portugués (PT)

## 🏗️ Arquitectura Técnica

```
PeraCut/
├── client/                    # Frontend (React 19 + Tailwind 4)
│   ├── src/
│   │   ├── pages/            # Páginas principales
│   │   ├── components/       # Componentes reutilizables
│   │   ├── lib/              # Utilidades (i18n, videoRenderer, etc)
│   │   ├── hooks/            # Custom hooks
│   │   └── App.tsx           # Enrutamiento
│   ├── public/               # Activos estáticos
│   └── index.html            # HTML principal
│
├── server/                   # Backend (Express + tRPC)
│   ├── routers.ts            # Procedimientos tRPC
│   ├── auth.ts               # Lógica de autenticación
│   ├── db.ts                 # Consultas a base de datos
│   └── _core/                # Framework interno
│
├── drizzle/                  # Base de datos
│   ├── schema.ts             # Definición de tablas
│   └── migrations/           # Historial de cambios
│
└── shared/                   # Código compartido
    ├── const.ts              # Constantes
    └── types.ts              # Tipos TypeScript
```

### Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | React 19, TypeScript, Tailwind CSS 4, shadcn/ui |
| **Backend** | Express 4, tRPC 11, Node.js |
| **Base de Datos** | MySQL/TiDB, Drizzle ORM |
| **Edición de Video** | FFmpeg.js (en navegador) |
| **Almacenamiento** | S3 (Manus) |
| **Autenticación** | OAuth (Manus) + Sistema personalizado |
| **PWA** | Service Worker, Web Manifest |

## 💾 Base de Datos

### Tabla: `users`
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  openId VARCHAR(64) UNIQUE,
  name TEXT,
  lastName TEXT,
  email VARCHAR(320) UNIQUE,
  username VARCHAR(64) UNIQUE,
  age INT,
  country VARCHAR(100),
  loginMethod VARCHAR(64),
  isMasterUser TINYINT DEFAULT 0,
  role ENUM('user', 'admin') DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  lastSignedIn TIMESTAMP
);
```

### Tabla: `projects`
```sql
CREATE TABLE projects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  type ENUM('photo', 'video') NOT NULL,
  description TEXT,
  thumbnail TEXT,
  data TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Tabla: `scenes`
```sql
CREATE TABLE scenes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  projectId INT NOT NULL REFERENCES projects(id),
  order INT NOT NULL,
  duration INT NOT NULL,
  mediaType ENUM('image', 'video') NOT NULL,
  mediaUrl TEXT,
  data TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🔐 Autenticación

### Llave Maestra (Para el Creador)

La llave maestra se configura en la variable de entorno `PERACUT_MASTER_KEY`:

```bash
# En tu MacBook Pro
export PERACUT_MASTER_KEY="tu_llave_super_secreta"
```

**Flujo:**
1. Accedes a PeraCut
2. Seleccionas "Llave Maestra"
3. Ingresas tu contraseña
4. Acceso inmediato sin registro

### Registro de Usuarios

**Datos recolectados:**
- Email (requerido, único)
- Nombre (requerido)
- Apellido (requerido)
- Username (requerido, mín 4 caracteres, único)
- Edad (opcional)
- País (opcional)

**Flujo:**
1. Nuevo usuario selecciona "Registrarse"
2. Completa formulario
3. Se crea cuenta en base de datos
4. Tú recibes notificación (opcional)
5. Usuario puede acceder

## 📲 Instalación

### En PC/Mac (MacBook Pro 2015)

#### Opción 1: Desarrollo Local

```bash
# 1. Clonar repositorio
git clone https://github.com/alain7224/peracut.git
cd peracut

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus valores

# 4. Ejecutar servidor de desarrollo
pnpm dev

# 5. Abrir en navegador
# http://localhost:3000
```

#### Opción 2: Instalación en Producción

```bash
# 1. Build para producción
pnpm build

# 2. Ejecutar servidor
pnpm start

# 3. Acceder desde navegador
# https://tu-dominio.com
```

### En Android

#### Opción 1: Desde Chrome

1. Abre PeraCut en Chrome
2. Toca el menú (⋮) → "Instalar aplicación"
3. Confirma la instalación
4. La app aparecerá en tu pantalla de inicio

#### Opción 2: Crear APK (Avanzado)

```bash
# Usar Capacitor para crear APK
pnpm add @capacitor/core @capacitor/android
npx cap init
npx cap build android
```

### En iPhone (Safari)

1. Abre PeraCut en Safari
2. Toca el botón Compartir (↑)
3. Selecciona "Añadir a pantalla de inicio"
4. Elige un nombre y toca "Añadir"
5. La app aparecerá en tu pantalla de inicio

**Nota:** No requiere App Store ni firma de desarrollador.

## 🚀 Despliegue

### En Manus (Recomendado)

PeraCut ya está configurado para Manus:

```bash
# 1. Crear checkpoint
pnpm checkpoint

# 2. Hacer clic en "Publish" en la UI de Manus
# 3. La app estará disponible en: https://peracut.manus.space
```

### En Otros Servidores

#### Railway

```bash
# 1. Conectar repositorio GitHub
# 2. Configurar variables de entorno
# 3. Deploy automático
```

#### Render

```bash
# 1. Crear nuevo Web Service
# 2. Conectar GitHub
# 3. Configurar Build Command: pnpm build
# 4. Configurar Start Command: pnpm start
```

#### Vercel

```bash
# 1. Importar proyecto
# 2. Configurar variables de entorno
# 3. Deploy automático
```

## 🛠️ Desarrollo

### Agregar Nueva Plantilla

1. Editar `client/src/lib/templates.ts`
2. Agregar objeto de plantilla:

```typescript
{
  id: 'plantilla-nueva',
  name: 'Mi Plantilla',
  description: 'Descripción',
  thumbnail: 'URL_THUMBNAIL',
  scenes: [
    {
      duration: 3000,
      effects: ['fade', 'zoom'],
      transition: 'slide'
    }
  ]
}
```

### Agregar Nuevo Sticker

1. Crear SVG o PNG
2. Guardar en S3
3. Agregar a `client/src/lib/stickers.ts`

### Agregar Nuevo Filtro

1. Editar `client/src/lib/filters.ts`
2. Implementar usando Canvas API

## 📊 Monitoreo

### Logs del Servidor

```bash
# Ver logs en tiempo real
tail -f .manus-logs/devserver.log

# Ver errores de cliente
tail -f .manus-logs/browserConsole.log

# Ver solicitudes HTTP
tail -f .manus-logs/networkRequests.log
```

### Métricas

- **UV (Usuarios Únicos):** Dashboard de Manus
- **PV (Vistas de Página):** Dashboard de Manus
- **Errores:** Console.log en navegador

## 🔧 Variables de Entorno

```bash
# Base de datos
DATABASE_URL=mysql://usuario:contraseña@host/peracut

# Autenticación
PERACUT_MASTER_KEY=tu_llave_maestra_aqui
JWT_SECRET=tu_jwt_secret_aqui

# OAuth (Manus)
VITE_APP_ID=tu_app_id
OAUTH_SERVER_URL=https://api.manus.im

# S3 (Almacenamiento)
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=tu_api_key

# Frontend
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=tu_frontend_key
```

## 🐛 Solución de Problemas

### "La app no carga en Android"

- Verifica que tienes conexión a internet
- Limpia caché de Chrome: Configuración → Privacidad → Borrar datos
- Intenta en modo incógnito

### "No puedo grabar video"

- Verifica permisos de cámara
- Cierra otras apps usando la cámara
- Reinicia el navegador

### "Los videos se ven pixelados"

- Reduce la resolución en Configuración
- Usa conexión WiFi en lugar de datos móviles

### "Error de base de datos"

- Verifica `DATABASE_URL`
- Comprueba que el servidor MySQL está corriendo
- Ejecuta migraciones: `pnpm db:push`

## 📞 Soporte

Para reportar bugs o sugerencias:

1. Abre un issue en GitHub
2. Incluye:
   - Descripción del problema
   - Pasos para reproducir
   - Navegador y dispositivo
   - Logs si es posible

## 📄 Licencia

PeraCut © 2026 - Todos los derechos reservados

## 🙏 Créditos

Desarrollado con ❤️ usando:
- React 19
- TypeScript
- Tailwind CSS 4
- Express
- tRPC
- Drizzle ORM
- FFmpeg.js

---

**Última actualización:** Abril 12, 2026
