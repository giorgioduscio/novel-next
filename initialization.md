# dockerfile

```
# Usa un'immagine ufficiale Node.js basata su Alpine (leggera)
FROM node:20-alpine

# Imposta la directory di lavoro all'interno del container
WORKDIR /app

# Copia i file del progetto
COPY server.js ./

# Espone la porta dell'applicazione (es. 3000)
EXPOSE 3000

# Comando di avvio
CMD ["node", "server.js"]
```

# docker-compose.yml

```
services:
  node_app:
    build: .
    container_name: node_app
    ports:
      - "3000:3000"
    volumes:
      - .:/app
    restart: unless-stopped
      
```

# server.js

```
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello from Node.js container!');
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

``` sh
#!/bin/sh
echo "Starting container..."
docker compose up -d

echo "Opening shell..."
docker compose exec node_app sh

echo "Stopping container..."
docker compose stop
```