# 🛡️ Host Blocker

Extensión de navegador que bloquea sitios web no deseados. La lista se sincroniza desde este repositorio de GitHub.

## Cómo funciona

1. Instalas la extensión en Chrome, Firefox o Edge
2. La extensión descarga la lista de dominios desde este repositorio
3. Tú eliges qué categorías o dominios bloquear
4. La extensión bloquea el acceso directamente en el navegador

**No modifica el archivo hosts del sistema.**

## Categorías

| Categoría | Icono | Contenido |
|-----------|-------|-----------|
| Contenido Adulto | 🔞 | Pornografía, cams, dating adulto |
| Juegos Online | 🎮 | Plataformas de juegos web |
| Descargas | 📥 | Softonic, torrents, descargas |
| Entretenimiento | 📺 | Redes sociales, streaming |

## Instalación

### Chrome / Edge
1. Abre `chrome://extensions/`
2. Activa **Modo desarrollador**
3. **Cargar extensión sin empaquetar** → selecciona `extension/`

### Firefox
1. Abre `about:debugging#/runtime/this-firefox`
2. **Cargar componente temporal** → `extension/manifest.json`

## Panel de administrador

La extensión incluye un panel con:
- **Dashboard** con estadísticas y control rápido
- **Categorías** para activar/desactivar por categoría
- **Dominios** con búsqueda y selección individual
- **Registro** de sitios bloqueados
- **Configuración** de sincronización automática

## Actualizar la lista

Edita los archivos en `categories/` y haz push. La extensión sincroniza cada 30 minutos o manualmente con el botón ⚡ Sincronizar.

## Estructura

```
host/
├── README.md
├── categories/
│   ├── adult.txt
│   ├── games.txt
│   ├── downloads.txt
│   └── entertainment.txt
└── extension/
    ├── manifest.json
    ├── background.js
    ├── popup.html / popup.js
    ├── content.js
    └── icons/
```

## Licencia

MIT
