import { useState, useEffect, useMemo } from "react";
import { safeParse } from "valibot";
import { useBookContext } from "../data/BookContext";
import { useCommonPagesContext } from "../data/CommonPagesContext";
import { Book, book_schema } from "../schemas/book_schema";
import { toast } from "../tools/feedbacksUI";
import { useAuthContext } from "../data/AuthContext";
import { useDotNotation } from "../tools/reactCustomization";
import { nanoid } from "nanoid";
import { hashWithArgon2 } from "../actions/argonActions";

export function useBooksComponent() {
  const bookContext = useBookContext();
  const page = useCommonPagesContext();
  const authContext = useAuthContext();
  const { canRead, canWrite } = authContext.CONTROLS;

  // 1) LIBRI
  const [books, setBooks] = useState<Book[]>([]);
  const searchQuery = useDotNotation("");
  
  useEffect(() => {
    // Cerca tutti i libri per cui ha un codice di lettura
    // Esclude i libri con auth_read vuoto
    const booksMatch = bookContext.readAll().filter(_book => 
      _book.auth_read && _book.auth_read.length > 0 && canRead(_book)
    );
    setBooks(booksMatch);
  }, [bookContext.books, canRead]);

  // Filtra i libri in base alla ricerca
  const filteredBooks = useMemo(() => {
    if (!searchQuery.get.trim()) return books;
    const query = searchQuery.get.toLowerCase();
    return books.filter(book => 
      book.title.toLowerCase().includes(query) || 
      book.author_name.toLowerCase().includes(query)
    );
  }, [books, searchQuery]);

  const BOOKS = {
    // Crea un nuovo libro con valori predefiniti
    async create() {
      // Genera codice di lettura univoco
      const readCode = nanoid(16);
      
      // Hasha il codice di lettura
      const hashedReadCode = await hashWithArgon2(readCode);
      
      // Aggiornamento stato
      const clone = structuredClone(books);
      const newBook = {
        id: bookContext.createId(),
        title: "",
        description: "",
        author_name: "",
        auth_read: hashedReadCode,
        auth_write: "",
      };
      clone.unshift(newBook);
      setBooks(clone);


      // Feedback utente
      toast.success("Libro creato");
    },

    // Aggiorna un libro esistente
    async update(bookId: string, key: keyof Book, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
      // Validazione
      const book = books.find(b => b.id === bookId);
      if (!book) throw new Error("Libro non valido");

      // Crea una copia del libro con il campo aggiornato
      const newBook = structuredClone({ ...book, [key]: e.currentTarget.value });

      // Aggiorna il libro nello stato locale
      setBooks(prev => prev.map(_book => _book.id === bookId ? newBook : _book));
      if(!newBook.title || !newBook.author_name) return;

      // crea codice lettura
      const isPresent = bookContext.books.find(_book => _book.id === bookId);
      if(!isPresent){
        // Genera codice di lettura univoco
        const readCode = nanoid(16);
        
        // Hasha il codice di lettura
        const hashedReadCode = await hashWithArgon2(readCode);
        newBook.auth_read = hashedReadCode

        // Salva il codice in chiaro in localStorage
        authContext.createCode({
          title: `${newBook.title}: lettura`,
          auth_code: readCode,
        }); 
      }

      // Aggiorna database (se non esiste, crea, altrimenti aggiorna)
      const result = isPresent
        ? bookContext.updateBook(bookId, newBook)
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
    filteredBooks,
    searchQuery,
    errors,
    page,
    bookContext,
    BOOKS,
    authContext,
    canRead,
    canWrite
  };
}