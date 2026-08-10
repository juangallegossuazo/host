# 🛡️ Host Blocker

Extensión de navegador que bloquea sitios web no deseados. La lista se sincroniza desde este repositorio de GitHub.

## Cómo funciona

1. Instalas la extensión en Chrome, Firefox o Edge
2. La extensión descarga la lista de dominios desde este repositorio
3. Tú eliges qué categorías o dominios bloquear
4. La extensión bloquea el acceso directamente en el navegador

**No modifica el archivo hosts del sistema.** Todo el bloqueo lo hace la extensión.

## Categorías

| Categoría | Icono | Descripción |
|-----------|-------|-------------|
| Contenido Adulto | 🔞 | Pornografía, cams, dating adulto |
| Juegos Online | 🎮 | Plataformas de juegos web |
| Descargas | 📥 | Softonic, torrents, descargas |
| Entretenimiento | 📺 | Redes sociales, streaming, compras |

## Instalación de la extensión

### Chrome / Edge
1. Abre `chrome://extensions/`
2. Activa **Modo desarrollador**
3. Haz clic en **Cargar extensión sin empaquetar**
4. Selecciona la carpeta `extension/`

### Firefox
1. Abre `about:debugging#/runtime/this-firefox`
2. Haz clic en **Cargar componente temporal**
3. Selecciona `extension/manifest.json`

## Uso

- Haz clic en el ícono de la extensión para abrir el panel
- **Sincronizar**: Descarga la última lista desde GitHub
- **Bloquear Todo**: Activa todas las categorías
- **Desbloquear Todo**: Desactiva todas las categorías
- Activa/desactiva categorías con los toggles
- Expande cada categoría para elegir dominios individuales

## Estructura

```
host/
├── README.md
├── hosts                    # Lista completa (para referencia)
├── categories/              # Listas por categoría (la extensión las descarga)
│   ├── adult.txt
│   ├── games.txt
│   ├── downloads.txt
│   └── entertainment.txt
└── extension/               # La extensión del navegador
    ├── manifest.json
    ├── background.js        # Sincronización y bloqueo
    ├── popup.html/js        # Interfaz de usuario
    ├── content.js           # Overlay de bloqueo
    └── icons/
```

## Actualizar la lista

Edita los archivos en `categories/` y haz push a GitHub. La extensión sincroniza automáticamente cada 30 minutos, o puedes pulsar "Sincronizar" en el panel.

## Licencia

MIT
