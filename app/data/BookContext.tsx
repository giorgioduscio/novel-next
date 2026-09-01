"use client";

import { useState, useEffect } from "react";
import { Book, book_schema } from "../schemas/book_schema";
import * as v from "valibot";
import { nanoid } from "nanoid";
import { ui_upload, ui_download, debounce, toast } from "../tools/feedbacksUI";
import { generateContext } from "../tools/generateContext";
import { sanitizeAccessCode, isValidAccessCode } from "@/lib/security";

const FIREBASE_URL = "https://books-3e4c3-default-rtdb.europe-west1.firebasedatabase.app/books";

// Servizio API separato dal ciclo di vita del hook
const API_SERVICE = {
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

  saveDebounced: debounce(function (book: Book) {
    console.warn("debounce");
    return API_SERVICE.saveSingleBook(book);
  }, 1000),

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

function bookContextValue() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState<Book | undefined>(undefined);

  // Carica i libri da Firebase all'avvio
  useEffect(()=> {
    API.loadBooks();
  }, []);

  // Valida un libro usando Valibot
  function validateBook(book: unknown): Book | null {
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
  }

  // Funzione per trovare la prima parte e sezione di un libro
  function findFirsted(book: Book) {
    return {
      part: book.parts?.[0]?.id || "",
      section: book.parts?.[0]?.sections?.[0]?.id || "",
    };
  }
  
  // Verify access code using existing Argon2 implementation
  async function verifyAccessCode(bookId: string, code: string, type: 'read' | 'write'): Promise<boolean> {
    try {
      // Sanitize code before processing
      const sanitizedCode = sanitizeAccessCode(code);
      
      if (!isValidAccessCode(sanitizedCode)) {
        console.error('Invalid code format');
        return false;
      }

      // Get the book to check the hash
      const book = books.find(b => b.id === bookId);
      if (!book) return false;

      const authField = type === 'read' ? 'auth_read' : 'auth_write';
      const storedHash = book[authField];

      // If no password is set, allow access
      if (!storedHash || storedHash === '') {
        return true;
      }

      // Use existing Argon2 verification from client-side
      const { verifyWithArgon2 } = await import('../actions/argonActions');
      return await verifyWithArgon2(sanitizedCode, storedHash);
    } catch (error) {
      console.error('Error verifying code:', error);
      return false;
    }
  }

  // Oggetto API
  const API = {
    URL: FIREBASE_URL,
    saveSingleBook: API_SERVICE.saveSingleBook,
    saveDebounced: API_SERVICE.saveDebounced,
    deleteSingleBook: API_SERVICE.deleteSingleBook,

    async loadBooks() {
      try {
        setLoading(true);
        const response = await fetch(`${FIREBASE_URL}.json`);
        if (!response.ok) return console.error("Caricamento non riuscito", response.status);

        const data = await response.json();
        let booksArray: Book[] = [];

        if (data) {
          const rawBooks = Array.isArray(data) ? data : Object.values(data);
          booksArray = rawBooks
            .filter(function (b) { return Boolean(b && typeof b === "object"); })
            .map(function (b) { return validateBook(b); })
            .filter(function (b): b is Book { return b !== null; });
        }
        setBooks(booksArray);
      } catch (error) {
        console.error("Errore nel caricamento delle api:", error);
      } finally {
        setLoading(false);
      }
    },
  };

  // Oggetto CRUD per la gestione dei libri
  const CRUD = {
    // Crea un ID univoco
    createId: function (): string {
      return nanoid();
    },

    // Valida un libro usando Valibot
    validateBook: validateBook,

    // Restituisce tutti i libri
    readAll: function (): Book[] {
      return books;
    },

    // Trova un libro per ID
    getBookById: function (id: string): Book | undefined {
      return books.find(function (book) { return book.id === id; });
    },

    // Aggiunge un libro alla lista e lo salva su Firebase
    addBook: function (book: Book): Book | null {
      const validatedBook = this.validateBook(book);
      if (!validatedBook) return null;

      if (books.some(function (b) { return b.id === validatedBook.id; })) {
        console.error("Un libro con questo ID esiste già");
        return null;
      }

      const updatedBooks = [...books, validatedBook];
      setBooks(updatedBooks);
      API.saveSingleBook(validatedBook);
      return validatedBook;
    },

    // Crea un nuovo libro con un ID univoco e lo aggiunge alla lista
    createBook: function (book: Omit<Book, "id">): Book | null {
      let newId = this.createId();
      while (books.some(function (b) { return b.id === newId; })) {
        newId = this.createId();
      }

      const newBook: Book = { ...book, id: newId, parts: book.parts || [] };
      return this.addBook(newBook);
    },

    // Aggiorna un libro esistente
    updateBook: function (id: string, updatedBook: Partial<Book>, validation = true): Book | null {
      const stored = this.getBookById(id);
      if (!stored) {
        console.error("Libro non trovato");
        return null;
      }

      const merged = { ...stored, ...updatedBook };
      const validatedBook = validation ? this.validateBook(merged as Book) : (merged as Book);
      if (!validatedBook) return null;

      setBooks(function (prevBooks) {
        return prevBooks.map(function (book) {
          return book.id === id ? validatedBook : book;
        });
      });
      API.saveDebounced(validatedBook);
      return validatedBook;
    },

    // Elimina un libro
    deleteBook: function (id: string): boolean {
      setBooks(function (prevBooks) {
        return prevBooks.filter(function (book) { return book.id !== id; });
      });
      const res = API.deleteSingleBook(id);
      return !!res;
    },
  };

  // Oggetto download
  const download = {
    _json_to_text: function (data: Book, isMarkdownFormat = false) {
      let result = `${isMarkdownFormat ? "# " : ""}${data.title}\n\n`;
      for (const part of data.parts || []) {
        result += `${isMarkdownFormat ? "## " : ""}${part.title}\n\n`;
        for (const section of part.sections || []) {
          result += `${isMarkdownFormat ? "### " : ""}${section.title}\n\n`;
          for (const paragraph of section.paragraphs || []) {
            result += `${paragraph.text}\n\n`;
          }
        }
      }
      return result;
    },

    json: {
      label: "Download (.json)",
      icon: "bi-download",
      execute: function (id: string) {
        const data = CRUD.getBookById(id);
        if (!data) throw new Error("Libro non trovato");
        ui_download.json(data, data.title);
      },
    },

    txt: {
      label: "Download (.txt)",
      icon: "bi-file",
      execute: function (id: string) {
        const data = CRUD.getBookById(id);
        if (!data) throw new Error("Libro non trovato");
        const result = download._json_to_text(data);
        ui_download.text(result, data.title);
      },
    },

    md: {
      label: "Download (.md)",
      icon: "bi-file-earmark-text",
      execute: function (id: string) {
        const data = CRUD.getBookById(id);
        if (!data) throw new Error("Libro non trovato");
        const result = download._json_to_text(data, true);
        ui_download.markdown(result, data.title);
      },
    },
  };

  // Oggetto upload
  const upload = {
    json: {
      label: "Upload (.json)",
      icon: "bi-upload",
      execute: async function () {
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

          const existingBook = books.find(function (book) { return book.id === input.id; });
          if (existingBook) {
            input.id = CRUD.createId();
          }
          const res = CRUD.addBook(input);
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
      execute: async function () {
        try {
          const input = await ui_upload.markdown();
          if (!input) {
            console.error("Nessun file selezionato");
            return;
          }
          const validatedBook = CRUD.validateBook(input);
          if (!validatedBook) return console.error("Formato non valido");
          CRUD.addBook(validatedBook);
          toast.success("Libro caricato da Markdown");
        } catch (err) {
          console.error("Errore durante l'upload markdown:", err);
        }
      },
    },
  };

  return {
    books,
    loading,
    ...CRUD,
    download,
    upload,
    findFirsted,
    target,
    setTarget,
    verifyAccessCode,
  };
}

export const {
  provider: BookProvider,
  context: useBookContext
} = generateContext(bookContextValue);