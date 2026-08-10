# 🛡️ Host Blocker - Filtro de Contenido

Sistema de bloqueo de sitios web no deseados mediante el archivo `hosts` del sistema. Diseñado para proteger a niños y jóvenes de contenido inapropiado.

## 📋 Categorías Bloqueadas

### 🎮 Juegos Online
- Sitios de juegos web (Friv, CrazyGames, Minijuegos, etc.)
- Plataformas de juegos en línea
- Portales de juegos flash/HTML5

### 🔞 Contenido XXX/Adulto
- Sitios pornográficos principales
- Contenido para adultos
- Sitios de dating para adultos

### 📥 Descargas No Deseadas
- Portales de descarga de software (Softonic, Uptodown, etc.)
- Sitios de descarga no seguros

### 🎯 Entretenimiento Distractor
- Plataformas de streaming
- Redes sociales
- Sitios de entretenimiento general

## 🚀 Instalación

### Windows
1. Copiar el archivo `hosts` a `C:\Windows\System32\drivers\etc\`
2. Reemplazar el archivo existente (hacer backup primero)
3. Ejecutar `ipconfig /flushdns` en CMD como administrador

### macOS/Linux
1. Copiar el archivo `hosts` a `/etc/hosts`
2. Ejecutar `sudo dscacheutil -flushcache` (macOS) o `sudo systemd-resolve --flush-caches` (Linux)

## 🔧 Extensión del Navegador

Esta incluye una extensión para Chrome/Firefox que:
- Detecta el contenido de las páginas
- Separa automáticamente las categorías
- Bloquea sitios no deseados en tiempo real

### Características:
- ✅ Bloqueo automático por categoría
- ✅ Interfaz fácil de usar
- ✅ Actualizable con nuevas listas
- ✅ Funciona en múltiples navegadores

## 📁 Estructura del Proyecto

```
host/
├── README.md              # Esta documentación
├── hosts                  # Archivo hosts principal (24,000+ dominios)
├── LICENSE                # Licencia MIT
├── extension/             # Extensión del navegador
│   ├── manifest.json      # Configuración de la extensión
│   ├── popup.html         # Interfaz de usuario
│   ├── popup.js           # Lógica de la extensión
│   ├── content.js         # Script de contenido
│   ├── content.css        # Estilos del overlay
│   ├── background.js      # Script de fondo
│   ├── rules.json         # Reglas de bloqueo
│   └── icons/             # Iconos de la extensión
│       └── icon.svg       # Icono principal
└── categories/            # Listas por categoría
    ├── games.txt          # Sitios de juegos (100+ dominios)
    ├── adult.txt          # Contenido adulto (80+ dominios)
    ├── downloads.txt      # Sitios de descarga (60+ dominios)
    └── entertainment.txt  # Entretenimiento (100+ dominios)
```

## 🔧 Instalación de la Extensión

### Chrome/Edge:
1. Abre `chrome://extensions/`
2. Activa "Modo desarrollador"
3. Haz clic en "Cargar extensión sin empaquetar"
4. Selecciona la carpeta `extension/`

### Firefox:
1. Abre `about:debugging#/runtime/this-firefox`
2. Haz clic en "Cargar componente temporal"
3. Selecciona el archivo `manifest.json`

### Funcionalidades:
- ✅ Bloqueo automático por dominio
- ✅ Detección de contenido por palabras clave
- ✅ Overlay visual cuando se detecta contenido bloqueado
- ✅ Configuración por categorías
- ✅ Interfaz fácil de usar
- ✅ Actualizable con nuevas listas

## ⚠️ Notas Importantes

- **Backup siempre**: Antes de modificar el archivo hosts, crea una copia de seguridad
- **Permisos de administrador**: Se necesitan permisos de root/admin para modificar el hosts
- **Actualizaciones**: Las listas se actualizan periódicamente con nuevos sitios

## 🤝 Contribuir

Las contribuciones son bienvenidas. Para agregar nuevos sitios a bloquear:
1. Fork el proyecto
2. Agrega los dominios a la categoría correspondiente
3. Envía un Pull Request

## 📄 Licencia

MIT License - Ver archivo LICENSE para más detalles.
