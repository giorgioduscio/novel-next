#!/bin/sh
echo "Starting container... (http://127.0.0.1:3000)"
docker compose up -d

echo "Opening shell..."
docker compose exec novel-next-app sh

echo "Stopping container..."
docker compose stop