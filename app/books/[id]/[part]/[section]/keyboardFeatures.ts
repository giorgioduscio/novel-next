import { Book, Paragraph } from "@/app/schemas/book_schema";
import { useSectionComponent } from "./useSectionComponent";
import { useBookContext } from "@/app/data/BookContext";
import { useCallback } from "react";

type Main = ReturnType<typeof useSectionComponent>;

export function useKeyboardFeatures(getSection: Function, dependencies: Pick<Main, 'book' | 'SECTION' | 'PARAG' | 'AUTOCOMPLETE'>) {
  const bookContext = useBookContext();
  const { book, SECTION, PARAG, AUTOCOMPLETE } = dependencies;

  // CHANGEFOCUS helper per cambiare il focus
  function _changeFocus(direction: "up" | "down" | "this", from: "|__" | "__|" | number, index:number, key: keyof Paragraph ="text") {  
    const walk = direction === "up" ? -1 
                : direction === "down" ? 1 
                : 0;

    setTimeout(() => {
      const el = document.getElementById(`${index + walk}>${key}`) as HTMLTextAreaElement;
      if(!el) return console.error("Elemento non trovato");
      // comincia all'inizio della textarea
      if(from === "__|") el.setSelectionRange(el.value.length, el.value.length);
      else if(from === "|__") el.setSelectionRange(0, 0); 
      else el.setSelectionRange(from, from);
      el.focus();
    }, 10);
  }

  const handleKey = useCallback((
    e: React.KeyboardEvent<HTMLTextAreaElement>, 
    index: number,
    key: keyof Paragraph, 
    paragraph:Paragraph

  ) => {
    if (!book.get) return console.error("Libro non disponibile");

    // controllo iniziale
    const gesturesKeys = [
      "Enter", "Tab", "Backspace", "Delete",
      "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"
    ];
    if (!gesturesKeys.includes(e.key)) return;

    // 1) dati
    const { value, id } = e.target as HTMLTextAreaElement;
    if (isNaN(index) || !key) return console.error("Parametri non validi");

    const section = getSection(book.get);
    if (!section) return console.error("Sezione non trovata");
    const textarea = e.target as HTMLTextAreaElement;



    // FEATURES
    const FEATURES :[boolean, ()=> any][] =[
      [
        key === "in_style" && ["Enter","ArrowUp"].includes(e.key),
        function enterStyle(){
          e.preventDefault(); 

          PARAG.update(index, key, value.toLowerCase())

          if(e.key==="ArrowUp"){
            _changeFocus("this", "__|", index)  
          } 
        }
      ],
      [
        e.key==="ArrowDown" && key === "in_style"
        && textarea.selectionEnd === textarea.value.length,
        function autocompleteStyle(){
          e.preventDefault();

          const suggestion = AUTOCOMPLETE.suggestions;
          if(!suggestion.length) return console.error("Suggerimenti non trovati");
                    
          AUTOCOMPLETE.insertClass(index, suggestion[0]);
        }
      ],
      [
        e.key=== "Enter",
        function enterText(){
          e.preventDefault()
          // recupera tutto il testo prima e dopo il cursore
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          
          // se è all'inizio, crea un paragrafo prima
          if(start === 0) {
            PARAG.handleCreate(index-1);
            _changeFocus("this", "|__", index, "text");

          // se alla fine, crea un paragrafo dopo
          } else if (start === value.length) {
            PARAG.handleCreate(index);
            _changeFocus("down", "|__", index, "text");

          // se nel mezzo, l'attuale paragrafo ha valore prima del cursore
          // e ne crea un'altro con il valore dopo il cursore
          } else {
            // 1. Aggiorna il paragrafo corrente con `before`
            const updatedBook = structuredClone(book.get);
            const sec = getSection(updatedBook);
            if (!sec?.paragraphs?.[index]) return;

            const text_before = value.substring(0, start);
            const text_after = value.substring(end);

            // Aggiorna il testo corrente
            sec.paragraphs[index].text = text_before; 
            // inserisce il nuovo paragrafo dopo quello corrente
            sec.paragraphs.splice(index + 1, 0, { 
              id: bookContext.createId(),
              text: text_after, 
              in_style: sec.paragraphs[index].in_style || "", 
            } as Paragraph);
            
            book.set(updatedBook); // Aggiorna lo stato

            // 2. Crea un nuovo paragrafo con `after`
            setTimeout(() => {
              _changeFocus("down", "|__", index);
            }, 100);
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
          const updatedBook = structuredClone(book.get);
          if(!updatedBook) return console.error("Libro non trovato");
          
          const sec = getSection(updatedBook);
          if (!sec?.paragraphs?.[index] || !sec.paragraphs?.[index - 1]) {
            return console.error("Paragrafo non trovato");
          }

          // 3. Unisce il testo del paragrafo attuale a quello precedente
          sec.paragraphs[index - 1].text = prevParag.text + value;
          sec.paragraphs.splice(index, 1); // Rimuove il paragrafo attuale        

          // 4. Aggiorna lo stato
          book.set(updatedBook);

          // 5. Sposta il cursore alla fine del paragrafo precedente
          setTimeout(() => {
            const prevElement = document.getElementById(`${index - 1}>${key}`) as HTMLTextAreaElement;
            if (!prevElement) return console.error("Elemento precedente non trovato");

            // Imposta il cursore alla fine del testo unito
            prevElement.setSelectionRange(prevLength, prevLength);
            prevElement.focus();

            // Salva su DB
            bookContext.updateBook(updatedBook.id, updatedBook, false);
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
            PARAG.handleRemove(index);
            // focus sul paragrafo successivo
            _changeFocus("this", "|__", index);
  
          // a fine paragrafo, sposta il valore del paragrafo successivo nell'attuale
          } else if(target.selectionEnd === value.length) {
            const cursorPosition = structuredClone(value.length)
            const nextParag = section?.paragraphs?.[index + 1];
            if(!nextParag) return console.error("Paragrafo successivo non trovato");
  
            const updatedBook = structuredClone(book.get);
            if (!updatedBook) return console.error("Libro non trovato");
            const sec = getSection(updatedBook);
            if (!sec?.paragraphs?.[index]) return console.error("Paragrafo non trovato");
            
            sec.paragraphs[index].text = value + nextParag.text;
            sec.paragraphs.splice(index + 1, 1);
            book.set(updatedBook);
            
            // sposta cursore sull'indice 
            setTimeout(() => {
              target.setSelectionRange(cursorPosition, cursorPosition); 
              bookContext.updateBook(updatedBook.id, updatedBook);
            }, 10);
          }
        }
      ],
      [
        // verifica che il cursore sia esattamente all'inizio del testo
        e.key === "ArrowUp" && index === 0 
        && key === "text" && textarea.selectionStart === 0,
        function ArrowUp(){
          const title = document.getElementById("title") as HTMLInputElement;
          if(title) title.focus();
        }
      ],
      [
        // verifica che il cursore sia esattamente all'inizio del testo
        (e.key === "ArrowLeft" || e.key ==="ArrowUp") 
        && key === "text" && textarea.selectionStart === 0,
        function ArrowLeft(){
          _changeFocus("up", "__|", index);
        }
      ],
      [
        // verifica che il cursore sia esattamente alla fine del testo
        (e.key === "ArrowRight" || e.key === "ArrowDown") 
        && key === "text" && textarea.selectionEnd === textarea.value.length
        && SECTION.bookSection?.paragraphs !== undefined
        && index!==SECTION.bookSection?.paragraphs?.length - 1,
        function ArrowRight(){
          _changeFocus("down", "|__", index);
        }
      ],
    ] as const;
    
    // ESECUZIONE
    const match = FEATURES.find(feature=> feature[0]);
    if(!match) return;  
    match[1]();
  }, [book.get, getSection, SECTION, PARAG]);

  return handleKey;
}