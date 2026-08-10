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

## 🔧 Extensión del Navegador (Sincronización con Hosts)

La extensión **sincroniza automáticamente con el archivo hosts** del sistema:

### Funcionalidades principales:
- ✅ **Lectura del hosts**: Importa y sincroniza los dominios bloqueados
- ✅ **Detección de contenido**: Identifica categorías por palabras clave
- ✅ **Overlay visual**: Muestra página de bloqueo personalizada
- ✅ **Gestión por categorías**: Organiza dominios en Adulto/Juegos/Descargas/Entretenimiento
- ✅ **Exportar hosts**: Genera archivo hosts actualizado para el sistema
- ✅ **Sincronización automática**: Actualiza cada 5 minutos

### Cómo funciona:
1. La extensión lee el archivo hosts del sistema
2. Clasifica los dominios en categorías automáticamente
3. Detecta contenido bloqueado en páginas web
4. Permite agregar/eliminar dominios desde la interfaz
5. Exporta el hosts actualizado para aplicar en el sistema

## 📁 Estructura del Proyecto

```
host/
├── README.md              # Esta documentación
├── hosts                  # Archivo hosts principal (24,000+ dominios)
├── LICENSE                # Licencia MIT
└── extension/             # Extensión del navegador (sincroniza con hosts)
    ├── manifest.json      # Configuración de la extensión
    ├── popup.html         # Interfaz de usuario
    ├── popup.js           # Lógica de sincronización
    ├── content.js         # Detección de contenido
    ├── background.js      # Manejo de bloqueo
    ├── blocked.html       # Página de bloqueo visual
    └── icons/             # Iconos de la extensión
        └── icon.svg       # Icono principal
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

### Sincronización con el Hosts:
1. La extensión carga automáticamente los dominios del hosts
2. Puedes importar tu hosts manualmente desde la pestaña "Importar/Exportar"
3. Los cambios se reflejan en tiempo real
4. Exporta el hosts actualizado para aplicar en el sistema

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
