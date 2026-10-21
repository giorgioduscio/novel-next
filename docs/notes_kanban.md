# Note

* git reset head~1; git add .; git commit -m "deploy"; git push -f

### Connettersi al network
* ipconfig
* npm run dev -- --hostname 0.0.0.0 --port 3000
* http://[IP]:3000 # sull'altro dispositivo della rete



# Kanban - Novel Writer (Next.js)
## 📌 To Do 

* [x] **scrolling al focus dellinput** quando si digita un (input da mobile) la pagina deve scrollare fino a lui, tenendo conto della navbar e della bottombar
*  **window degli stili** dobbiamo trovare un modo per far scrollare la finestra fino allo stile selezionato. Idee? la finestra dovrebbe trovare l'unico pulsante con la classe .active e scrollare fino a quell'elemento

* [] **segnalibri smart**
  * evento custom: in feedbacksUI.tsx crea una funzione-evento 'ui_onView' che si innesca quando visualizzi l'elemento su cui è posto
  * <Frag>: implementa onView come parametro facoltativo in Frag.tsx. risultato atteso: <Frag onView={e=>...}></Frag>
  * trascrizione: crea una funzione che trascrive una stringa nell'url (#esempio) e implementa <Frag onView> in SectionComponent.tsx (s). quando l'elemento viene visualizzato

* [5] applicare loggers.md
* [5] cerca e sostituisci in tutto il libro
* [5] problemi caricamento: quando carico la pagina che mi posta ad un libro. all'inizio esegue i caricamenti, poi mostra "sezione non trovata" e poi mostra la sezione.
  * vorrei che "sezione non trovata" venga mostrata solo se necessaria. se i dati stanno ancora caricando, deve mostrare solo 'caricamento dati'

  
* [5] sectioncomponent layout per pc
* [5] elementi angolati
  * layout a esagoni
* sostituire firebase con alternative già sicure (appwrite)


## 🔄 In Progress (max 2-3)

## ❌ Blocked
*(vuoto)*

## 🔍 Review
*(vuoto)*

## Iceblock
* controllo sicurezza

## ✅ Done
* implementare home con form e lista dei libri
* implementare salvataggio locale
* implementare pagina del libro con form e lista delle sezioni
* implementare pagina della sezione con modifica e visualizzazione dei paragrafi
* modifica e visualizzazione delle pagine
* sostituire attributo post_text con ex_style e style con in_style
* validazione campi dei paragrafi (stili consentiti)
* ottimizzazione <Field> 
* font face efficace
* implementare salvataggio locale
* stili standard per la novella
* sostituire i form con pulsanti auto-compilanti
* implementare feedback (toast, agree, debounce) 
* implementare salvataggio cloud (firebase)
* separazione template e logica
* implementare bredcrumb per migliorare l'accessibilità
* Responsive design per pc
* funzionalità copia e incolla nell'editor della sezione
* colore testo automatico in base allo sfondo
* implementare autocomplete per stili ripetuti
* implementare funzionalità 'undo' e 'redo' 
* EditMode copre gli input sottostanti
* implementazione per uso pratico
* inserire note e id per parti, sezioni e paragrafi
* Sistema di autenticazione minimale
* gradiante nero: inserire uno sfondo nero lineare gradiante, dall'alto verso il basso, tra più paragrafi
* implementare i segnalibro nelle sezioni
* implementare stampa della sezione in formato verticale
* semplificazione processo di autorizzazione:
  - codice di lettura generato dal sistema
  - libri liberi: accessibili / editabili da chiunque abbia il link 
  - libri privati: serve un'autorizzazione per effettuare un'operazione 
  - eliminazione libro: se esiste un codice di scrittura, lo richiede pure per l'eliminazione
* BooksComponent.tsx gestisce una lista locale di libri 
* SectionComponent: implementare seletori per l'inserimento dello stile del paragrafo
* pulsanti dello stato dello stile in formato dropdown