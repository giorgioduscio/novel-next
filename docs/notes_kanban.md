# Note

* git reset head~1; git add .; git commit -m "deploy"; git push -f

### Connettersi al network
* ipconfig
* npm run dev -- --hostname 0.0.0.0 --port 3000
* http://[IP]:3000 # sull'altro dispositivo della rete

# Kanban - Novel Writer (Next.js)
## 📌 To Do
* [1] Sistema di autenticazione minimale

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
* Fix: migliorare e snellire la grafica
* fix: se il libro che si cerca di caricare ha lo stesso id di uno già esistente -> esegue BookHook.createBook() del nuovoLibro
* fix: implementare processo: aggiornamento stato -> validazione -> aggiornamento database -> feedback utente
* Responsive design per pc
* funzionalità copia e incolla nell'editor della sezione
* colore testo automatico in base allo sfondo
* implementare autocomplete per stili ripetuti
* implementare funzionalità 'undo' e 'redo' 