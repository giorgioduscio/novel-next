"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { Book, book_schema } from "../schemas/book_schema";
import * as v from "valibot";
import { nanoid } from "nanoid";
import { ui_upload, ui_download, debounce, toast } from "../tools/feedbacksUI";

const FIREBASE_URL = "https://books-3e4c3-default-rtdb.europe-west1.firebasedatabase.app/books";

// Servizio API separato dal ciclo di vita del hook:
// Mantiene l'istanza di debouncing (timer closure) stabile tra i re-render del componente.
const API_SERVICE = {
  // Salva un singolo libro su Firebase (PUT per ID)
  async saveSingleBook(book: Book) {
    try {
      const response = await fetch(`${FIREBASE_URL}/${book.id}.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(book),
      });
      if (!response.ok) {
        console.error("Salvataggio non riuscito:", response.statusText);
      }
      return response;
    } catch (error) {
      console.error("Errore nel salvataggio delle api:", error);
      throw error;
    }
  },

  saveDebounced: debounce(async (book: Book) => {
    console.warn("debounce");
    await API_SERVICE.saveSingleBook(book);
  }, 1000),

  // Elimina un singolo libro da Firebase (DELETE per ID)
  async deleteSingleBook(id: string) {
    try {
      const response = await fetch(`${FIREBASE_URL}/${id}.json`, {
        method: "DELETE",
      });
      if (!response.ok) {
        console.error("Eliminazione non riuscita:", response.statusText);
      }
      return response.body;
    } catch (error) {
      console.error("Errore nell'eliminazione delle api:", error);
      throw error;
    }
  },
};

export interface BookContextType {
  books: Book[];
  loading: boolean;
  createId: () => string;
  validateBook: (book: unknown) => Book | null;
  addBook: (book: Book) => Book | null;
  createBook: (book: Omit<Book, "id">) => Book | null;
  readAll: () => Book[];
  getBookById: (id: string) => Book | undefined;
  updateBook: (id: string, updatedBook: Partial<Book>, validation?: boolean) => Book | null;
  deleteBook: (id: string) => boolean;
  target: Book | undefined;
  setTarget: (book: Book | undefined) => void;
  download: {
    _json_to_text: (data: Book, isMarkdownFormat?: boolean) => string;
    json: { label: string; icon: string; execute: (id: string) => void };
    txt: { label: string; icon: string; execute: (id: string) => void };
    md: { label: string; icon: string; execute: (id: string) => void };
  };
  upload: {
    json: { label: string; icon: string; execute: () => Promise<void> };
    markdown: { label: string; icon: string; execute: () => Promise<void> };
  };
  findFirsted: (book: Book) => { part: string; section: string };
}

export const BookContext = createContext<BookContextType | null>(null);

export const BookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  // interazione con le api (firebase)
  const API = useMemo(() => ({
      URL: FIREBASE_URL,
      saveSingleBook: API_SERVICE.saveSingleBook,
      saveDebounced: API_SERVICE.saveDebounced,
      deleteSingleBook: API_SERVICE.deleteSingleBook,

      // carica tutti i libri
      async loadBooks() {
        try {
          setLoading(true);
          const response = await fetch(`${FIREBASE_URL}.json`);
          if (!response.ok) return console.error("Caricamento non riuscito", response.status);
          const data = await response.json();

          let booksArray: Book[] = [];
          if (data) {
            if (Array.isArray(data)) {
              booksArray = data.filter((b): b is Book => Boolean(b && typeof b === "object"));
            } else if (typeof data === "object") {
              booksArray = Object.values(data).filter((b): b is Book => Boolean(b && typeof b === "object"));
            }
          }
          setBooks(booksArray);
        } catch (error) {
          console.error("Errore nel caricamento delle api:", error);
        } finally {
          setLoading(false);
        }
      },
  }), [] );

  // Carica i libri da Firebase all'avvio
  useEffect(() => {
    API.loadBooks();
  }, [API]);

  // crea l'id univoco (nanoid)
  const createId = useCallback((): string => {
    return nanoid();
  }, []);

  // Valida un libro usando valibot
  const validateBook = useCallback(
    (book: unknown): Book | null => {
      try {        
        const result = v.safeParse(book_schema, book);

        if (!result.success) {
          console.error("Validation error:", result.issues);
          return null;
        }
        return result.output;
      } catch (error) {
        console.error("Validation error:", error);
        return null;
      }
    },[]
  );

  // Restituisce tutti i libri
  const readAll = useCallback((): Book[] => {
    return books;
  }, [books]);

  // Trova un libro per ID
  const [target, setTarget] = useState<Book | undefined>(undefined);
  const getBookById = useCallback(
    (id: string): Book | undefined => {
      return books.find((book) => book.id === id);
    },
    [books]
  );

  // Aggiunge un libro alla lista e lo salva su Firebase
  const addBook = useCallback(
    (book: Book): Book | null => {
      const validatedBook = validateBook(book);
      if (!validatedBook) return null;

      if (books.some((b) => b.id === validatedBook.id)) {
        console.error("Un libro con questo ID esiste già");
        return null;
      }

      const updatedBooks = [...books, validatedBook];
      setBooks(updatedBooks);
      API.saveSingleBook(validatedBook);
      return validatedBook;
    },
    [books, validateBook, API]
  );

  // Crea un nuovo libro con un ID univoco e lo aggiunge alla lista
  const createBook = useCallback(
    (book: Omit<Book, "id">): Book | null => {
      let newId = createId();
      while (books.some((b) => b.id === newId)) {
        newId = createId();
      }

      const newBook: Book = { ...book, id: newId, parts: book.parts || [] };
      return addBook(newBook);
    },
    [books, createId, addBook]
  );

  // Aggiorna un libro esistente
  const updateBook = useCallback(
    (id: string, updatedBook: Partial<Book>, validation = true): Book | null => {
      const stored = getBookById(id);
      if (!stored) {
        console.error("Libro non trovato");
        return null;
      }

      const merged = { ...stored, ...updatedBook };
      const validatedBook = validation ? validateBook(merged as Book) : (merged as Book);
      if (!validatedBook) return null;

      setBooks((prevBooks) => prevBooks.map((book) => (book.id === id ? validatedBook : book)));

      API.saveDebounced(validatedBook);

      return validatedBook;
    },
    [getBookById, validateBook, API]
  );

  // Elimina un libro
  const deleteBook = useCallback(
    (id: string): boolean => {
      setBooks((prevBooks) => prevBooks.filter((book) => book.id !== id));
      const res = API.deleteSingleBook(id);
      if (!res) return false;
      return true;
    },
    [API]
  );

  // Download methods
  const download = useMemo(
    () => ({
      _json_to_text(data: Book, isMarkdownFormat = false) {
        let result = `${isMarkdownFormat ? "# " : ""}${data.title}\n\n`;
        for (let part of data.parts || []) {
          result += `${isMarkdownFormat ? "## " : ""}${part.title}\n\n`;
          for (let section of part.sections || []) {
            result += `${isMarkdownFormat ? "### " : ""}${section.title}\n\n`;
            for (let paragraph of section.paragraphs || []) {
              result += `${paragraph.text}\n\n`;
            }
          }
        }
        return result;
      },

      json: {
        label: "Download (.json)",
        icon: "bi-download",
        execute(id: string) {
          const data = getBookById(id);
          if (!data) throw new Error("libro non trovato");
          ui_download.json(data, data.title);
        },
      },

      txt: {
        label: "Download (.txt)",
        icon: "bi-file",
        execute(id: string) {
          const data = getBookById(id);
          if (!data) throw new Error("libro non trovato");
          const result = download._json_to_text(data);
          ui_download.text(result, data.title);
        },
      },

      md: {
        label: "Download (.md)",
        icon: "bi-file-earmark-text",
        execute(id: string) {
          const data = getBookById(id);
          if (!data) throw new Error("libro non trovato");
          const result = download._json_to_text(data, true);
          ui_download.markdown(result, data.title);
        },
      },
    }),
    [getBookById]
  );

  // Upload methods
  const upload = useMemo(
    () => ({
      json: {
        label: "Upload (.json)",
        icon: "bi-upload",
        async execute() {
          try {
            const input = await ui_upload.json<Book>();
            if (!input) {
              console.error("Nessun file selezionato");
              return;
            }

            if (Array.isArray(input)) {
              toast.danger("Caricare un solo libro alla volta");
              return;
            }

            const existingBook = books.find((book) => book.id === input.id);
            if (existingBook) {
              input.id = createId();
            }
            const res = addBook(input);

            if (!res) toast.danger("Errore durante il caricamento");
            toast.success("Libro caricato da JSON");
          } catch (err) {
            console.error("Errore durante l'upload JSON:", err);
          }
        },
      },

      markdown: {
        label: "Upload (.md)",
        icon: "bi-filetype-md",
        async execute() {
          try {
            const input = await ui_upload.markdown();
            if (!input) {
              console.error("Nessun file selezionato");
              return;
            }
            const validatedBook = validateBook(input);
            if (!validatedBook) return console.error("Formato non valido");

            addBook(validatedBook);
            toast.success("Libro caricato da Markdown");
          } catch (err) {
            console.error("Errore durante l'upload markdown:", err);
          }
        },
      },
    }),
    [books, createId, addBook, validateBook]
  );

  const findFirsted = useCallback((book: Book): { part: string; section: string } => {
    return {
      part: book.parts?.[0]?.id || "",
      section: book.parts?.[0]?.sections?.[0]?.id || "",
    };
  }, []);

  const value = useMemo(() => ({
      books,
      loading,
      createId,
      validateBook,
      addBook,
      createBook,
      readAll,
      getBookById,
      updateBook,
      deleteBook,
      download,
      upload,
      findFirsted,
      target,
      setTarget,
    }),
    [
      books,
      loading,
      createId,
      validateBook,
      addBook,
      createBook,
      readAll,
      getBookById,
      updateBook,
      deleteBook,
      download,
      upload,
      findFirsted,
      target,
      setTarget,
    ]
  );

  return <BookContext.Provider value={value}>{children}</BookContext.Provider>;
};

export const useBookContext = (): BookContextType => {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error("useBookContext must be used within a BookProvider");
  }
  return context;
};
