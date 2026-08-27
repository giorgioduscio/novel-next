import { useBookContext } from "@/app/data/BookContext";
import { useCommonPagesContext } from "@/app/data/CommonPagesContext";
import { Book, Section, Paragraph, paragraph_schema, section_schema } from "@/app/schemas/book_schema";
import { useAgreeWrapper } from "@/app/shareds/Agree";
import { useBracket, useDot } from "@/app/tools/customStates";
import { toast } from "@/app/tools/feedbacksUI";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useRef } from "react";
import { safeParse } from "valibot";
import { useKeyboardFeatures } from "./keyboardFeatures";
import { useAuthContext } from "@/app/data/AuthContext";

export interface UseSectionComponentProps {
  book_id: string;
  part_title: string;
  section_title: string;
}

export function useSectionComponent({ book_id, part_title, section_title }: UseSectionComponentProps) {
  // 1) DATI PRINCIPALI
  const router = useRouter();
  const bookContext = useBookContext();
  const agree = useAgreeWrapper();
  const page = useCommonPagesContext();
  const [book, setBook] = useState<Book | undefined>(undefined);
  const authContext = useAuthContext()

  // autorizzazioni
  const canRead =useMemo(()=> 
    !!book && !!authContext.CONTROLS.canRead(book)
  , [book, authContext])
  
  const canWrite =useMemo(()=> 
    !!book && !!authContext.CONTROLS.canWrite(book) && page.isEditMode
  , [book, authContext, page])
  
  
  useEffect(() => {
    const foundBook = bookContext.getBookById(book_id);
    setBook(foundBook);
    bookContext.setTarget(foundBook);
  }, [book_id, bookContext.getBookById, bookContext.setTarget]);

  // restituisce la sezione corrente in base al libro
  function getSection(bookObj = book) :Section | undefined {
    return bookObj?.parts
      ?.find((p) => p.title.toLowerCase() === part_title.toLowerCase())
      ?.sections.find((s) => s.title.toLowerCase() === section_title.toLowerCase());
  };

  // 2) SEZIONE
  const [SECTION_title, SECTION_setTitle] = useState(section_title);
  const SECTION = {

    /* Restituisce la sezione corrente
    * title
    * paragraphs [
      * text 
      * in_style (con tutte le classi)
      * ex_style (solo le classi che cominciano per 'ex:')
      ] 
    */ 
    bookSection: useMemo(() :Section |undefined => {
      const result = getSection();
      if (!result) return undefined;
      if (!result.paragraphs) result.paragraphs = [];
      
      // recupera solo le classi che cominciano per 'ex:'
      for (const paragraph of result.paragraphs){
        (paragraph as any).ex_style = paragraph.in_style?.split(" ") 
          .filter(cls => cls.startsWith("ex:"))
          .join(" ") .replaceAll("ex:", "");
      }
      
      return result;
    }, [book, part_title, SECTION_title]),

    // Numero di parole nella sezione
    words: useMemo(() :number => {
      const section = getSection();
      return section?.paragraphs?.reduce((acc, p) => acc + p.text.length, 0) || 0;
    }, [book, SECTION_title]),

    // Cambia il titolo della sezione
    handleChange(value: string) {
      SECTION_setTitle(value);
    },

    // Esegue cambio di rotta
    handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      const trimmed = SECTION_title.trim();
      if (!book || !trimmed || trimmed === section_title) {
        throw new Error("Titolo non modificato");
      }

      const clone = structuredClone(book);
      const sec = getSection(clone);
      if (!sec) {
        throw new Error("Sezione non trovata");
      }

      sec.title = trimmed;
      setBook(clone);

      const newBook = bookContext.updateBook(book_id, clone, false);
      if (!newBook) return toast.danger("Titolo non valido");
      toast.success("Titolo aggiornato");

      setTimeout(() => {
        const _part = part_title.replaceAll(" ", "-");
        const _title = trimmed.replaceAll(" ", "-");
        router.push(`/books/${book_id}/${_part}/${_title}`);
      }, 1000);
    },

    // Aggiorna la nota della sezione
    updateNote(value: string) {
      if (!book) throw new Error("Libro non trovato");
      const clone = structuredClone(book);
      const sec = getSection(clone);
      if (!sec) throw new Error("Sezione non trovata");

      sec.note = value.trim();
      setBook(clone);

      const newBook = bookContext.updateBook(book_id, clone);
      if (!newBook) return toast.danger("Errore nell'aggiornamento della nota");
      toast.success("Nota sezione aggiornata");
    },

    // Premendo 'invio' o 'freccia giù' passa al primo paragrafo
    titleKeyDown(e: React.KeyboardEvent) {
      if (e.key === "ArrowDown") {
        const firstParagraph = document.getElementById("0>text");
        if (firstParagraph) firstParagraph.focus();
      }
    },

    // Copia nel sistema la struttura del libro
    async copy() {
      const section = getSection();
      if (!section) return console.error("Sezione non trovata");

      try {
        const serializedSection = JSON.stringify(section, null, 4);
        await navigator.clipboard.writeText(serializedSection);
        toast.success("Sezione copiata negli appunti!");
      } catch (err) {
        console.error("Errore nella copia:", err);
      }
    },

    // Incolla la struttura del libro dal sistema
    async paste() {
      try {
        const clone = structuredClone(book);
        if (!clone) return console.error("Libro non trovato");

        const section = getSection(clone);
        if (!section) return console.error("Sezione non trovata");
        if (
          section.paragraphs?.length &&
          !(await agree.warning(
            "Sei sicuro di voler sostituire i paragrafi precedenti?",
            "Incolla"
          ))
        )
          return;

        const serializedSection = await navigator.clipboard.readText();
        const newSection: Section = JSON.parse(serializedSection);
        if (!newSection || !newSection.paragraphs)
          return console.error("Sezione non valida");

        section.paragraphs = newSection.paragraphs;
        setBook(clone);

        const res = await bookContext.updateBook(book_id, clone);
        if (!res) return toast.danger("Errore nel salvataggio");

        toast.success("Sezione incollata con successo!");
      } catch (err) {
        console.error("Errore nell'incollaggio:", err);
        toast.danger("Errore nell'incollaggio");
      }
    },
  };
  
  // 4) PARAGRAFI
  const showParagraphs = useMemo(() => 
    !!SECTION.bookSection?.paragraphs?.length
  , [SECTION.bookSection]);

  const olRef = useRef<HTMLOListElement>(null);
  const [olHeight, setOlHeight] = useState<number>(0);

  // Inizializza ResizeObserver solo quando `showParagraphs` è true e `olRef.current` esiste
  useEffect(() => {
    if (!olRef.current || !showParagraphs) {
      setOlHeight(0);
      return;
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setOlHeight(entry.contentRect.height);
      }
    });

    observer.observe(olRef.current);

    // Misura immediatamente la dimensione corrente
    const { height } = olRef.current.getBoundingClientRect();
    setOlHeight(height);

    return () => {
      if (olRef.current) {
        observer.unobserve(olRef.current);
      }
    };
  }, [showParagraphs]);
  

  const PARAG = {

    // aggiorna paragrafo e salva
    update(index:number, key: keyof Paragraph, value:string, 
      options?:{addOnEnd?:boolean, noSafe?:boolean, replaceLastWord?:boolean}
    ){
      const clone = structuredClone(book!);
      const sec = getSection(clone);
      if (!sec || !sec.paragraphs?.length) return;

      // aggiornamento stato
      // una sola classe -> aggiunge il valore alla fine
      if(options?.addOnEnd) {
        sec.paragraphs[index][key] += " "+value;

      // una sola classe -> rinomina l'ultima parola
      }else if(options?.replaceLastWord) {
        const current = sec.paragraphs[index][key];
        const words = current.split(" ");
        const word = words[words.length - 1] 
        if(word.length <= 3) words[words.length - 1] = value;
        sec.paragraphs[index][key] = words.join(" ");

      // tutta e classi -> sostituisci tutto
      } else {
        sec.paragraphs[index][key] = value;
      }
      setBook(clone);
      
      // aggiornamento backend e feedback
      if(options?.noSafe) return;
      const res = bookContext.updateBook(book_id, clone)
      if(!res) return toast.danger("Errore di validazione");
      toast.success("Paragrafo salvato!");
    },

    // crea nuovo paragrafo senza salvarlo
    handleCreate(index?: number |'top', paragraphText="") {
      if (!book) return console.error("Libro non disponibile");
        
      const updated = structuredClone(book);
      const sec = getSection(updated);
      if (!sec) return console.error("Sezione non trovata");

      const newParagraph: Paragraph = { 
        id: bookContext.createId(),
        in_style: "", 
        text: paragraphText || "" 
      };
      if (!sec.paragraphs) sec.paragraphs = [];

      // stringa TOP -> aggiungi in cima
      if(index ==="top") {
        sec.paragraphs.unshift(newParagraph);

      // Nessun indice -> aggiungi in fondo
      } else if (index === undefined) {
        sec.paragraphs.push(newParagraph);

      // Inserisce dopo l'indice
      } else {
        sec.paragraphs.splice(index + 1, 0, newParagraph);
      }
  
      // aggiorna lo stato
      setBook(updated);
      // salvataggio condizionale
      if(paragraphText) bookContext.updateBook(book_id, updated, false);
      // feedback
      toast.success("Paragrafo aggiunto");
    },

    // gestisce alcune funzionalità speciali (es. Enter, Tab)
    handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>){
      if(!book) return console.error("libro non disponibile");
      
      // funzionalità da tastiera
      return handleKeyboardFeature(e);
    },

    // imposta il colore appropriato del testo
    parseStyle(paragraph:Paragraph) :string{
      // sfondo bianco
      if(paragraph.in_style?.includes("bg-white")){
        return paragraph.in_style + " text-black";
      }

      const backgroundPattern = /bg-[a-zA-Z]+-[0-9]+/; 
      const match = paragraph.in_style?.match(backgroundPattern);
      // non si specifica lo sfondo
      if(!match){
        return paragraph.in_style || "";
      }
      const gradiant = parseInt(match[0].split('-')[2] || "0");
      const textColor = gradiant <= 400 ?" text-black" :" text-white";
      
      return paragraph.in_style + textColor;
    },

    // input di stile
    styleInput: useBracket({
      index:-1, isVisible:false, 
    }),
    setStyleInput(paragraph_i?:number){
      if(!page.isEditMode) return;
            
      // RESET
      if (paragraph_i === undefined){
        this.styleInput(prev=> ({ 
          ...prev,
          isVisible: false,
          index: -1,
        }));
        return;
      }
      // cerca paragrafo
      const target = SECTION.bookSection?.paragraphs?.[paragraph_i];
      if (!target) return console.error("Paragrafo non trovato");
      
      this.styleInput(prev=> ({ 
        ...prev, 
        isVisible: true,
        index: paragraph_i,
      }));
    },

    // attraverso <main> chiude l'input di stile
    closeTemplateInputStyle(e: React.MouseEvent) {
      e.stopPropagation();
      const textarea = (e.target as HTMLElement).closest("textarea");
      const dropdown = (e.target as HTMLElement).closest("[data-dropdown]");
      if(!dropdown && !textarea) PARAG.setStyleInput()
    },

    // rimuove un paragrafo
    async handleRemove(index: number) {  
      if (!book) {
        throw new Error("Libro non disponibile");
      }
  
      const updated = structuredClone(book);
      const sec = getSection(updated);

      if (!sec) {
        throw new Error("Sezione non trovata");
      }
      // stato locale
      if (!sec.paragraphs) sec.paragraphs = [];
      sec.paragraphs.splice(index, 1);
      setBook(updated);
      
      // salva su db
      const res = bookContext.updateBook(book_id, updated);
      // feedback
      if (!res) return toast.danger("Errore nel salvataggio");
      toast.success("Paragrafo rimosso");
    },  
    
    // applica il focus sul testo del paragrafo
    handleFocusText(e: any) {
      if(!authContext.CONTROLS.canWrite(book!)) 
        return console.error("Permesso negato");
      
      // seleziona textarea del testo del paragrafo
      const element = e.target as HTMLElement;
      if(!element.hasAttribute("data-focus-text")) return;
      
      const isSelected = element.tagName === "TEXTAREA";
      const textarea = (
        isSelected 
          ? (element as HTMLTextAreaElement)
          : (element.querySelector('textarea[name*=">text"], textarea[id*=">text"]') as HTMLTextAreaElement)
            || (element.closest('li')?.querySelector('textarea[name*=">text"], textarea[id*=">text"]') as HTMLTextAreaElement)
            || (e.currentTarget?.querySelector?.('textarea[name*=">text"], textarea[id*=">text"]') as HTMLTextAreaElement)
      );
      
      if(!textarea) return console.error("Textarea non trovata");
      
      if(!page.isEditMode) page.toggleEditMode();
      
      setTimeout(() => {
        const targetTextarea = (document.getElementById(textarea.id) as HTMLTextAreaElement) || textarea;
        targetTextarea?.focus();
      }, 200);
    }
  }

  // 4) aggiunge dinamicamente glierrori dei paragrafi non validi
  const errors = useMemo(()=>{
    if(!page.isEditMode) return {};

    // 1) validazione paragrafi
    let result: Record<string, string> = {};
    getSection()?.paragraphs?.forEach((p, index)=>{
      const validatedParagraph = safeParse(paragraph_schema, p);
      if (!validatedParagraph.success) 
        // inserire un campo d'errore
        validatedParagraph.issues.forEach((valibotMessage)=>{
          const [key, message] =valibotMessage.message.split(": ");
          result[index+">"+key] = message;
        }) 
    })

    // 2) sezione
    const validatedSection = safeParse(section_schema, SECTION.bookSection);   
    if (!validatedSection.success) {
      validatedSection.issues.forEach((valibotMessage)=>{
        const [key, message] =valibotMessage.message.split(": ");
        result["section>"+key] = message;
      })
    }
    return result;
  }, [book])

  // 5) AUTOCOMPLETE PER STILI RIPETUTI
  const AUTOCOMPLETE = {
    standardStyles: useDot<string[]>([]),
    loadStandardStyles() {
      useEffect(() => {
        fetch("/Section.sass")
          .then(res => res.text())
          .then(text => {
            const styles = text
              .split("\n")
              .map(line => line.trim())
              .filter(line => line.startsWith("."))
              .map(line => line.split(/\s+/)[0].replace(/^\./, ""))
              .filter(Boolean);

            AUTOCOMPLETE.standardStyles.set(styles);
          })
          .catch(err => console.error("Errore caricamento SASS:", err));
      }, []);
    },

    usedStyles: useMemo(() => {
      const paragraphs = SECTION.bookSection?.paragraphs;
      if (!paragraphs) return [];
      return paragraphs
        .map(p => p.in_style?.trim() || "")
        .filter(Boolean);
    }, [SECTION.bookSection?.paragraphs]),


    // classi suggerite
    suggestions: useDot<string[]>([]),
    setSuggestions(e:React.ChangeEvent<HTMLTextAreaElement>){
      // 1) risorse
      const target =e.target as HTMLTextAreaElement
      if(!target.name.includes("style")) return;
      const inputValue = target.value;

      // classi dell'input
      const paragraphClasses =inputValue.toLowerCase().trim().split(" ");
      // classi usate
      const usedStyles :string[] = AUTOCOMPLETE.usedStyles.map(input=> input.split(" ")).flat()
      // unioni classi usate e standard
      const merged = [
        ...usedStyles,
        ...AUTOCOMPLETE.standardStyles.get(), 
      ];

      // 2) filtraggio
      // classi che assomigliano all'input
      const filtered = merged.filter(mergedStyle => // controlla ogni merge
        // almeno una classe del paragrafo
        paragraphClasses.some(paragraphClass=> 
          // il merge assomiglia all'input ma non è uguale
          mergedStyle.includes(paragraphClass)
          && mergedStyle !== paragraphClass
        )
      )

      // 3) aggiunge la classe ripetuta più simile
      const similInput = AUTOCOMPLETE.usedStyles.find(usedStyle=> 
        usedStyle.includes(inputValue) 
        && usedStyle !== inputValue
      ) || "";


      // 4) mostra 5 suggerimenti senza ripetizioni
      const result = [...new Set([similInput, ...filtered])]
        .filter(Boolean).splice(0, 5)
      
      AUTOCOMPLETE.suggestions.set(result)
    },

    handleClick(e:React.MouseEvent<HTMLButtonElement>, p:Paragraph, index:number){
      const newClass =(e.target as HTMLDivElement).innerText;
      const actualClasses =p.in_style.toLowerCase().split(" ");

      // aggiornamento
      const update = actualClasses.map((cls, _i)=> 
        newClass.includes(cls) ? newClass : cls
      ).join(" ");
      PARAG.update(index, "in_style", update)
      AUTOCOMPLETE.suggestions.set([]) 
    },

  };

  AUTOCOMPLETE.loadStandardStyles();

  // 5.5) KEYBOARD FEATURES
  const handleKeyboardFeature = useKeyboardFeatures(book_id, getSection, book, setBook, AUTOCOMPLETE, SECTION, PARAG);

  // 6) STORICO AZIONI
  const HISTORY = {
    undoStack: useDot<Paragraph[][]>([]),
    redoStack: useDot<Paragraph[][]>([]),

    // Salva lo stato attuale in undoStack e svuota redoStack
    saveState(paragraphs: Paragraph[]) {
      HISTORY.undoStack.set(prev => [...prev, structuredClone(paragraphs)]);
      // Svuota redoStack dopo una nuova azione
      HISTORY.redoStack.set([]); 
    },

    // torna allo stato precedente
    undo() {
      const undoStack = HISTORY.undoStack.get();
      if (undoStack.length <= 1) return; // Non c'è nulla da fare undo

      const currentState = undoStack[undoStack.length - 1];
      const previousState = undoStack[undoStack.length - 2];

      // Sposta lo stato attuale in redoStack
      HISTORY.redoStack.set(prev => [...prev, currentState]);

      // Rimuovi l'ultimo stato da undoStack
      HISTORY.undoStack.set(prev => prev.slice(0, -1));

      // Applica lo stato precedente
      const clone = structuredClone(book!);
      const sec = getSection(clone);
      if (!sec) return console.error("Sezione non trovata");

      sec.paragraphs = structuredClone(previousState);
      setBook(clone);
    },

    // torna allo stato successivo
    redo() {
      const redoStack = HISTORY.redoStack.get();
      if (redoStack.length === 0) return; // Non c'è nulla da fare redo

      const nextState = redoStack[redoStack.length - 1];

      // Sposta lo stato attuale in undoStack
      HISTORY.undoStack.set(prev => [...prev, structuredClone(nextState)]);

      // Rimuovi l'ultimo stato da redoStack
      HISTORY.redoStack.set(prev => prev.slice(0, -1));

      // Applica lo stato successivo
      const clone = structuredClone(book!);
      const sec = getSection(clone);
      if (!sec) return console.error("Sezione non trovata");

      sec.paragraphs = structuredClone(nextState);
      setBook(clone);
    },
    
    // salva i paragrafi ogni volta che book cambia
    onChangeBook() {
      useEffect(() => {
        if (!book) return;
        const sec = getSection(structuredClone(book));
        if (!sec) return console.error("Sezione non trovata");
    
        const paragraphs = sec.paragraphs;
        if (!paragraphs) return console.error("Paragrafi non trovati");
    
        // Salva solo se lo stato è diverso dall'ultimo in undoStack
        const lastState = HISTORY.undoStack.get()[HISTORY.undoStack.get().length - 1];
        if (!lastState || JSON.stringify(lastState) !== JSON.stringify(paragraphs)) {
          HISTORY.saveState(paragraphs);
        }
      }, [book])
    }
  };
  HISTORY.onChangeBook();


  return {
    book,
    errors,
    page,
    book_id,
    section_title,
    SECTION_title,
    SECTION,
    PARAG,
    showParagraphs,
    AUTOCOMPLETE,
    HISTORY, 
    canRead, canWrite,
    olRef, olHeight
  };
}