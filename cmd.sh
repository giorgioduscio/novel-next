#!/bin/sh
echo "1) START... (http://127.0.0.1:3000)"
docker compose up -d

echo "2) BUILDING..."
docker compose exec novel-next-app sh -c "rm -rf .next/* && npm run build"

echo "3) SHELL..."
docker compose exec novel-next-app sh

echo "4) STOP..."
docker compose stop