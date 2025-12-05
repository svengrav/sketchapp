#!/bin/bash
# git update-index --chmod=+x docker.bash

# 1. Nginx Config ins Gateway kopieren
docker cp nginx/sketch.conf nginx-gateway:/etc/nginx/conf.d/sketch.conf

# 2. SketchApp Container bauen & starten
docker compose up --build -d

# 3. Nginx Gateway neu laden
docker exec nginx-gateway nginx -s reload