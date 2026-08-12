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
  }
  

  // 4) PARAGRAFI
  const [_bottomInput, _setBottomInput] = useState({
    value:"", index:-1, isVisible:false,
  });
  const PARAG = {
    // crea nuovo paragrafo senza salvarlo
    handleCreate(index?: number |'top') {
      if (!book) return console.error("Libro non disponibile");
        
      const updated = structuredClone(book);
      const sec = SECTION.getSection(updated);
      if (!sec) return console.error("Sezione non trovata");
  
      const newParagraph: Paragraph = { in_style: "", text: "" };
      if (!sec.paragraphs) sec.paragraphs = [];

      // stringa TOP -> aggiungi in cima
      if(index ==="top") {
        sec.paragraphs.unshift(newParagraph);

      } else if (index === undefined) {
        // Nessun indice -> aggiungi in fondo
        sec.paragraphs.push(newParagraph);

      } else {
        // Inserisce dopo l'indice
        sec.paragraphs.splice(index + 1, 0, newParagraph);
      }
  
      // aggiorna lo stato
      setBook(updated);
      // feedback
      toast.success("Paragrafo aggiunto");
    },

    // modifica un paragrafo
    handleChange(index: number, key: keyof Paragraph, value: string) {
      if (!book) return console.error("Libro non disponibile");
  
      const updated = structuredClone(book);
      const sec = SECTION.getSection(updated);
      if (!sec?.paragraphs || !sec.paragraphs[index]) {
        console.error("Paragrafo non trovato");
        return;
      }
  
      // stato locale
      sec.paragraphs[index][key] = value || "";
      setBook(updated);
      // salva su db
      const res = BookHook.updateBook(book_id, updated, false);
      // feedback
      if (!res) console.error("Errore nel salvataggio");
      toast.success("Paragrafo modificato");
    },

    // recupera le classi che cominciano per 'ex:'
    getExternalStyle(paragraph: Paragraph) {
      // divide le classi
      const classes = paragraph.in_style
        ?.replace(/\n/g, " ")
        .split(" ") || [];
      // recupera solo quelle che cominciano per 'ex:'
      const filtered = classes.filter(cls => cls.startsWith("ex:"));
      return filtered.join(" ") .replaceAll("ex:", "");
    },

    // form in basso
    bottomInput: useMemo (()=> _bottomInput, [_bottomInput]),
    setBottomInput(paragraph_i:number | null){
      if(!page.isEditMode) return;
      
      // RESET
      if (paragraph_i === null){
        _setBottomInput({
          isVisible: false,
          value: "", 
          index: -1,
        });
        return;
      }
      // cerca paragrafo
      const target = SECTION.bookSection?.paragraphs?.[paragraph_i];
      if (!target) return console.error("Paragrafo non trovato");
      
      _setBottomInput({ 
        isVisible: true,
        value: target.in_style || "",
        index: paragraph_i,
      });
    },


    async handleRemove(index: number, paragraph: Paragraph) {
      if (paragraph.text.length && !(await agree.danger(
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


