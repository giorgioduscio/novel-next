"use client";

import { useEffect, useState } from "react";
import { Book, book_schema, Part, Section } from "../schemas/book_schema";
import { useAgreeWrapper } from "@/app/shareds/Agree";
import { ui_upload, toast } from "../tools/feedbacksUI";
import { safeParse } from "valibot";
import BooksTemplate from "./BooksTemplate";
import useBookHook from "../data/useBookHook";
import useCommonPagesHook from "../data/useCommonPagesHook";

export default function BooksComponent() {
  const hookData = useBooksComponent();
  return <BooksTemplate {...hookData} />;
}

export function useBooksComponent() {
  const BookHook = useBookHook();
  const page = useCommonPagesHook();
  const agree = useAgreeWrapper();
  const [books, setbooks] = useState<Book[]>([]);

  // 1) ERRORI
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  function toggleErrors(key: string, newBook: Book) {
    const validated = safeParse(book_schema, newBook);
    const newKey = `${newBook.id}>${key}`;

    if (!validated.success) {
      // Gestisce gli errori di validazione
      const message = validated.issues?.[0]?.message;

      setErrors((prev) => ({
        ...prev,
        [newKey]: message?.split(": ")[1] || "Errore di validazione",
      }));

      return toast.danger("Errore di validazione");
    }

    // Rimuove l'errore se la validazione ha successo
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[newKey];
      return newErrors;
    });
  }

  // 2) LIBRI
  useEffect(() => {
    setbooks(BookHook.readAll());
  }, [BookHook.books]);

  const BOOKS = {
    // Crea un nuovo libro con valori predefiniti
    create() {
      // aggiornamento database
      BookHook.createBook({
        title: "Book_" + Date.now(),
        description: "Descrizione_" + Date.now(),
        author: "Autore_" + Date.now(),
      });

      // nuovo stato
      setbooks(BookHook.readAll());

      // feedback utente
      toast.success("Libro creato");
    },

    // Aggiorna un libro esistente
    update(index: number, key: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
      // validazione
      const book = books[index];
      if (!book) throw new Error("Libro non valido");

      // Crea una copia del libro con il campo aggiornato
      const newBook = structuredClone({ ...book, [key]: e.currentTarget.value });

      // Valida il libro aggiornato
      toggleErrors(key, newBook);

      // Aggiorna il libro nel contesto
      const result = BookHook.updateBook(book.id, newBook);
      if(!result) return toast.danger("Errore nell'aggiornamento del libro");

      // feedback utente
      setbooks(BookHook.readAll());
      toast.success("Libro aggiornato");
    },

    // Elimina un libro dopo conferma
    async delete(id: string) {
      if (!(await agree.danger("Rimuovere il libro?", "Rimuovi"))) return;
      // aggiorna lo stato
      setbooks(BookHook.readAll());
      // elimina il libro
      const res = BookHook.deleteBook(id);
      if (!res) return toast.danger("Errore nell'eliminazione del libro");
      // feedback utente
      toast.success("Libro rimosso");
    },
  };

  // Restituisce i dati e le funzionalità per il template
  return {
    books,
    errors,
    page,
    BookHook,
    BOOKS,
  };
}