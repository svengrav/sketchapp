# SketchApp Routing Architecture

## 🌐 Request Flow Overview

```
Browser Request → Nginx Gateway → Docker Container (Oak Server) → Response
    (HTTPS)         (Reverse Proxy)      (Deno + Static Files)
```

---

## 1️⃣ Nginx Reverse Proxy

**Location:** `/media/data/nginx/conf.d/sketch.conf`

```nginx
location /sketch/ {
    proxy_pass http://localhost:8060/;
    # ...headers...
}
```

### Was passiert:
- **Eingehend:** `https://devbox.svengrav.de/sketch/` 
- **Nginx stripped:** `/sketch/` → `/`
- **Weiterleitung:** `http://localhost:8060/`

---

## 2️⃣ Docker Container

**Service:** `app` (Container-Name)  
**Image:** `sketchapp-sketch`  
**Port Mapping:** `8060:8060` (Host → Container)

```yaml
# docker-compose.yml
services:
  sketch:
    ports:
      - "8060:8060"
    environment:
      - PORT=8060
```

### Was passiert:
- Container lauscht auf **Port 8060** (intern)
- Host-Port **8060** mapped zu Container-Port **8060**
- Nginx erreicht Container über `localhost:8060`

---

## 3️⃣ Oak Server (Deno)

**Location:** `api/main.ts`

### Middleware Chain (Reihenfolge wichtig!)

```typescript
app.use(oakCors());              // 1. CORS Headers
app.use(router.routes());        // 2. API Routes
app.use(router.allowedMethods()); // 3. HTTP Methods
app.use(routeStaticFilesFrom([   // 4. Static Files (Fallback)
  `${Deno.cwd()}/app/dist`,
  `${Deno.cwd()}/app/public`,
]));
```

### Request-Routing:

#### **API Requests** (Router matched)
```
GET /api/image?category=cities
  → router.get("/api/image", handler)
  → JSON Response
```

**Verfügbare API-Endpoints:**
- `GET /api/image` - Random image
- `GET /api/search?query=...` - Custom search
- `GET /api/categories` - Available categories
- `GET /api/cache/status` - Cache info
- `GET /api/cache/images` - All cached images
- `GET /health` - Health check

#### **Static Files** (Fallback zu Middleware)
```
GET /
  → Kein Router-Match
  → routeStaticFilesFrom() Middleware
  → context.send({ root: "/app/app/dist", index: "index.html" })
  → Serviert: /app/app/dist/index.html
```

```
GET /assets/index-CvsN3_QH.js
  → Kein Router-Match
  → routeStaticFilesFrom() Middleware
  → context.send({ root: "/app/app/dist" })
  → Serviert: /app/app/dist/assets/index-CvsN3_QH.js
```

---

## 4️⃣ Static Files (Vite Build)

### Build Process:

```bash
# In Dockerfile
RUN deno task build
  → cd ./app && deno run -A npm:vite build
  → Output: app/dist/
```

### Directory Structure im Container:

```
/app/                           # WORKDIR
├── api/
│   └── main.ts                # Oak Server Entry
├── app/
│   ├── dist/                  # ✅ Vite Build Output
│   │   ├── index.html
│   │   ├── assets/
│   │   │   ├── index-*.js
│   │   │   └── index-*.css
│   │   ├── manifest.webmanifest
│   │   └── *.svg (Icons)
│   └── public/                # Static Assets (nicht gebuildet)
└── deno.json
```

### Vite Config:

```typescript
// app/vite.config.ts
export default defineConfig({
  base: '/sketch/',  // ✅ Assets mit /sketch/ Prefix
  // ...
})
```

**Wichtig:** Vite generiert Pfade wie `/sketch/assets/index-*.js`  
Aber Oak serviert sie unter `/assets/index-*.js`  
**Nginx stripped `/sketch/`** → alles funktioniert!

---

## 5️⃣ Development vs Production

### **Production (Docker)**
```
Request → Nginx → Oak (Port 8060) → Static Files (dist/)
```

### **Development (Lokal)**
```
# Terminal 1: Vite Dev Server
cd app && deno task dev
  → http://localhost:15173

# Terminal 2: Oak API Server  
cd api && deno task dev
  → http://localhost:8005
```

**Vite Proxy Config:**
```typescript
// app/vite.config.ts
server: {
  port: 15173,
  proxy: {
    '/sketch/api': {
      target: 'http://localhost:8060',
      rewrite: (path) => path.replace(/^\/sketch/, ''),
    },
  },
}
```

**Development Flow:**
```
Browser → http://localhost:15173/sketch/
  → Vite Dev Server (HMR, React Fast Refresh)
  
API Request → /sketch/api/image
  → Vite Proxy → http://localhost:8060/api/image
  → Oak Server
```

---

## 🔍 Debug Cheat Sheet

### Container prüfen:
```bash
# Container Status
docker ps --filter "name=app"

# Logs
docker logs app -f

# In Container schauen
docker exec -it app sh
ls -la /app/app/dist/
```

### Nginx prüfen:
```bash
# Config testen
docker exec nginx-gateway nginx -t

# Reload
docker exec nginx-gateway nginx -s reload

# Logs
docker logs nginx-gateway -f
```

### API testen:
```bash
# Health Check
curl http://localhost:8060/health

# Image API
curl http://localhost:8060/api/image?category=cities

# Via Nginx
curl https://devbox.svengrav.de/sketch/api/health
```

---

## 📊 Port Overview

| Service | Internal Port | Host Port | Public URL |
|---------|--------------|-----------|------------|
| Nginx Gateway | 80, 443 | 80, 443 | https://devbox.svengrav.de |
| Oak Server (Production) | 8060 | 8060 | - (nur via Nginx) |
| Oak Server (Dev) | 8005 | 8005 | http://localhost:8005 |
| Vite Dev Server | 15173 | 15173 | http://localhost:15173 |

---

## 🚀 Deployment Flow

```bash
./deploy.bash
  1. Copy nginx/sketch.conf → /media/data/nginx/conf.d/
  2. docker compose up --build -d
     → Build Image mit Vite
     → Start Container auf Port 8060
  3. docker exec nginx-gateway nginx -s reload
  4. git commit & push
```

---

## ⚙️ Key Takeaways

1. **Nginx stripped `/sketch/`** → Oak bekommt `/` Requests
2. **Oak Middleware-Chain:** CORS → Router → Static Files
3. **Vite `base: '/sketch/'`** generiert korrekte Asset-Pfade
4. **Docker WORKDIR:** `/app` → Static Files unter `/app/app/dist`
5. **Production:** Single Container (Oak serviert API + Static)
6. **Development:** Vite Dev Server + Oak API (separate Prozesse)
