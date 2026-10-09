# Risolvere Performance: Creazione e Gestione Paragrafi

## Problema Identificato

**SectionComponent.tsx**: La creazione e gestione dei paragrafi presentano ritardi percepibili durante l'interazione utente. Questo è dovuto al fatto che ogni modifica a un paragrafo triggera un aggiornamento dello stato locale e una chiamata API, anche se con debounce.

## Analisi del Codice Attuale

### 1. Metodo `PARAG.update` (useSectionComponent.tsx, righe 265-297)

```typescript
update(index: number, key: keyof Paragraph, value: string | boolean, safe = true) {
  const clone = structuredClone(book.get!);
  const sec = getSection(clone);
  if (!sec || !sec.paragraphs?.length) return;

  // ... logica di aggiornamento ...

  book.set(clone);  // Aggiorna stato locale

  // Direct API call
  if (!safe) return;
  bookContext.updateBook(book_id, clone);  // Chiama API (con debounce)
}
```

**Problema**: Ogni keystroke in un textarea triggera questo metodo, che:
1. Clona l'intero libro (`structuredClone(book.get!)`)
2. Aggiorna lo stato locale
3. Chiama `bookContext.updateBook` che ha un debounce di 1000ms

### 2. Metodo `updateBook` in BookContext.tsx (righe 279-297)

```typescript
updateBook: function (id: string, updatedBook: Partial<Book>, validation = true): Book | null {
  const stored = this.getBookById(id);
  if (!stored) {
    console.error("Libro non trovato");
    return null;
  }

  const merged = { ...stored, ...updatedBook };
  const validatedBook = validation ? this.validateBook(merged as Book) : (merged as Book);
  if (!validatedBook) return null;

  setBooks(function (prevBooks) {
    return prevBooks.map(function (book) {
      return book.id === id ? validatedBook : book;
    });
  });
  API.saveDebounced(validatedBook);  // Debounce di 1000ms
  return validatedBook;
},
```

**Problema**: 
- Il debounce è di 1000ms (troppo lungo per typing veloce)
- Ogni aggiornamento clona e valida l'intero libro
- Non c'è ottimizzazione per aggiornamenti parziali

### 3. API Debounce (BookContext.tsx, righe 63-66)

```typescript
saveDebounced: debounce(function (book: Book) {
  console.warn("debounce");
  return API_SERVICE.saveSingleBook(book);
}, 1000),
```

**Problema**: 1000ms è troppo lungo per un'esperienza utente reattiva.

## Soluzione Proposta

### Obiettivo
- I dati locali non devono aspettare la risposta API
- L'applicazione recupera i dati al caricamento iniziale
- Le richieste PUT successive devono essere fatte in background
- Il metodo `PARAG.update` deve aggiornare il componente locale ed effettuare la PUT senza aspettare la risposta (al massimo mostrando il toast di feedback)

### Passaggi per Implementare la Soluzione

#### Passo 1: Ridurre il Debounce API

**File**: `app/data/BookContext.tsx`

Modificare il debounce da 1000ms a 300-500ms:

```typescript
saveDebounced: debounce(function (book: Book) {
  console.warn("debounce");
  return API_SERVICE.saveSingleBook(book);
}, 300),  // Ridotto da 1000ms a 300ms
```

**Razionale**: 300ms è sufficiente per evitare chiamate API excessive durante typing veloce, ma abbastanza breve per non essere percepito come ritardo.

#### Passo 2: Implementare Debounce Locale per `PARAG.update`

**File**: `app/books/[id]/[part]/[section]/useSectionComponent.tsx`

Aggiungere un debounce locale al metodo `PARAG.update` per evitare aggiornamenti di stato troppo frequenti:

```typescript
// Aggiungere all'inizio del file
import { debounce } from "@/app/tools/feedbacksUI";

// Nella classe Parag, aggiungere:
private debouncedUpdate = debounce((index: number, key: keyof Paragraph, value: string | boolean) => {
  const clone = structuredClone(book.get!);
  const sec = getSection(clone);
  if (!sec || !sec.paragraphs?.length) return;

  // Controllo del tipo
  if (typeof value !== typeof sec.paragraphs[index][key]) {
    console.error("Tipo non valido");
    return;
  }

  // se l'input contiene ',,', compila i due attributi
  if (key === "in_style" && String(value).includes(",,")) {
    const [inPart, exPart] = String(value).split(",,");
    
    (sec.paragraphs as any)[index].in_style = inPart || "";
    (sec.paragraphs as any)[index].ex_style = exPart || "";
    
  // se l'input non contiene ',,' ma ex_style è truty, azzera ex_style
  } else if (key === "in_style" && !String(value).includes(",,") && sec.paragraphs[index].ex_style.length) {
    (sec.paragraphs as any)[index][key] = value;
    (sec.paragraphs as any)[index].ex_style ='';

  } else {
    (sec.paragraphs as any)[index][key] = value;
  }

  book.set(clone);

  // Direct API call in background
  bookContext.updateBook(book_id, clone);
}, 100);  // 100ms debounce locale

// Modificare il metodo update:
update(index: number, key: keyof Paragraph, value: string | boolean, safe = true) {
  if (!safe) {
    // Per aggiornamenti critici, non usare debounce
    this.debouncedUpdate.cancel();  // Cancella debounce pendente
    // ... logica immediata ...
  } else {
    // Per typing normale, usa debounce
    this.debouncedUpdate(index, key, value);
  }
}
```

**Razionale**: 
- Il debounce locale di 100ms riduce gli aggiornamenti di stato React
- L'API ha già il suo debounce di 300ms, quindi non ci saranno conflitti
- Per operazioni critiche (come rimozione paragrafo), si può bypassare il debounce

#### Passo 3: Ottimizzare la Clonazione del Libro

**File**: `app/books/[id]/[part]/[section]/useSectionComponent.tsx`

Invece di clonare l'intero libro ogni volta, possiamo usare una clonazione più superficiale quando possibile:

```typescript
// Aggiungere una funzione helper per clonazione efficiente
function cloneBookForUpdate(book: Book, part_id: string, section_id: string): Book {
  // Clona solo la parte e sezione necessarie
  const clone = structuredClone(book);
  const part = clone.parts?.find(p => p.id === part_id);
  if (part) {
    const sectionIndex = part.sections?.findIndex(s => s.id === section_id);
    if (sectionIndex !== undefined && sectionIndex >= 0) {
      // Clona solo la sezione specifica
      part.sections![sectionIndex] = structuredClone(part.sections![sectionIndex]);
    }
  }
  return clone;
}

// Nel metodo PARAG.update:
update(index: number, key: keyof Paragraph, value: string | boolean, safe = true) {
  const clone = cloneBookForUpdate(book.get!, part_id, section_id);  // Clonazione ottimizzata
  const sec = getSection(clone);
  // ... resto del codice ...
}
```

**Razionale**: Riduce il costo di clonazione quando si modificano solo paragrafi.

#### Passo 4: Implementare Salvataggio in Background con Feedback

**File**: `app/data/BookContext.tsx`

Modificare `API_SERVICE.saveSingleBook` per essere completamente asincrono con feedback:

```typescript
async saveSingleBook(book: Book, showFeedback = false) {
  try {
    const response = await fetch(`${FIREBASE_URL}/${book.id}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(book),
    });
    
    if (!response.ok) {
      console.error("Salvataggio non riuscito:", response.statusText);
      if (showFeedback) toast.danger("Errore nel salvataggio");
      return false;
    }
    
    if (showFeedback) toast.success("Salvataggio completato");
    return true;
  } catch (error) {
    console.error("Errore nel salvataggio delle api:", error);
    if (showFeedback) toast.danger("Errore di connessione");
    throw error;
  }
},
```

E modificare `updateBook` per non aspettare il salvataggio:

```typescript
updateBook: function (id: string, updatedBook: Partial<Book>, validation = true, showFeedback = false): Book | null {
  const stored = this.getBookById(id);
  if (!stored) {
    console.error("Libro non trovato");
    return null;
  }

  const merged = { ...stored, ...updatedBook };
  const validatedBook = validation ? this.validateBook(merged as Book) : (merged as Book);
  if (!validatedBook) return null;

  setBooks(function (prevBooks) {
    return prevBooks.map(function (book) {
      return book.id === id ? validatedBook : book;
    });
  });
  
  // Salvataggio in background, non aspettiamo il risultato
  API.saveDebounced(validatedBook, showFeedback);
  return validatedBook;
},
```

#### Passo 5: Aggiungere Indicatore di Salvataggio (Opzionale)

Per dare feedback visivo all'utente che il salvataggio è in corso:

**File**: `app/data/BookContext.tsx`

```typescript
const isSaving = useDotNotation(false);

// In API_SERVICE:
async saveSingleBook(book: Book, showFeedback = false) {
  try {
    isSaving.set(true);
    const response = await fetch(`${FIREBASE_URL}/${book.id}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(book),
    });
    
    if (!response.ok) {
      console.error("Salvataggio non riuscito:", response.statusText);
      if (showFeedback) toast.danger("Errore nel salvataggio");
      return false;
    }
    
    if (showFeedback) toast.success("Salvataggio completato");
    return true;
  } catch (error) {
    console.error("Errore nel salvataggio delle api:", error);
    if (showFeedback) toast.danger("Errore di connessione");
    throw error;
  } finally {
    isSaving.set(false);
  }
},

// Esportare isSaving nel return
return {
  // ... altro ...
  isSaving,
};
```

Poi nel componente SectionComponent.tsx, mostrare un indicatore quando `isSaving` è true.

## Riassunto delle Modifiche

1. **Ridurre debounce API** da 1000ms a 300ms
2. **Aggiungere debounce locale** a `PARAG.update` (100ms) per ridurre aggiornamenti React
3. **Ottimizzare clonazione** del libro per aggiornamenti parziali
4. **Rendere salvataggio completamente asincrono** con feedback opzionale
5. **Aggiungere indicatore di salvataggio** per feedback visivo (opzionale)

## Testing

Dopo le modifiche, testare:
1. Digitazione veloce in un paragrafo - non dovrebbe esserci lag percepito
2. Creazione di nuovi paragrafi - dovrebbe essere istantanea
3. Rimozione paragrafi - dovrebbe essere istantanea
4. Salvataggio in background - verificare che i dati vengano salvati correttamente dopo qualche secondo
5. Offline/disconnessione - verificare che l'interfaccia rimanga responsiva anche se il salvataggio fallisce

## Note Aggiuntive

- Il debounce locale di 100ms + debounce API di 300ms = 400ms totale di latenza prima del salvataggio, ma l'interfaccia rimane responsiva dopo 100ms
- Per operazioni critiche (come rimozione), si può bypassare il debounce locale per immediatezza
- La clonazione ottimizzata riduce il carico CPU per aggiornamenti frequenti
