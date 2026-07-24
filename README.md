# Template Next

Progetto Next.js con TypeScript configurato per essere eseguito in container Docker.

## Prerequisiti

- Docker installato sul tuo sistema
- Git (per clonare il repository)

## Come scaricare il repository

### Clone da GitHub

```bash
git clone https://github.com/giorgioduscio/template-next.git
cd template-next
```

## Come avviare con Docker

### Avvio del container

```bash
docker compose up --build -d
```

Questo comando:
- Costruisce l'immagine Docker
- Avvia il container in background
- Espone l'applicazione sulla porta 3000

### Accesso all'applicazione

Apri il browser e vai a:
```
http://localhost:3000
```

### Comandi utili

- **Visualizzare i log**: `docker compose logs`
- **Fermare il container**: `docker compose down`
- **Entrare nel container**: `docker compose exec node_app sh`
- **Riavviare il container**: `docker compose restart`

## Sviluppo

Il progetto è configurato con volumi Docker per il live-reloading. Le modifiche ai file vengono riflesse automaticamente nel container.

Puoi modificare i file nella directory locale e le modifiche verranno applicate in tempo reale.

## Stack Tecnologico

- **Next.js 16** - Framework React
- **TypeScript** - Tipizzazione statica
- **Node.js 20 Alpine** - Ambiente di esecuzione
- **Docker** - Containerizzazione
