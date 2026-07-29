# NovelNext

**NovelNext** è un'applicazione mobile innovativa che trasforma le tue novelle in opere con uno **stile fumettistico**, permettendoti di **caricare, stilizzare e scaricare** i tuoi contenuti in diversi formati. Ideale per scrittori, artistici e appassionati di narrativa che vogliono dare un tocco visivo unico alle proprie storie.

---

## 📌 Caratteristiche principali

- **Stilizzazione fumettistica**: Applica stili visivi ispirati ai fumetti alle tue novelle.
- **Esportazione multi-formato**: Scarica le tue opere in formati come **PDF, EPUB, PNG (immagini)** e altri.
- **Caricamento flessibile**: Importa testuali da file di testo, documenti Word, o direttamente da input manuale.
- **Editor integrato**: Modifica e organizza i capitoli, i paragrafi e gli stili in tempo reale.
- **Anteprima live**: Visualizza in anteprima lo stile applicato prima di esportare.

---

## 🛠 Prerequisiti

- **Docker** installato sul tuo sistema (per l'esecuzione locale).
- **Git** (per clonare il repository).
- **Node.js 20+** (opzionale, per lo sviluppo senza Docker).

---

## 📥 Come scaricare il repository

### Clone da GitHub
```bash
git clone https://github.com/giorgioduscio/novel-next.git
cd novel-next
```

---

## 🚀 Come avviare con Docker

### 1. Avvio del container
```bash
docker compose up --build -d
```
Questo comando:
- Costruisce l'immagine Docker.
- Avvia il container in background.
- Espone l'applicazione sulla porta **3000**.

### 2. Accesso all'applicazione
Apri il browser e vai a:
```
http://localhost:3000
```

### 3. Comandi utili
| Comando | Descrizione |
|---------|-------------|
| `docker compose logs` | Visualizza i log del container |
| `docker compose down` | Ferma il container |
| `docker compose exec node_app sh` | Accedi al terminale del container |
| `docker compose restart` | Riavvia il container |

---

## 💻 Sviluppo

Il progetto è configurato con **volumi Docker** per il **live-reloading**:
- Le modifiche ai file locali vengono automaticamente riflesse nel container.
- Non è necessario ricreare il container dopo ogni modifica.

### Struttura del progetto
- `/app`: Contiene la logica principale dell'applicazione (Next.js).
- `/app/data`: Gestione dei dati (libri, capitoli, paragrafi).
- `/app/schemas`: Definizione degli schemi (es. `_book_schema.ts` per la struttura dei libri).
- `/app/shareds`: Componenti riutilizzabili (es. `Frag`).
- `/public`: Risorse statiche (immagini, stili globali).

---

## 🛠 Stack Tecnologico

| Tecnologia | Versione | Utilizzo |
|------------|----------|----------|
| **Next.js** | 16 | Framework React per rendering lato server e statico |
| **TypeScript** | Latest | Tipizzazione statica per maggiore robustezza |
| **Node.js** | 20 Alpine | Ambiente di esecuzione leggero |
| **Docker** | Latest | Containerizzazione per sviluppo e produzione |
| **Tailwind CSS** | Latest | Stilizzazione rapida e personalizzabile |
| **React** | 18 | Libreria per la costruzione dell'interfaccia utente |

---
## 📂 Formati di esportazione supportati
- **PDF**: Ideale per la stampa o la condivisione.
- **EPUB**: Formato standard per e-book.
- **PNG/JPEG**: Esportazione come immagini (per singole pagine o anteprime).
- **TXT/MD**: Formati testuali semplici per l'editing esterno.

---
## 🎨 Personalizzazione
- **Temi predefiniti**: Scegli tra stili fumettistici preimpostati (es. "Manga", "Comic Book", "Dark Novel").
- **Stili personalizzati**: Modifica colori, font, bordi e sfondi tramite un editor visivo.
- **Template**: Applica layout predefiniti per pagine, capitoli e paragrafi.

---
## 📬 Contatti
Per domande o suggerimenti, apri una **issue** su GitHub o contattami direttamente.
