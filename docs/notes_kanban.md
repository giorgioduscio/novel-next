# Note

* git reset head~1; git add .; git commit -m "deploy"; git push -f

### Connettersi al network
* ipconfig
* npm run dev -- --hostname 0.0.0.0 --port 3000
* http://[IP]:3000 # sull'altro dispositivo della rete

# Kanban - Novel Writer (Next.js)
## 📌 To Do 

* [1] visualizzazione libri (in bookscomponents.tsx)
situazione: al momento i libri vengono mostrati solo in base a quelli che l'utente può leggere, se ha un codice uguale a auth_read del libro
problema: se un libro ha auth_read="", non lo vedrà mai
soluzione: deve esserci una lista locale di libri che l'utente può visualizzare. quando l'utente può leggere un libro, viene aggiunto alla lista locale. un libro può essere aggiunto anche quando l'utente cerca il titolo di un libro e preme su "aggiungi alla lista"
  - implementa l'utilizzo di un array di id di libri (array di stringhe) sincronizzato con localstorage
  - le card che non fanno parte della lista, vengono mostrate solo se l'utente cerca nel filtro. hanno un pulsante "aggiungi alla lista"
  - dei libri possono essere  rimossi dalla lista attraverso un pulsante "bi bi-x-lg"
  - rimuovi la logica di editMode nella pagina dei libri. quando si clicca su "aggiungi libro", il sistema deve visualizzare questo libro nella pagina "books/id_book/structure" con dei valori di default tipo "inserire_titolo"
  
* [1] sectioncomponent layout per pc
* [5] elementi angolati
* [?] layout mobile
  - fluidita input in fondo e tastiera digitale

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