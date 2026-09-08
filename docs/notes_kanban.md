# Note

* git reset head~1; git add .; git commit -m "deploy"; git push -f

### Connettersi al network
* ipconfig
* npm run dev -- --hostname 0.0.0.0 --port 3000
* http://[IP]:3000 # sull'altro dispositivo della rete

# Kanban - Novel Writer (Next.js)
## 📌 To Do
* [1] ottimizzare giro di autorizzazioni
* [1] fix: rivedere logica dei suggerimenti e del "Caricamento"
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
  - codice di lettura calcolato dal sistema
  - libri liberi: accessibili / editabili da chiunque abbia il link 
  - libri privati: serve un'autorizzazione in base all'azione 