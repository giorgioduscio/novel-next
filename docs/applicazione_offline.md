# Architettura Offline-First e Ottimizzazione Prestazioni: Section

Questo documento sintetizza l'architettura professionale **Local-First / Offline-First** e gli interventi di ottimizzazione delle prestazioni implementati per la gestione delle sezioni e dei paragrafi.

---

## 1. Architettura Offline-First (Local-First)

L'applicazione adotta ora un approccio **Local-First**: l'interfaccia utente interagisce direttamente con uno strato di persistenza locale affidabile e veloce, delegando il salvataggio remoto su Firebase in background.

```
[ User Interaction ] 
         │
         ▼
[ In-Memory State ] (Zero Latenza - React State)
         │
         ├─────────────────────────────────────────┐
         ▼                                         ▼
[ IndexedDB: "books" ]                    [ Network Status Check ]
 (Persistenza istantanea su disco)                 │
                                    ┌──────────────┴──────────────┐
                                    ▼                             ▼
                              [ ONLINE ]                     [ OFFLINE ]
                                    │                             │
                        [ Firebase PUT (Debounced) ]      [ IndexedDB: "sync_queue" ]
                                    │                             │
                                    └──────────────┬──────────────┘
                                                   │
                                     (Al ripristino connessione)
                                                   ▼
                                         [ Background Auto-Sync ]
```

### Componenti Chiave:

1. **Storage Engine Locale (`lib/offlineStorage.ts`)**:
   - Utilizza **IndexedDB** (`novel_next_db`), il database nativo asincrono del browser con capacità elevata (senza i limiti di 5MB di `localStorage`).
   - Gestisce due Object Store:
     - `books`: memorizza l'intero documento del libro per lettura e scrittura istantanee anche senza internet.
     - `sync_queue`: gestisce l'Outbox delle operazioni in sospeso (`save`, `delete`) accumulate durante la disconnessione.
   - Include un meccanismo di fallback trasparente (in memoria e `localStorage`) per contesti con IndexedDB disabilitato o navigazione anonima restrittiva.

2. **Caricamento Stale-While-Revalidate**:
   - All'avvio dell'applicazione (`BookContext.tsx`), i libri vengono letti immediatamente dalla cache IndexedDB locale (0ms di attesa di rete). L'utente può aprire e modificare subito le sezioni.
   - In parallelo, se la connessione è attiva, Firebase aggiorna i dati in background senza sovrascrivere le modifiche locali non ancora sincronizzate.

3. **Coda di Sincronizzazione (Outbox Pattern)**:
   - Se un'operazione di salvataggio o eliminazione avviene mentre si è offline (o se una chiamata di rete fallisce), l'azione viene memorizzata in `sync_queue`.
   - Viene registrato un listener sugli eventi `window.addEventListener('online')`: al ritorno della connessione, `syncNow()` effettua automaticamente il replay delle operazioni pendenti e mostra un toast di conferma.

4. **Feedback e Controllo Utente**:
   - Esposti nel context: `isOnline`, `isSaving`, `pendingSyncCount`, `syncNow`.
   - Nella Navbar di [`SectionComponent.tsx`](file:///C:/Users/giorg/Desktop/prog/novel-next/app/books/[id]/[part]/[section]/SectionComponent.tsx) compare:
     - Badge **Offline** con il numero di modifiche salvate in locale in attesa di upload. Cliccando sul badge è possibile forzare un tentativo di riconnessione.
     - Indicatore di salvataggio rotante durante la sincronizzazione attiva.
     - Pulsante **Sincronizza** se ci sono elementi in coda una volta tornati online.

---

## 2. Ottimizzazione Prestazioni Sezione & Paragrafi

Risolve le problematiche identificate in [`docs/risolvere_performance.md`](file:///C:/Users/giorg/Desktop/prog/novel-next/docs/risolvere_performance.md).

### 1. Clonazione Selettiva (`cloneBookForUpdate`)
- **Problema precedente**: Ad ogni digitazione o aggiunta paragrafo veniva eseguito `structuredClone(book.get)` sull'intero albero dell'opera (tutte le parti, sezioni e paragrafi), saturando la CPU.
- **Soluzione**: Introdotta `cloneBookForUpdate(book, part_id, section_id)` in [`useSectionComponent.tsx`](file:///C:/Users/giorg/Desktop/prog/novel-next/app/books/[id]/[part]/[section]/useSectionComponent.tsx). Clona solo la sezione e i paragrafi target mantenendo invariate le referenze delle altre parti e sezioni. L'overhead computazionale scende da decine di millisecondi a microsecondi.

### 2. Debounce a Doppio Livello con Cancel
- **Debounce Locale**: `PARAG.debouncedUpdate` utilizza un debounce di 100ms durante la digitazione continua per raggruppare i re-render di React.
- **Metodo `.cancel()`**: In [`app/tools/feedbacksUI.ts`](file:///C:/Users/giorg/Desktop/prog/novel-next/app/tools/feedbacksUI.ts) la funzione `debounce` è stata estesa con il metodo `.cancel()`. Nelle azioni critiche o immediate (`safe = false`), come rimozione paragrafo, reset stile o toggle del segnalibro, il debounce pendente viene cancellato immediatamente per garantire feedback istantaneo.
- **Debounce Remoto**: `API.saveDebounced` in [`BookContext.tsx`](file:///C:/Users/giorg/Desktop/prog/novel-next/app/data/BookContext.tsx) è configurato a 300ms (anziché 1000ms), riducendo drasticamente il tempo di attesa prima dell'invio dei dati al server.

### 3. Eliminazione di Cloni Ridondanti in `HISTORY`
- Nel metodo `onChangeBook` della cronologia (undo/redo), veniva invocato `structuredClone(book.get)` ad ogni cambio di stato solo per estrarre la sezione. È stato rimosso in favore di un accesso diretto in sola lettura (`getSection(book.get)`).

### 4. Scorciatoie da Tastiera SNAPPY (`keyboardFeatures.ts`)
- La divisione del paragrafo con <kbd>Enter</kbd> e l'unione dei paragrafi con <kbd>Backspace</kbd> e <kbd>Delete</kbd> ora utilizzano `cloneBookForUpdate` anziché clonare l'intero libro.

---

## 3. Riepilogo dei File Modificati e Creati

| File | Tipo | Descrizione |
|------|------|-------------|
| [`lib/offlineStorage.ts`](file:///C:/Users/giorg/Desktop/prog/novel-next/lib/offlineStorage.ts) | **Nuovo** | Modulo IndexedDB per caching libri, gestione della outbox (`sync_queue`), detection e listener stato rete. |
| [`app/tools/feedbacksUI.ts`](file:///C:/Users/giorg/Desktop/prog/novel-next/app/tools/feedbacksUI.ts) | Modificato | Aggiunto metodo `.cancel()` alla funzione di utilità `debounce`. |
| [`app/data/BookContext.tsx`](file:///C:/Users/giorg/Desktop/prog/novel-next/app/data/BookContext.tsx) | Modificato | Integrazione caricamento offline-first (IndexedDB), debounce API a 300ms, gestione `sync_queue`, auto-sync su evento `online`, esportazione `isSaving`, `isOnline`, `pendingSyncCount`, `syncNow`. |
| [`app/books/[id]/[part]/[section]/useSectionComponent.tsx`](file:///C:/Users/giorg/Desktop/prog/novel-next/app/books/[id]/[part]/[section]/useSectionComponent.tsx) | Modificato | Implementata funzione `cloneBookForUpdate`, debounced update a 100ms con cancel, eliminati structuredClone ridondanti in `HISTORY` e `FIND_REPLACE`, esportati stati offline. |
| [`app/books/[id]/[part]/[section]/keyboardFeatures.ts`](file:///C:/Users/giorg/Desktop/prog/novel-next/app/books/[id]/[part]/[section]/keyboardFeatures.ts) | Modificato | Utilizzo di `cloneBookForUpdate` nelle azioni da tastiera (Enter, Backspace, Delete). |
| [`app/books/[id]/[part]/[section]/SectionComponent.tsx`](file:///C:/Users/giorg/Desktop/prog/novel-next/app/books/[id]/[part]/[section]/SectionComponent.tsx) | Modificato | Inserito indicatore reattivo di rete/salvataggio/offline nella Navbar con badge conteggio modifiche pendenti e pulsante di sincronizzazione manuale; azioni immediate per segnalibri e reset stile. |
