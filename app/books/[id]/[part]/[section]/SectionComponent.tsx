"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { safeParse, value } from "valibot";
import { book_schema, Book, Paragraph, Section, paragraph_schema, section_schema } from "@/app/schemas/book_schema";
import { useBooks } from "@/app/data/BookContext";
import { useEditMode } from "@/app/data/EditModeContext";
import { useAgreeWrapper } from "@/app/shareds/Agree";
import { toast } from "@/app/tools/feedbacksUI";
import SectionTemplate from "./SectionTemplate";


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
  const bookContext = useBooks();
  const agree = useAgreeWrapper();
  const { isEditMode, isPageLoaded } = useEditMode();
  const [book, setBook] = useState<Book | undefined>(undefined);
  
  useEffect(() => {
    if (isNaN(book_id)) return;
    const foundBook = bookContext.getBookById(book_id);
    setBook(foundBook);
  }, [book_id, bookContext.getBookById]);

  
  // 2) SEZIONE
  const [sectionFeat_title, sectionFeat_setTitle] = useState(section_title);

  // sicronizza con l'url
  useEffect(()=>{ sectionFeat_setTitle(section_title) }, [section_title]);

  const sectionFeat ={
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
          (s) => s.title.toLowerCase() === sectionFeat_title.toLowerCase()
        ) ??
        foundPart?.sections.find(
          (s) => s.title.toLowerCase() === section_title.toLowerCase()
        )
      );
      if(!result) return undefined;
      if(!result.paragraphs) result.paragraphs = [];
      
      return result;
    }, [book, part_title, section_title, sectionFeat_title]),

    // cambia il titolo della sezione
    handleChange(value: string) {      
      if (!book) return console.error("Libro non disponibile");
      
      sectionFeat_setTitle(value);
    },
   
    // esegue cambio di rotta
    handleSubmit(e: React.FormEvent) {
      e.preventDefault();
  
      const trimmed = sectionFeat_title.trim();
      if (!book || !trimmed || trimmed === section_title) {
        throw new Error("Titolo non modificato");
      }
  
      const updated = structuredClone(book);
      const sec = sectionFeat.getSection(updated);
      if (!sec) {
        throw new Error("Sezione non trovata");
      }
  
      sec.title = trimmed;  
      setBook(updated);
      const newBook = bookContext.updateBook(book_id, updated, false);
  
      // redirect alla nuova URL della sezione
      if(!newBook) return toast.danger("Titolo non valido");
      const _part = part_title.replaceAll(" ", "-");
      const _title = trimmed.replaceAll(" ", "-");
      router.push(`/books/${book_id}/${_part}/${_title}`);
    },
  }
  

  // 4) PARAGRAFI
  const paragraphFeat = {
    handleCreate(index?: number |'top') {
      if (!book) return console.error("Libro non disponibile");
        
      const updated = structuredClone(book);
      const sec = sectionFeat.getSection(updated);
  
      if (!sec) return;
  
      const newParagraph: Paragraph = {
        ex_style: "",
        in_style: "",
        pre_text: "",
        text: "",
      };

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
  
      setBook(updated);
      toast.success("Paragrafo aggiunto");
    },
  
    async handleRemove(index: number, paragraph: Paragraph) {
      if (paragraph.text.length && !(await agree.danger(
          `Rimuovere il paragrafo "${paragraph.text}"?`,"Rimuovi"))
      ) return;
  
      if (!book) {
        throw new Error("Book not found");
      }
  
      const updated = structuredClone(book);
      const sec = sectionFeat.getSection(updated);

      if (!sec) {
        throw new Error("Section not found");
      }

      if (!sec.paragraphs) sec.paragraphs = [];
      sec.paragraphs.splice(index, 1);
      
      bookContext.updateBook(book_id, updated);
      
      setBook(updated);
      toast.success("Paragrafo rimosso");
    },
  
    handleChange(index: number, key: keyof Paragraph, value: string) {
      if (!book) return;
  
      const updated = structuredClone(book);
      const sec = sectionFeat.getSection(updated);
  
      if (!sec?.paragraphs || !sec.paragraphs[index]) {
        console.error("Paragrafo non trovato");
        return;
      }
  
      sec.paragraphs[index][key] = value || "";
  
      setBook(updated);
      bookContext.updateBook(book_id, updated, false);
    },
  }

  // 4) aggiunge dinamicamente glierrori dei paragrafi non validi
  const errors = useMemo(()=>{
    if(!isEditMode) return {};

    // 1) validazione paragrafi
    let result: Record<string, string> = {};
    sectionFeat.bookSection?.paragraphs?.forEach((p, index)=>{
      const validatedParagraph = safeParse(paragraph_schema, p);
      if (!validatedParagraph.success) 
        // inserire un campo d'errore
        validatedParagraph.issues.forEach((valibotMessage)=>{
          const [key, message] =valibotMessage.message.split(": ");
          result[index+">"+key] = message;
        }) 
    })
    // 2) sezione
    const validatedSection = safeParse(section_schema, sectionFeat.bookSection);   
    if (!validatedSection.success) {
      validatedSection.issues.forEach((valibotMessage)=>{
        const [key, message] =valibotMessage.message.split(": ");
        result["section>"+key] = message;
      })
    }
    return result;
  }, [book])

  return {
    // stato
    book,
    errors,
    
    // contesto
    isEditMode,
    isPageLoaded,
    
    // informazioni sezione
    book_id,
    section_title,
    
    // titolo
    sectionFeat_title,
    sectionFeat,

    // paragrafi
    paragraphFeat,
  };
}

