"use client";

import React, { useEffect, useState } from "react";
import { safeParse } from "valibot";
import { book_schema, type Book } from "../../schemas/book_schema";
import { toast } from "@/app/tools/feedbacksUI";
import { useAgreeWrapper } from "@/app/shareds/Agree";
import BookTemplate from "./BookTemplate";
import useBookHook from "@/app/data/useBookHook";
import useCommonPagesHook from "@/app/data/useCommonPagesHook";

export default function BookComponent(props: UseBookComponentProps) {
  const hookData = useBookComponent(props);
  return <BookTemplate {...hookData} />;
}

interface UseBookComponentProps {
  id: number;
}

export function useBookComponent({ id }: UseBookComponentProps) {
  const [book, setBook] = useState<Book | undefined>(undefined);
  const page = useCommonPagesHook();
  const bookStore = useBookHook();
  const agree = useAgreeWrapper();

  useEffect(() => {
    if (!isNaN(id)) {
      const bookFromStore = bookStore.getBookById(id);
      setBook(bookFromStore ? structuredClone(bookFromStore) : undefined);
    }
  }, [id, bookStore.getBookById]);


  // 1) ERRORI
  const [errors, setErrors] = useState<Record<string, string>>({});
  function toggleErrors(key: string, bookParam: unknown) {
    // validazione fallita
    const validatedBook = safeParse(book_schema, bookParam);

    if (!validatedBook.success) {
      setErrors((prev) => ({ ...prev, [key]: validatedBook.issues[0].message }));
      toast.danger("Errore di validazione");

      return null;

      // validazione riuscita
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });

      return validatedBook.output;
    }
  }

  // 2) AGGIORNA LIBRO
  function handleUpdateBook(key: string, value: any) {
    if (!book) throw new Error("Libro non trovato");
    const newBook = { ...book };
    (newBook as any)[key] = value;

    // validazione
    const validatedBook = toggleErrors(key, newBook);
    if (!validatedBook) return;

    setBook(validatedBook);
    bookStore.updateBook(id, validatedBook);
  }

  // 3) PARTI
  const partFeat = {
    // aggiunge una parte vuota
    create() {
      if (!book) throw new Error("Libro non trovato");

      const newBook = { ...book, parts: [...(book.parts || [])] };
      if (!newBook.parts) newBook.parts = [];

      newBook.parts.push({
        title: "Parte" + Date.now(),
        sections: [
          {
            title: "Sezione" + Date.now(),
          },
        ],
      });

      const updatedBook = bookStore.updateBook(id, newBook);
      if (updatedBook) setBook(updatedBook);
      toast.success("Parte aggiunta");
    },

    // modifica il titolo della parte
    updateTitle(index: number, value: string) {
      if (!book) throw new Error("Libro non trovato");
      const newBook = { ...book, parts: [...(book.parts || [])] };
      (newBook.parts as any)[index].title = value;

      const errorKey = `part_title_${index}`;
      const validatedBook = toggleErrors(errorKey, newBook);
      if (!validatedBook) return;

      const updatedBook = bookStore.updateBook(id, validatedBook);
      if (updatedBook) setBook(updatedBook);
    },
  };

  // 4) SEZIONI
  const sectionFeat = {
    create(part_i: number, section_i: number) {
      if (!book) throw new Error("Libro non trovato");
      const newBook = structuredClone(book);
      
      // aggiunge una sezione vuota nella sezione selezionata
      if (!newBook.parts || newBook.parts.length === 0) newBook.parts = [];
      newBook.parts[part_i].sections.push({
        title: "Sezione" + Date.now(),
      });
      
      const updatedBook = bookStore.updateBook(id, newBook);
      if (updatedBook) setBook(updatedBook);
      toast.success("Sezione aggiunta");
    },

    writeHref(book_id: number, part: string, section: string) {
      part = part.replaceAll(" ", "-");
      section = section.replaceAll(" ", "-");
      return `/books/${book_id}/${part}/${section}`;
    },

    updateTitle(part_i: number, section_i: number, value: string) {
      if (!book) throw new Error("Libro non trovato");
      const newBook = { ...book, parts: [...(book.parts || [])] };
      (newBook.parts as any)[part_i].sections[section_i].title = value;

      const errorKey = `section_title_${value}`;
      const validatedBook = toggleErrors(errorKey, newBook);
      if (!validatedBook) return;

      const updatedBook = bookStore.updateBook(id, validatedBook);
      if (updatedBook) setBook(updatedBook);
    },

    async delete(part_i: number, section_i: number) {
      if (
        !(await agree.danger(
          "Sei sicuro di voler eliminare questa sezione?",
          "Rimuovi"
        ))
      )
        return;
      if (!book || !book.parts || !book.parts[part_i])
        return console.error("Libro non esistente o parte non trovata");

      const newBook = { ...book, parts: [...(book.parts || [])] };
      // Rimuovi la sezione dall'array
      newBook.parts[part_i].sections.splice(section_i, 1);

      // se la parte è rimasta senza sezioni, rimuovila
      if (newBook.parts[part_i].sections.length === 0) {
        newBook.parts.splice(part_i, 1);
      }

      const updatedBook = bookStore.updateBook(id, newBook);
      if (updatedBook) setBook(updatedBook);
      toast.success("Sezione rimossa");
    },
  };

  // 5) ORDINAMENTO
  const sortFeat = {
    // controlla se la sezione è la prima del libro
    isFirstOfBook(part_i: number, section_i: number) {
      if (!book) throw new Error("Libro non trovato");
      if (!book.parts || book.parts.length === 0)
        throw new Error("Libro non ha parti");
      return part_i === 0 && section_i === 0;
    },

    // controlla se la sezione è la l'ultima del libro
    isLastOfBook(part_i: number, section_i: number) {
      if (!book) throw new Error("Libro non trovato");
      if (!book.parts || book.parts.length === 0)
        throw new Error("Libro non ha parti");

      const partsCount = book.parts.length; // numero parti
      const isLastPart = part_i === partsCount - 1;
      const sectionCount = book.parts[part_i].sections.length; // numero sezioni nella parte
      const isLastSection = section_i === sectionCount - 1;

      // controlla se la parte è l'ultima del libro e la sezione è l'ultima della sua parte
      return isLastPart && isLastSection;
    },

    async pushOrder(direction: "up" | "down", part_i: number, section_i: number) {
      if (!book) throw new Error("Libro non trovato");
      if (!book.parts || book.parts.length === 0) throw new Error("Libro non ha parti");
      
      // 1) esegue controlli
      const directionToUp = direction === "up";
      // controlla se la parte è la prima / ultima del libro
      const isHemPart = directionToUp
        ? part_i === 0
        : part_i === book.parts.length - 1;
      // controlla se la sezione target è la prima / ultima della sua parte
      const isHemSectionOfPart = directionToUp
        ? section_i === 0
        : section_i === book.parts[part_i].sections.length - 1;

      if (isHemPart && isHemSectionOfPart)
        return console.error("La sezione è già la prima / ultima del libro");

      // 2) controlla che la parte abbia più di una sezione
      const isAloneOnPart = book.parts[part_i].sections.length === 1;
      if (isAloneOnPart && !(await agree.warning(
        "Spostare questa sezione? Rimuoverai la parte dal libro.", "Sposta"
      ))) return;

      let newBook = structuredClone(book);
      newBook.parts = newBook.parts || [];
      const targetSection = structuredClone(newBook.parts[part_i].sections[section_i]);

      // spostamento verso l'alto
      if (directionToUp) {
        // se è la prima sezione, la sposta in fondo alla parte precedente
        if (isHemSectionOfPart) {
          // sposta la sezione in fondo alla parte precedente
          newBook.parts[part_i - 1].sections.push(targetSection);
          // rimuove la sezione dalla parte corrente
          newBook.parts[part_i].sections.splice(section_i, 1);

          // altrimenti scambia solo le sezioni della stessa parte
        } else {
          newBook.parts[part_i].sections[section_i] =
            newBook.parts[part_i].sections[section_i - 1];
          newBook.parts[part_i].sections[section_i - 1] = targetSection;
        }

        // spostamento verso il basso
      } else {
        // se è l'ultima sezione, la sposta in cima alla parte successiva
        if (isHemSectionOfPart) {
          // sposta la sezione in cima alla parte successiva
          newBook.parts[part_i + 1].sections.unshift(targetSection);
          // rimuove la sezione dalla parte corrente
          newBook.parts[part_i].sections.splice(section_i, 1);

          // altrimenti scambia solo le sezioni della stessa parte
        } else {
          newBook.parts[part_i].sections[section_i] =
            newBook.parts[part_i].sections[section_i + 1];
          newBook.parts[part_i].sections[section_i + 1] = targetSection;
        }
      }

      // rimuove tutte le parti del libro senza sezioni
      newBook.parts = newBook.parts.filter((part) => part.sections.length > 0);

      const updatedBook = bookStore.updateBook(id, newBook);
      if (updatedBook) setBook(updatedBook);
      toast.success("Sezione spostata");
    },
  };

  // 6) DROPDOWN
  const [dropdownsState, setDropdownsState] = useState<Record<string, boolean>>({});
  const dropdownFeat = {
    toggle(title: string) {
      setDropdownsState((prev) => ({
        [title]: !prev[title],
      }));
    },
    
    autoClose(e: React.MouseEvent) {
      // se l'elemento cliccato non è un dropdown, chiude tutti i dropdown
      if (!(e.target as HTMLElement).closest(".dropdown")) {
        setDropdownsState({});
      }
    },
  };

  return {
    book,
    setBook,
    page,
    errors,
    setErrors,
    handleUpdateBook,
    partFeat,
    sectionFeat,
    sortFeat,
    dropdownFeat,
    dropdownsState,
    bookStore,
  };
}
