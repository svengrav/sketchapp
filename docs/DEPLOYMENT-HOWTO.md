# How-To: Neue App auf devbox.ferthe.de deployen

Diese Anleitung beschreibt, wie du eine neue App (Frontend + Backend) auf dem Server bereitstellst und über das Nginx Gateway erreichbar machst.

---

## Voraussetzungen

- SSH-Zugang zum Server (`devbox.ferthe.de`)
- Docker & Docker Compose installiert
- Nginx Gateway läuft bereits (`nginx-gateway` Container im `host` Netzwerk)

---

## Übersicht der Schritte

1. [Projektstruktur erstellen](#1-projektstruktur-erstellen)
2. [Backend (API) konfigurieren](#2-backend-api-konfigurieren)
3. [Frontend konfigurieren](#3-frontend-konfigurieren)
4. [Docker Compose einrichten](#4-docker-compose-einrichten)
5. [Nginx Gateway Konfiguration](#5-nginx-gateway-konfiguration)
6. [Deployment](#6-deployment)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Projektstruktur erstellen

```
myapp/
├── .env                    # Umgebungsvariablen (nicht committen!)
├── .env.example            # Beispiel für Umgebungsvariablen
├── docker-compose.yml      # Orchestriert alle Services
├── nginx/
│   └── myapp.conf          # Nginx Gateway Konfiguration
├── api/                    # Backend
│   ├── Dockerfile
│   ├── .dockerignore
│   └── ... (Quellcode)
└── app/                    # Frontend
    ├── Dockerfile
    ├── .dockerignore
    ├── nginx.conf          # Nginx Config für SPA
    └── ... (Quellcode)
```

---

## 2. Backend (API) konfigurieren

### 2.1 Dockerfile für API erstellen

**Beispiel: Deno Backend** (`api/Dockerfile`):
```dockerfile
FROM denoland/deno:2.1.4

WORKDIR /app
COPY deno.json .
RUN deno install
COPY . .
RUN deno cache main.ts

EXPOSE 8000
CMD ["deno", "run", "--allow-net", "--allow-read", "--allow-write", "--allow-env", "main.ts"]
```

**Beispiel: Node.js Backend** (`api/Dockerfile`):
```dockerfile
FROM node:22-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

EXPOSE 3000
CMD ["node", "index.js"]
```

### 2.2 .dockerignore erstellen

`api/.dockerignore`:
```
node_modules
.env
*.log
```

---

## 3. Frontend konfigurieren

### 3.1 Vite Base Path setzen

**Wichtig:** Der `base` Pfad muss dem URL-Pfad entsprechen, unter dem die App erreichbar ist.

`app/vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/myapp/',  // <- Anpassen!
  plugins: [react()],
})
```

### 3.2 API URL konfigurieren

`app/src/services/api.ts`:
```typescript
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function fetchData() {
  const response = await fetch(`${API_BASE}/api/data`);
  return response.json();
}
```

### 3.3 Dockerfile für Frontend erstellen

`app/Dockerfile`:
```dockerfile
# Build Stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# Production Stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3.4 Nginx Config für SPA erstellen

`app/nginx.conf`:
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # SPA Routing - alle Routen zu index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache für statische Assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3.5 .dockerignore erstellen

`app/.dockerignore`:
```
node_modules
dist
.env
.env.local
```

---

## 4. Docker Compose einrichten

### 4.1 docker-compose.yml erstellen

```yaml
services:
  api:
    build:
      context: ./api
      dockerfile: Dockerfile
    container_name: myapp-api
    ports:
      - "8020:8000"  # <- Freien Port wählen!
    environment:
      - PORT=8000
      - DATABASE_URL=${DATABASE_URL}
    restart: unless-stopped

  app:
    build:
      context: ./app
      dockerfile: Dockerfile
      args:
        - VITE_API_URL=${VITE_API_URL}
    container_name: myapp-app
    ports:
      - "8021:80"    # <- Freien Port wählen!
    depends_on:
      - api
    restart: unless-stopped
```

### 4.2 Portnummern prüfen

Prüfe welche Ports bereits belegt sind:
```bash
docker ps --format "table {{.Names}}\t{{.Ports}}"
```

Wähle freie Ports (z.B. 8020, 8021, 8022, ...).

### 4.3 Environment-Variablen

`.env`:
```env
# API
DATABASE_URL=...

# Frontend
VITE_API_URL=https://devbox.ferthe.de/myapp/api
```

`.env.example` (ohne Secrets, für Git):
```env
DATABASE_URL=your_database_url
VITE_API_URL=https://devbox.ferthe.de/myapp/api
```

---

## 5. Nginx Gateway Konfiguration

### 5.1 Gateway Config erstellen

`nginx/myapp.conf`:
```nginx
# MyApp Configuration

# Frontend
location /myapp/ {
    proxy_pass http://localhost:8021/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location = /myapp {
    return 301 /myapp/;
}

# API
location /myapp/api/ {
    proxy_pass http://localhost:8020/api/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

**Wichtig:**
- `localhost:8021` = Port aus docker-compose.yml (Frontend)
- `localhost:8020` = Port aus docker-compose.yml (API)
- `/myapp/` = URL-Pfad (muss mit Vite `base` übereinstimmen)

### 5.2 WebSocket Support (falls benötigt)

Für WebSocket-Verbindungen zusätzlich:
```nginx
location /myapp/ws/ {
    proxy_pass http://localhost:8020/ws/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
}
```

---

## 6. Deployment

### 6.1 Auf den Server wechseln

```bash
ssh devbox.ferthe.de
cd /home/azadmin/myapp
```

### 6.2 Container bauen und starten

```bash
docker compose up -d --build
```

### 6.3 Prüfen ob Container laufen

```bash
docker ps | grep myapp
```

### 6.4 Gateway Config installieren

```bash
# Config kopieren
sudo cp nginx/myapp.conf /media/data/nginx/conf.d/myapp.conf

# Nginx Gateway neu laden
docker restart nginx-gateway
```

### 6.5 Gateway Logs prüfen

```bash
docker logs nginx-gateway --tail 20
```

Bei Fehlern wie `host not found in upstream`:
- Prüfen ob die Ports in docker-compose.yml exponiert sind
- Prüfen ob die Portnummern in der nginx.conf stimmen

### 6.6 Testen

```bash
# API Health Check
curl https://devbox.ferthe.de/myapp/api/health

# Frontend
curl -I https://devbox.ferthe.de/myapp/
```

---

## 7. Troubleshooting

### Problem: 404 für Assets (JS/CSS)

**Ursache:** Vite `base` Pfad stimmt nicht mit URL überein.

**Lösung:**
1. `vite.config.ts`: `base: '/myapp/'` setzen
2. Frontend neu bauen: `docker compose up -d --build app`
3. Browser-Cache leeren (Ctrl+Shift+R)

### Problem: 502 Bad Gateway

**Ursache:** Backend-Container läuft nicht oder falscher Port.

**Lösung:**
```bash
# Container Status prüfen
docker ps -a | grep myapp

# Logs prüfen
docker logs myapp-api --tail 50

# Port prüfen
curl http://localhost:8020/health
```

### Problem: CORS Fehler

**Ursache:** API erlaubt keine Cross-Origin Requests.

**Lösung:** CORS Headers in der API setzen:
```typescript
// Deno
function corsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
```

### Problem: API wird doppelt aufgerufen (/api/api/)

**Ursache:** `VITE_API_URL` enthält bereits `/api`.

**Lösung:** 
- Entweder `VITE_API_URL=https://devbox.ferthe.de/myapp` (ohne `/api`)
- Oder im Frontend-Code `/api/` entfernen

### Problem: Container startet nicht

```bash
# Detaillierte Logs
docker logs myapp-api

# Container interaktiv starten zum Debuggen
docker run -it --rm myapp-api sh
```

---

## 8. Checkliste für neue Apps

- [ ] Projektstruktur erstellen
- [ ] API Dockerfile erstellen
- [ ] Frontend Dockerfile erstellen
- [ ] Vite `base` Pfad setzen
- [ ] `nginx.conf` für SPA erstellen
- [ ] `docker-compose.yml` mit freien Ports erstellen
- [ ] `.env` mit korrekter `VITE_API_URL` erstellen
- [ ] Gateway Config erstellen
- [ ] Container bauen: `docker compose up -d --build`
- [ ] Gateway Config kopieren: `cp nginx/myapp.conf /media/data/nginx/conf.d/`
- [ ] Gateway neu laden: `docker restart nginx-gateway`
- [ ] Testen: `curl https://devbox.ferthe.de/myapp/`

---

## 9. Nützliche Befehle

```bash
# Alle Container anzeigen
docker ps -a

# Logs eines Containers
docker logs -f myapp-api

# Container neu starten
docker compose restart

# Nur ein Service neu bauen
docker compose up -d --build api

# In Container Shell
docker exec -it myapp-api sh

# Disk Space prüfen
df -h

# Docker aufräumen (Vorsicht!)
docker system prune -a
```
