import { useState, useEffect, useMemo } from "react";
import { safeParse } from "valibot";
import { useBookContext } from "../data/BookContext";
import { useCommonPagesContext } from "../data/CommonPagesContext";
import { Book, book_schema } from "../schemas/book_schema";
import { toast } from "../tools/feedbacksUI";
import { useAuthContext } from "../data/AuthContext";

export function useBooksComponent() {
  const bookContext = useBookContext();
  const page = useCommonPagesContext();
  const authContext = useAuthContext();
  const { canRead, canWrite } = authContext.CONTROLS;

  // 1) LIBRI
  const [books, setBooks] = useState<Book[]>([]);
  useEffect(() => {
    // Trova tutti i libri per cui ha un codice di lettura
    const booksMatch = bookContext.readAll().filter(_book => canRead(_book));
    setBooks(booksMatch);
  }, [bookContext.books, canRead]);

  const BOOKS = {
    // Crea un nuovo libro con valori predefiniti
    create() {
      // Aggiornamento stato
      const clone = structuredClone(books);
      clone.unshift({
        id: bookContext.createId(),
        title: "",
        description: "",
        author_name: "",
        auth_read: "",
        auth_write: "",
      });
      setBooks(clone);

      // Feedback utente
      toast.success("Libro creato");
    },

    // Aggiorna un libro esistente
    update(index: number, key: keyof Book, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
      // Validazione
      const book = books[index];
      if (!book) throw new Error("Libro non valido");

      // Crea una copia del libro con il campo aggiornato
      const newBook = structuredClone({ ...book, [key]: e.currentTarget.value });

      // Aggiorna il libro nello stato locale
      setBooks(prev => prev.map(_book => _book.id === book.id ? newBook : _book));

      // Aggiorna database (se non esiste, crea, altrimenti aggiorna)
      const isPresent = bookContext.books.find(_book => _book.id === book.id);
      const result = isPresent
        ? bookContext.updateBook(book.id, newBook)
        : bookContext.addBook(newBook);

      // Feedback utente
      if (!result) return toast.danger("Errore nell'aggiornamento del libro");
      toast.success("Libro aggiornato");
    },
  };

  // 2) ERRORI
  const errors = useMemo(() => {
    const result: Record<string, string> = {};

    for (let i = 0; i < books.length; i++) {
      const book = structuredClone(books[i]);
      delete book.parts;
      const validated = safeParse(book_schema, book);
      if (validated.success) continue;

      for (const issue of validated.issues) {
        const [key, message] = issue.message.split(": ");
        result[`${book.id}>${key}`] = message || "Errore di validazione";
      }
    }

    return result;
  }, [books]);

  // Restituisce i dati e le funzionalità per il template
  return {
    books,
    errors,
    page,
    bookContext,
    BOOKS,
    authContext,
    canRead,
    canWrite
  };
}