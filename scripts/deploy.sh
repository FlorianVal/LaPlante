#!/bin/bash
set -e

HOST="${1:-rasp}"
REMOTE_DIR="~/laplante"

echo " syncing vers $HOST:$REMOTE_DIR ..."
rsync -az --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.claude' \
  --exclude '.planning' \
  --exclude 'data' \
  --exclude 'dist' \
  --exclude '*.tsbuildinfo' \
  ./ "$HOST:$REMOTE_DIR/"

echo " Build + démarrage du container..."
ssh "$HOST" "cd $REMOTE_DIR && docker compose build --no-cache && docker compose up -d --force-recreate"

IP=$(ssh "$HOST" "hostname -I" | awk '{print $1}')
echo ""
echo " Déployé ! Accès: http://$IP:3000"
