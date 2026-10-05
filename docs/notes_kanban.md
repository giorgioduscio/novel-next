# Note

* git reset head~1; git add .; git commit -m "deploy"; git push -f

### Connettersi al network
* ipconfig
* npm run dev -- --hostname 0.0.0.0 --port 3000
* http://[IP]:3000 # sull'altro dispositivo della rete

# Kanban - Novel Writer (Next.js)
## 📌 To Do 

    - colori a pulsante
    - colori per ex_style

* sectionComponent.tsx: fai in modo che quando clicco il paragrafo (o la textarea), attivi edit mode. questa funzionalità c'è giià ma funziona male
* barra di avanzamento: in navigation.tsx implementa una barra di avanzamento che aumenta in base allo scroll della pagina: se sono allinizio della pagina, mostra 0%; a metà, mostra 50%; se non c'è più nulla da scrollare perche sono arrivato alla fine della pagina, mostra 100%

* **Section.sass**: fai in modo che gli elementi con la classe .dettaglio abbiano il colore del bordo uguale allo sfondo dellelemento in cui viene applicato (ma più scuro)
* **SectionComponent.tsx**: fai in modo che i dropdown dei pulsanti di stile abbiano la larghezza corretta alla quantità di pulsanti che contengono. esempio: se un dropdown contiene 3 elementi, può rimanere com'è adesso. se ne contiene 10, vorrei che separasse le colonne in 2. se sono nove, in 3
* **ornamento** verde fluo e bordi angolati


  
* [5] sectioncomponent layout per pc
* [5] elementi angolati
* sostituire firebase con alternative già sicure

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