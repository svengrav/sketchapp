# Sketch App 🎨

A minimal urban sketching timer app that displays random city and landscape images from Unsplash, helping artists practice timed sketching sessions.

## Features

- **Random Images**: Fetches random city/landscape photos from Unsplash API
- **Configurable Timer**: 1, 3, 5, 10, or 15 minute sessions
- **Auto-Advance**: Automatically loads next image when timer ends
- **Extend Prompt**: Optional popup to extend time or skip to next image
- **Image Modes**: Fill, Fit, or Balanced view options
- **Zoom & Pan**: Pinch/scroll to zoom, drag to pan the image
- **PWA Support**: Install as standalone app on mobile/desktop
- **Dark Theme**: Fully dark UI optimized for focusing on the image

## Tech Stack

### Frontend
- React 19 + TypeScript
- Vite (rolldown-vite)
- Tailwind CSS 4
- react-zoom-pan-pinch
- Heroicons
- vite-plugin-pwa

### Backend
- Deno 2.1
- Unsplash API integration
- Azure Table Storage (optional cache/fallback)

### Deployment
- Docker + Docker Compose
- Nginx reverse proxy

## Quick Start

### Development

```bash
# Frontend
cd app
npm install
npm run dev

# Backend
cd api
deno task dev
```

### Production

```bash
# Build and deploy
./docker.bash
```

## Environment Variables

```env
# Backend (api/.env)
UNSPLASH_ACCESS_KEY=your_key
AZURE_STORAGE_CONNECTION_STRING=optional

# Frontend (built into Docker image)
VITE_API_URL=https://your-domain.com/sketch
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/image` | GET | Get random image (excludes `?exclude=id`) |
| `/api/health` | GET | Health check |
| `/api/cache/refill` | POST | Refill Azure cache from Unsplash |

## License

MIT

## Credits

- Images provided by [Unsplash](https://unsplash.com)
- Built with ❤️ for urban sketchers
