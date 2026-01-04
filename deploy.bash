#!/bin/bash
# git update-index --chmod=+x docker.bash

# 0. App Version inkrementieren
ENV_FILE="app/src/env.ts"
if [ -f "$ENV_FILE" ]; then
  CURRENT_VERSION=$(grep -oP 'APP_VERSION = "\K[0-9]+\.[0-9]+\.[0-9]+' "$ENV_FILE")
  if [ -n "$CURRENT_VERSION" ]; then
    # Parse version parts
    MAJOR=$(echo "$CURRENT_VERSION" | cut -d. -f1)
    MINOR=$(echo "$CURRENT_VERSION" | cut -d. -f2)
    PATCH=$(echo "$CURRENT_VERSION" | cut -d. -f3)
    # Increment patch version
    NEW_PATCH=$((PATCH + 1))
    NEW_VERSION="$MAJOR.$MINOR.$NEW_PATCH"
    # Update file
    sed -i "s/APP_VERSION = \"$CURRENT_VERSION\"/APP_VERSION = \"$NEW_VERSION\"/" "$ENV_FILE"
    echo "Version: $CURRENT_VERSION → $NEW_VERSION"
  fi
fi

# 1. Nginx Config ins Gateway kopieren
cp nginx/sketch.conf /media/data/nginx/conf.d/sketch.conf

# 2. SketchApp Container bauen & starten
docker compose up --build -d

# 3. Nginx Gateway neu laden
docker exec nginx-gateway nginx -s reload

# 4. Git Commit & Push
if [ -n "$NEW_VERSION" ]; then
  git add -A
  git commit -m "v$NEW_VERSION"
  git push
  echo "Git: v$NEW_VERSION gepusht"
fi