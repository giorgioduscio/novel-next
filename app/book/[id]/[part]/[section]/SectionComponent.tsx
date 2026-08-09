"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { safeParse, value } from "valibot";
import { book_schema, Book, Paragraph } from "@/app/schemas/book_schema";
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

export function useSectionComponent({
  book_id,  part_title,  section_title,
}: UseSectionComponentProps) {
  
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

  
  // 2) ERRORI
  const [errors, setErrors] = useState<Record<string, string>>({});
  function toggleErrors(key: string, bookParam: unknown) {
    const validatedBook = safeParse(book_schema, bookParam);

    if (!validatedBook.success) {
      setErrors((prev) => ({
        ...prev,
        [key]: validatedBook.issues[0].message,
      }));
      toast.danger("Errore di validazione");
      return null;
    }

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[key];
      return newErrors;
    });

    return validatedBook.output;
  }
  
  // 3) SEZIONE
  const [sectionFeat_title, sectionFeat_setTitle] = useState(section_title);

  // sicronizza con l'url
  useEffect(()=>{ sectionFeat_setTitle(section_title) }, [section_title]);

  const sectionFeat ={
    
    getSection(bookObj: Book) {
      return bookObj.parts
        ?.find((p) => p.title.toLowerCase() === part_title.toLowerCase())
        ?.sections.find((s) => s.title.toLowerCase() === section_title.toLowerCase());
    },


    bookSection: useMemo(() => {
      if (!book?.parts) return undefined;

      const foundPart = book.parts.find((p) =>
        p.title.toLowerCase() === part_title.toLowerCase()
      );

      return (
        foundPart?.sections.find(
          (s) => s.title.toLowerCase() === sectionFeat_title.toLowerCase()
        ) ??
        foundPart?.sections.find(
          (s) => s.title.toLowerCase() === section_title.toLowerCase()
        )
      );
    }, [book, part_title, section_title, sectionFeat_title]),

    handleChange(value: string) {
      sectionFeat_setTitle(value);
  
      if (!book) return;
  
      const updated = structuredClone(book);
      const sec = this.getSection(updated);
  
      if (!sec) return;
  
      sec.title = value;
  
      toggleErrors("section_title", updated);
    },
   
    handleSubmit(e: React.FormEvent) {
      e.preventDefault();
  
      const trimmed = sectionFeat_title.trim();
  
      if (!book || !trimmed || trimmed === section_title) {
        throw new Error("Titolo non modificato");
      }
  
      const updated = structuredClone(book);
      const sec = this.getSection(updated);
  
      if (!sec) {
        throw new Error("Sezione non trovata");
      }
  
      sec.title = trimmed;
  
      const validatedBook = toggleErrors("section_title", updated);
      if (!validatedBook) return;
  
      bookContext.updateBook(
        book_id,
        validatedBook
      );
  
      setBook(validatedBook);
  
      // redirect alla nuova URL della sezione
      const _part = part_title.replaceAll(" ", "-");
      const _title = trimmed.replaceAll(" ", "-");
      router.push(`/book/${book_id}/${_part}/${_title}`);
    },
  }
  

  // 4) PARAGRAFI
  const paragraphFeat = {
    handleCreate(index?: number) {
      if (!book) return;
  
      const updated = structuredClone(book);
      const sec = sectionFeat.getSection(updated);
  
      if (!sec) return;
  
      const newParagraph = {
        ex_style: "",
        in_style: "",
        style: "",
        pre_text: "",
        text: "",
      } as Paragraph;
  
      // Nessun indice -> aggiungi in fondo
      if (index === undefined) {
        sec.paragraphs.push(newParagraph);
      } else {
        // Inserisce dopo l'indice
        sec.paragraphs.splice(
          index + 1,
          0,
          newParagraph
        );
      }
  
      setBook(updated);
  
      toast.success("Paragrafo aggiunto");
    },
  
    async handleRemove(
      index: number,
      paragraph: Paragraph
    ) {
      if (
        paragraph.text.length &&
        !(await agree.danger(
          `Rimuovere il paragrafo "${paragraph.text}"?`,
          "Rimuovi"
        ))
      ) {
        return;
      }
  
      if (!book) {
        throw new Error("Book not found");
      }
  
      const updated = structuredClone(book);
      const sec = sectionFeat.getSection(updated);
  
      if (!sec) {
        throw new Error("Section not found");
      }
  
      sec.paragraphs.splice(index, 1);
  
      setBook(updated);
  
      bookContext.updateBook(
        book_id,
        updated
      );
  
      toast.success("Paragrafo rimosso");
    },
  
    handleChange(
      index: number,
      key: keyof Paragraph,
      value: string
    ) {
      if (!book) return;
  
      const updated = structuredClone(book);
      const sec = sectionFeat.getSection(updated);
  
      if (!sec?.paragraphs[index]) {
        console.error("Paragrafo non trovato");
        return;
      }
  
      sec.paragraphs[index][key] = value || "";
  
      setBook(updated);
  
      const errorKey = `${index}>${key}`;
  
      const validatedBook = toggleErrors(
        errorKey,
        updated
      );
  
      if (!validatedBook) return;
  
      bookContext.updateBook(
        book_id,
        validatedBook,
        false
      );
    },
  }


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
