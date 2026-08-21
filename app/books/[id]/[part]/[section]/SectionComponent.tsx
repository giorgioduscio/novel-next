"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { safeParse } from "valibot";
import { Book, Paragraph, Section, paragraph_schema, section_schema } from "@/app/schemas/book_schema";
import useCommonPagesHook from "@/app/data/useCommonPagesHook";
import { useAgreeWrapper } from "@/app/shareds/Agree";
import { toast } from "@/app/tools/feedbacksUI";
import SectionTemplate from "./SectionTemplate";
import useBookHook from "@/app/data/useBookHook";
import { keyboardFeatures } from "./keyboardFeatures";
import { useBracket, useDot } from "@/app/tools/customStates";

export default function SectionComponent(props: UseSectionComponentProps) {
  const hookData = useSectionComponent(props);
  return <SectionTemplate {...hookData} />;
}


interface UseSectionComponentProps {
  book_id: number;
  part_title: string;
  section_title: string;
}

export function useSectionComponent({ book_id, part_title, section_title }: UseSectionComponentProps) {
  
  // 1) DATI PRINCIPALI
  const router = useRouter();
  const BookHook = useBookHook();
  const agree = useAgreeWrapper();
  const page = useCommonPagesHook();
  const [book, setBook] = useState<Book | undefined>(undefined);
  
  useEffect(() => {
    if (isNaN(book_id)) return;
    const foundBook = BookHook.getBookById(book_id);
    setBook(foundBook);
  }, [book_id, BookHook.getBookById]);

  
  // 2) SEZIONE
  const [SECTION_title, SECTION_setTitle] = useState(section_title);

  // sicronizza con l'url
  useEffect(()=>{ SECTION_setTitle(section_title) }, [section_title]);

  const SECTION ={
    // restituisce la sezione corrente in base al libro
    getSection(bookObj = book) :Section | undefined {
      return bookObj?.parts
        ?.find((p) => p.title.toLowerCase() === part_title.toLowerCase())
        ?.sections.find((s) => s.title.toLowerCase() === section_title.toLowerCase());
    },

    // restituisce la sezione corrente
    bookSection: useMemo(() => {
      if (!book?.parts) return undefined;

      let result :Section | undefined = undefined;
      const foundPart = book.parts.find((p) =>
        p.title.toLowerCase() === part_title.toLowerCase()
      );

      result = (
        foundPart?.sections.find(
          (s) => s.title.toLowerCase() === SECTION_title.toLowerCase()
        ) ??
        foundPart?.sections.find(
          (s) => s.title.toLowerCase() === section_title.toLowerCase()
        )
      );
      if(!result) return undefined;
      if(!result.paragraphs) result.paragraphs = [];
            
      return result;
    }, [book, part_title, section_title, SECTION_title]),

    // cambia il titolo della sezione
    handleChange(value: string) {      
      SECTION_setTitle(value);
    },
   
    // esegue cambio di rotta
    handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      // stato
      const trimmed = SECTION_title.trim();
      if (!book || !trimmed || trimmed === section_title) {
        throw new Error("Titolo non modificato");
      }
  
      const clone = structuredClone(book);
      const sec = SECTION.getSection(clone);
      if (!sec) {
        throw new Error("Sezione non trovata");
      }
  
      sec.title = trimmed;  
      setBook(clone);
      // api
      const newBook = BookHook.updateBook(book_id, clone, false);
      // feedback
      if(!newBook) return toast.danger("Titolo non valido");
      toast.success("Titolo aggiornato");
  
      // redirect alla nuova URL della sezione
      const _part = part_title.replaceAll(" ", "-");
      const _title = trimmed.replaceAll(" ", "-");
      router.push(`/books/${book_id}/${_part}/${_title}`);
    },

    // premendo 'invio' o 'freccia giù' passa al primo paragrafo
    titleKeyDown(e: React.KeyboardEvent) {
      if (e.key === "Enter" || e.key==="ArrowDown") {
        e.preventDefault();
        const firstParagraph = document.getElementById("0>text");
        if(firstParagraph) firstParagraph.focus();
      }
    },

    // copia nel sistema la struttura del libro
    async copy() {
      const section = SECTION.bookSection;
      if (!section) return console.error("Sezione non trovata");

      try {
        // Serializza la sezione in JSON
        const serializedSection = JSON.stringify(section);
        // Copia negli appunti di sistema
        await navigator.clipboard.writeText(serializedSection);
        toast.success("Sezione copiata negli appunti!");
        
      } catch (err) {
        console.error("Errore nella copia:", err);
      }
    },

    // incolla la struttura del libro dal sistema
    async paste() {
      try {
        // 1. Crea una copia profonda del libro
        const clone = structuredClone(book);
        if (!clone) return console.error("Libro non trovato");

        // 2. Ottieni la sezione da sostituire
        const section = SECTION.getSection(clone);
        if (!section) return console.error("Sezione non trovata");
        if(section.paragraphs?.length && 
          !(await agree.warning("Sei sicuro di voler sostituire i paragrafi precedenti?", "Incolla"))) return;

        // 3. Leggi il testo dagli appunti e deserializza
        const serializedSection = await navigator.clipboard.readText();
        const newSection :Section = JSON.parse(serializedSection);
        if(!newSection || !newSection.paragraphs) return console.error("Sezione non valida");

        // 4. sostituisci la sezione nel clone con quella incollata
        section.paragraphs = newSection.paragraphs;

        // 5. Aggiorna lo stato globale       
        setBook(clone);

        // 6. Salva le modifiche sul backend
        const res = await BookHook.updateBook(book_id, clone);
        if (!res) return toast.danger("Errore nel salvataggio");

        toast.success("Sezione incollata con successo!");
      } catch (err) {
        console.error("Errore nell'incollaggio:", err);
        toast.danger("Errore nell'incollaggio");
      }
    }    
  }
  
  // 4) PARAGRAFI
  const PARAG = {
    // aggiorna paragrafo e salva
    update(index:number, key: keyof Paragraph, value:string, reemplazar =true){
      const clone = structuredClone(book!);
      const sec = SECTION.getSection(clone);
      if (!sec || !sec.paragraphs?.length) return;

      // aggiornamento stato
      if(reemplazar) sec.paragraphs[index][key] = value;
      else sec.paragraphs[index][key] += " "+value;
      setBook(clone);
      // aggiornamento backend e feedback
      const res = BookHook.updateBook(book_id, clone)
      if(!res) return toast.danger("Errore di validazione");
      toast.success("Paragrafo salvato!");
    },

    // crea nuovo paragrafo senza salvarlo
    handleCreate(index?: number |'top', paragraphText="") {
      if (!book) return console.error("Libro non disponibile");
        
      const updated = structuredClone(book);
      const sec = SECTION.getSection(updated);
      if (!sec) return console.error("Sezione non trovata");

      const newParagraph: Paragraph = { in_style: "", text: paragraphText || "" };
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
      if(paragraphText) BookHook.updateBook(book_id, updated, false);
      // feedback
      toast.success("Paragrafo aggiunto");
    },

    // gestisce alcune funzionalità speciali (es. Enter, Tab)
    handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>){
      if(!book) return console.error("libro non disponibile");
      return keyboardFeatures(book_id, e, book, setBook, AUTOCOMPLETE, SECTION, PARAG, BookHook)
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

    // recupera le classi che cominciano per 'ex:'
    getExternalStyle(paragraph: Paragraph) {
      // divide le classi
      const classes = paragraph.in_style?.split(" ") || [];
      // recupera solo quelle che cominciano per 'ex:'
      const filtered = classes.filter(cls => cls.startsWith("ex:"));
      return filtered.join(" ") .replaceAll("ex:", "");
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

    closeTemplateInputStyle(e: React.MouseEvent) {
      e.stopPropagation();
      const textarea = (e.target as HTMLElement).closest("textarea");
      const dropdown = (e.target as HTMLElement).closest("[data-dropdown]");
      if(!dropdown && !textarea) PARAG.setStyleInput()
    },


    async handleRemove(index: number, paragraph: Paragraph, skipCpnfirm = false) {
      if (paragraph.text.length && !skipCpnfirm && !(await agree.danger(
          `Rimuovere il paragrafo "${paragraph.text}"?`,"Rimuovi"))
      ) return;
  
      if (!book) {
        throw new Error("Libro non disponibile");
      }
  
      const updated = structuredClone(book);
      const sec = SECTION.getSection(updated);

      if (!sec) {
        throw new Error("Sezione non trovata");
      }
      // stato locale
      if (!sec.paragraphs) sec.paragraphs = [];
      sec.paragraphs.splice(index, 1);
      setBook(updated);
      
      // salva su db
      const res = BookHook.updateBook(book_id, updated);
      // feedback
      if (!res) return toast.danger("Errore nel salvataggio");
      toast.success("Paragrafo rimosso");
    },  
  }

  // 4) aggiunge dinamicamente glierrori dei paragrafi non validi
  const errors = useMemo(()=>{
    if(!page.isEditMode) return {};

    // 1) validazione paragrafi
    let result: Record<string, string> = {};
    SECTION.bookSection?.paragraphs?.forEach((p, index)=>{
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
    usedStyles: useMemo(() => {
      const paragraphs = SECTION.bookSection?.paragraphs;
      if (!paragraphs) return [];
      return paragraphs
        .map(p => p.in_style?.trim() || "")
        .filter(Boolean);
    }, [SECTION.bookSection?.paragraphs]),

    loadSuggestedstyles() {
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

    values: useMemo( () => 
      (paragraphIndex: number) => {
        const paragraphs = SECTION.bookSection?.paragraphs;
        const paragraph = paragraphs?.[paragraphIndex];
        if(! paragraphs || !paragraph) return [];

        const standardColor = "bg-orange-200"
        const repeatColor = "bg-indigo-200"
        const input = (paragraph.in_style || "").trim().toLowerCase();

        // Stili standard + stili già utilizzati
        let allStyles: string[] = [
          ...AUTOCOMPLETE.standardStyles.get(),
          ...AUTOCOMPLETE.usedStyles,
        ];

        // Elimina duplicati
        const uniqueStyles = [...new Set(allStyles)];

        // Filtra in base a ciò che l'utente ha digitato
        const result :{tailwindClass:string, color:string, handleClick:(i:number) => void}[] =[]; 

        uniqueStyles.forEach(style => {
          const tailwindClass = style.toLowerCase();
          // controlla se lo stile è uno standard
          const isStandarsClass = AUTOCOMPLETE.standardStyles.get().includes(style);
          
          const color = isStandarsClass ? standardColor : repeatColor;
          function handleClick(i:number){ 
            PARAG.update(i, "in_style", tailwindClass, !isStandarsClass)
          }

          // se l'inpun non iclude la classe -> mostra
          if (!input.includes(tailwindClass)){
            result.push({tailwindClass, color, handleClick});
          }
        });

        return result;
      },
      [
        SECTION.bookSection,
        SECTION.bookSection?.paragraphs,
      ]
    ),

    repeatingStyle(styleInput:string) :{label:string, value:string} {
      const voidResult = {label:"", value:""};
      const paragraphs = SECTION.bookSection?.paragraphs;
      if (!paragraphs || !paragraphs.length || !styleInput) return voidResult;

      // Estrai tutti gli stili (escludendo vuoti o null)
      const allStyles = paragraphs
        .map(p => p.in_style?.trim() || "")
        .filter(s => s !== "");

      // verifica quale degli stili inizia con l'input (autocomplete)
      const clone = styleInput.toLowerCase();
      const matches = allStyles.filter(style => 
        style.toLowerCase().startsWith(clone) && style.toLowerCase() !== clone
      );

      if(matches.length === 0) return voidResult;
      
      // Prendi il primo match o quello più comune
      const match = matches[0];    
      return {label: match?.substring(clone.length) || "", value: match || ""};
    }

  };

  AUTOCOMPLETE.loadSuggestedstyles();
  

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
      const sec = SECTION.getSection(clone);
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
      const sec = SECTION.getSection(clone);
      if (!sec) return console.error("Sezione non trovata");

      sec.paragraphs = structuredClone(nextState);
      setBook(clone);
    },
    
    // salva i paragrafi ogni volta che book cambia
    onChangeBook() {
      useEffect(() => {
        if (!book) return;
        const sec = SECTION.getSection(structuredClone(book));
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
    AUTOCOMPLETE,
    HISTORY
  };
}


