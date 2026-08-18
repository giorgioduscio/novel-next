"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { safeParse } from "valibot";
import { Book, Paragraph, Section, paragraph_schema, section_schema } from "@/app/schemas/book_schema";
import useCommonPagesHook from "@/app/data/useCommonPagesHook";
import { useAgreeWrapper } from "@/app/shareds/Agree";
import { debounce, toast } from "@/app/tools/feedbacksUI";
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
    getSection(bookObj: Book) :Section | undefined {
      return bookObj.parts
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
  
      const updated = structuredClone(book);
      const sec = SECTION.getSection(updated);
      if (!sec) {
        throw new Error("Sezione non trovata");
      }
  
      sec.title = trimmed;  
      setBook(updated);
      // api
      const newBook = BookHook.updateBook(book_id, updated, false);
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

        // 4. **SOSTITUISCI** la sezione nel clone con quella incollata
        // (Assumendo che SECTION.getSection restituisca un riferimento alla sezione nel clone)
        section.paragraphs = newSection.paragraphs;
        // Object.assign(section, newSection); // Sovrascrive le proprietà della sezione esistente
        // Oppure, se vuoi sostituire completamente la sezione:
        // SECTION.setSection(clone, newSection); // (Dipende dalla tua implementazione di SECTION)

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
  const styleInputState = useBracket({
    index:-1, isVisible:false, 
  });

  const PARAG = {
    // aggiorna paragrafo e salva
    set(index:number, newValue:Partial<Paragraph>){
      const clone = structuredClone(book!);
      const sec = SECTION.getSection(clone);
      if (!sec || !sec.paragraphs?.length) return;
      // aggiornamento stato
      sec.paragraphs[index] = {...sec.paragraphs[index], ...newValue};
      setBook(clone);
      // aggiornamento backend e feedback
      const res = BookHook.updateBook(book_id, clone)
      if(!res) return toast.danger("Errore nel salvataggio");
      toast.success("Paragrafo salvato con successo!");
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

    // modifica un paragrafo
    handleChange(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
      // 1) dati e controlli
      if (!book) return console.error("Libro non disponibile");
      e.preventDefault();
      const {value, id} = e.currentTarget;
      const [_index, key] = id.split(">") as [string, keyof Paragraph];
      const index = parseInt(_index)
      if(isNaN(index) || !key) return console.error("Parametri non validi");

      // 2) recupera posizione paragrafo
      const updated = structuredClone(book);
      const sec = SECTION.getSection(updated);
      if (!sec?.paragraphs || !sec.paragraphs[index]) {
        console.error("Paragrafo non trovato");
        return;
      }
      
      // 3) stato locale
      const [defaultValue, styleValue] = value.replaceAll("\n", "").trim().split(",,");
      const newValue = (key==="in_style") ?defaultValue.toLowerCase() :defaultValue;

      sec.paragraphs[index][key] = newValue;
      if(styleValue && styleValue.length && key==="text") {
        sec.paragraphs[index].in_style = styleValue.toLowerCase();
      }

      setBook(updated); // fix: il valore della textarea prende ',,'
      // 4) salva su db
      const res = BookHook.updateBook(book_id, updated, false);
      // feedback
      if (!res) console.error("Errore nel salvataggio");
      toast.success("Paragrafo modificato");
    },

    // gestisce alcune funzionalità speciali (es. Enter, Tab)
    handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>){
      if(!book) return console.error("libro non disponibile");
      return keyboardFeatures(book_id, e, book, setBook, SECTION, PARAG, BookHook)
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
    styleInput: styleInputState(),
    setStyleInput(paragraph_i?:number){
      if(!page.isEditMode) return;
            
      // RESET
      if (paragraph_i === undefined){
        styleInputState(prev=> ({ 
          ...prev,
          isVisible: false,
          index: -1,
        }));
        return;
      }
      // cerca paragrafo
      const target = SECTION.bookSection?.paragraphs?.[paragraph_i];
      if (!target) return console.error("Paragrafo non trovato");
      
      styleInputState(prev=> ({ 
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

  return {
    book,
    errors,
    page,
    book_id,
    section_title,
    SECTION_title,
    SECTION,
    PARAG,
  };
}


