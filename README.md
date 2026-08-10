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
| Redes Sociales | 💬 | Facebook, Instagram, TikTok, Twitter, etc. |
| Video / Streaming | 📺 | Netflix, YouTube, Twitch, Disney+, etc. |
| Música | 🎵 | Spotify, SoundCloud, Deezer, etc. |
| Contenido Adulto | 🔞 | Pornografía, cams, OnlyFans, etc. |
| Juegos | 🎮 | Roblox, Steam, Fortnite, etc. |
| Descargas | 📥 | Softonic, torrents, descargas |
| Apuestas / Casino | 🎰 | Bet365, PokerStars, etc. |
| Dating / Citas | ❤️ | Tinder, Bumble, OkCupid, etc. |
| Compras | 🛒 | Amazon, eBay, AliExpress, etc. |
| Entretenimiento | 😂 | 9GAG, BuzzFeed, Imgur, etc. |

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
│   ├── redes_sociales.txt
│   ├── video.txt
│   ├── musica.txt
│   ├── xxx.txt
│   ├── juegos.txt
│   ├── descargas.txt
│   ├── apuestas.txt
│   ├── dating.txt
│   ├── compras.txt
│   └── entretenimiento.txt
└── extension/
    ├── manifest.json
    ├── background/
    ├── popup/
    ├── options/
    ├── blocked/
    ├── content/
    └── icons/
```

## Licencia

MIT
