import { Book, Paragraph } from "@/app/schemas/book_schema";

export function keyboardFeatures(
  book_id: number,
  e: React.KeyboardEvent<HTMLTextAreaElement>,
  book: Book,
  setBook: (book: Book) => void,
  SECTION: { 
    getSection: (book: Book) => any
  },
  PARAG: {
    handleCreate: (index: number, value?: string) => void,
    handleRemove: (index: number, targetParag: Paragraph, save?: boolean) => void
  },
  BookHook:{
    updateBook: (book_id: number, updatedBook: Book, save?: boolean) => void,
  }
){
  const gesturesKeys = [
    "Enter", "Tab", "Backspace", "Delete", 
    "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"
  ];
  if(!gesturesKeys.includes(e.key)) return;


  // 1) dati
  const {value, id} = e.target as HTMLTextAreaElement;
  const [_index, key] = id.split(">") as [string, keyof Paragraph];
  const index = parseInt(_index);
  if(isNaN(index) || !key) return console.error("Parametri non validi");
  const section = SECTION.getSection(book);
  if(!section) return console.error("Sezione non trovata");
  const textarea = e.target as HTMLTextAreaElement;


  // CHANGEFOCUS helper per cambiare il focus
  function _changeFocus(direction: "up" | "down" | "this", from: "|__" | "__|" | number) {
    const walk = direction === "up" ? -1 
                : direction === "down" ? 1 
                : 0;
    const selector = `${index + walk}>${key}`;
    setTimeout(() => {
      const el = document.getElementById(selector) as HTMLTextAreaElement;
      if(!el) return console.error("Elemento non trovato");
      // comincia all'inizio della textarea
      if(from === "__|") el.setSelectionRange(el.value.length, el.value.length);
      else if(from === "|__") el.setSelectionRange(0, 0);
      else el.setSelectionRange(from, from);
      el.focus();
    }, 10);
  }


  // FEATURES
  const FEATURES :[boolean, ()=> any][] =[
    [
      e.key==="Enter" && key === "in_style",
      function enterStyle(){
        e.preventDefault();
        (e.target as HTMLTextAreaElement).blur(); 
      }
    ],
    [
      e.key=== "Enter",
      function enterText(){
        e.preventDefault()
        // recupera tutto il testo prima e dopo il cursore
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const before = value.substring(0, start);
        const after = value.substring(end);
        // se è all'inizio, crea un paragrafo prima
        if(start === 0) {
          PARAG.handleCreate(index-1);
          _changeFocus("this", "|__");

        // se alla fine, crea un paragrafo dopo
        } else if (start === value.length) {
          PARAG.handleCreate(index);
          _changeFocus("down", "|__");

        // se nel mezzo, l'attuale paragrafo ha valore prima del cursore
        // e ne crea un'altro con il valore dopo il cursore
        } else {
          // 1. Aggiorna il paragrafo corrente con `before`
          const updatedBook = structuredClone(book);
          const sec = SECTION.getSection(updatedBook);
          if (!sec?.paragraphs?.[index]) return;

          sec.paragraphs[index].text = before; // Aggiorna direttamente il testo
          setBook(updatedBook); // Aggiorna lo stato

          // 2. Crea un nuovo paragrafo con `after`
          setTimeout(() => {
            PARAG.handleCreate(index, after);
            _changeFocus("down", "|__");
          }, 10);
        }
      }
    ],
    [
      // Se il cursore è all'inizio del paragrafo e il paragrafo NON è vuoto
      e.key === "Backspace" && key === "text" && textarea.selectionStart === 0,
      function backspaceText(){
        e.preventDefault(); // Evita il comportamento predefinito del Backspace

        const prevParag = section?.paragraphs?.[index - 1];
        if (!prevParag) return; // Se non esiste il paragrafo precedente, esci

        // 1. Memorizza la lunghezza del paragrafo precedente
        const prevLength = prevParag.text.length;

        // 2. Crea una copia aggiornata del libro
        const updatedBook = structuredClone(book);
        const sec = SECTION.getSection(updatedBook);
        if (!sec?.paragraphs?.[index] || !sec.paragraphs?.[index - 1]) {
          return console.error("Paragrafo non trovato");
        }

        // 3. Unisce il testo del paragrafo attuale a quello precedente
        sec.paragraphs[index - 1].text = prevParag.text + value;
        sec.paragraphs.splice(index, 1); // Rimuove il paragrafo attuale

        // 4. Aggiorna lo stato
        setBook(updatedBook);

        // 5. Sposta il cursore alla fine del paragrafo precedente
        setTimeout(() => {
          const prevElement = document.getElementById(`${index - 1}>${key}`) as HTMLTextAreaElement;
          if (!prevElement) return console.error("Elemento precedente non trovato");

          // Imposta il cursore alla fine del testo unito
          prevElement.setSelectionRange(prevLength, prevLength);
          prevElement.focus();

          // Salva su DB
          BookHook.updateBook(book_id, updatedBook, false);
        }, 10);

      }
    ],
    [
      e.key === "Delete" && key === "text",
      function CancText(){
        const target = e.target as HTMLTextAreaElement;
        // paragrafo vuoto: rimuove l'attuale paragrafo e si sposta in quello sotto
        if(value === "") {
          const targetParag = section?.paragraphs?.[index];
          if(!targetParag) return console.error("Paragrafo non trovato");
          PARAG.handleRemove(index, targetParag, true);
          // focus sul paragrafo successivo
          _changeFocus("this", "|__");
  
        // a fine paragrafo, sposta il valore del paragrafo successivo nell'attuale
        } else if(target.selectionEnd === value.length) {
          const cursorPosition = structuredClone(value.length)
          const nextParag = section?.paragraphs?.[index + 1];
          if(!nextParag) return console.error("Paragrafo successivo non trovato");
  
          const updatedBook = structuredClone(book);
          const sec = SECTION.getSection(updatedBook);
          if (!sec?.paragraphs?.[index]) return console.error("Paragrafo non trovato");
          
          sec.paragraphs[index].text = value + nextParag.text;
          sec.paragraphs.splice(index + 1, 1);
          setBook(updatedBook);
          
          // sposta cursore sull'indice 
          setTimeout(() => {
            target.setSelectionRange(cursorPosition, cursorPosition); 
            BookHook.updateBook(updatedBook.id, updatedBook);
          }, 10);
        }
      }
    ],
    [
      // verifica che il cursore sia esattamente all'inizio del testo
      (e.key === "ArrowLeft" || e.key ==="ArrowUp") 
      && key === "text" && textarea.selectionStart === 0,
      function ArrowLeft(){
        _changeFocus("up", "__|");
      }
    ],
    [
      // verifica che il cursore sia esattamente alla fine del testo
      (e.key === "ArrowRight" || e.key === "ArrowDown") 
      && key === "text" && textarea.selectionEnd === textarea.value.length,
      function ArrowRight(){
        _changeFocus("down", "|__");
      }
    ],
  ] as const;
  
  // ESECUZIONE
  const match = FEATURES.find(feature=> feature[0]);
  if(!match) return;
  match[1]();    
}