#!/bin/sh
echo "1) START"
docker compose up -d

echo "2) BUILDING"
docker compose exec novel-next-app sh -c "rm -rf .next/* && npm run build"
docker logs novel-next-app --tail 50

echo "3) SHELL (localhost:3000)"
docker compose exec novel-next-app sh

echo "4) STOP"
docker compose stop