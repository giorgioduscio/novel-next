"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { Book, book_schema } from "../schemas/book_schema";
import * as v from "valibot";
import { ui_upload, debounce, ui_download } from "../tools/feedbacksUI";

interface Load { label: string; icon: string; execute: (id: number) => void };
interface UploadLoad { label: string; icon: string; execute: () => void; }

const FIREBASE_BASE_URL = "https://books-3e4c3-default-rtdb.europe-west1.firebasedatabase.app/books";

const BookContext = createContext<{
  createBook: (book: Omit<Book, "id">) => Book | null;
  addBook: (book: Book) => Book | null;
  readAll: () => Book[];
  getBookById: (id: number) => Book | undefined;
  updateBook: (id: number, updatedBook: Partial<Book>, validation?: boolean) => Book | null;
  deleteBook: (id: number) => void;
  download: {
    json: Load;
    txt: Load;
    md: Load;
  };
  upload: {
    json: UploadLoad;
    markdown: UploadLoad;
  };
  loading: boolean;
} | undefined>(undefined);

export function BookProvider({ children }: { children: React.ReactNode }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  // Carica i libri da Firebase all'avvio
  useEffect(() => {
    async function loadBooks() {
      try {
        setLoading(true);
        const response = await fetch(`${FIREBASE_BASE_URL}.json`);
        if (!response.ok) throw new Error("Errore durante il caricamento dei libri da Firebase");
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
        console.error("Error loading books from Firebase:", error);
      } finally {
        setLoading(false);
      }
    }
    loadBooks();
  }, []);

  // Salva un singolo libro su Firebase (PUT per ID)
  async function saveSingleBook(book: Book) {
    try {
      const response = await fetch(`${FIREBASE_BASE_URL}/${book.id}.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(book),
      });
      if (!response.ok) {
        console.error("Error saving book to Firebase:", response.statusText);
      }
    } catch (error) {
      console.error("Error saving book to Firebase:", error);
    }
  }

  // Elimina un singolo libro da Firebase (DELETE per ID)
  async function deleteSingleBook(id: number) {
    try {
      const response = await fetch(`${FIREBASE_BASE_URL}/${id}.json`, {
        method: "DELETE",
      });
      if (!response.ok) {
        console.error("Error deleting book from Firebase:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting book from Firebase:", error);
    }
  }

  // Debounce del salvataggio su Firebase per modifiche frequenti
  const debouncedSaveSingleBook = useMemo(
    () =>
      debounce((bookToSave: Book) => {
        saveSingleBook(bookToSave);
      }, 1000),
    []
  );

  function validateBook(book: unknown): Book | null {
    try {
      return v.parse(book_schema, book);
    } catch (error) {
      console.error("Validation error:", error);
      return null;
    }
  }

  function addBook(book: Book) {
    const validatedBook = validateBook(book);
    if (!validatedBook) return null;

    if (books.some((b) => b.id === validatedBook.id)) {
      console.error("Un libro con questo ID esiste già");
      return null;
    }

    const updatedBooks = [...books, validatedBook];
    setBooks(updatedBooks);
    saveSingleBook(validatedBook);
    return validatedBook;
  }

  function createBook(book: Omit<Book, "id">) {
    let newId = Date.now();
    while (books.some((b) => b.id === newId)) {
      newId++;
    }

    const newBook: Book = { ...book, id: newId, parts: book.parts || [] };
    return addBook(newBook);
  }

  const readAll = useCallback((): Book[] => {
    return books;
  }, [books]);

  const getBookById = useCallback(
    (id: number): Book | undefined => {
      return books.find((book) => book.id === id);
    },
    [books]
  );

  function updateBook(id: number, updatedBook: Partial<Book>, validation = true) {
    const stored = getBookById(id);
    if (!stored) {
      console.error("Libro non trovato");
      return null;
    }

    const merged = { ...stored, ...updatedBook };
    const validatedBook = validation ? validateBook(merged) : (merged as Book);
    if (!validatedBook) return null;

    setBooks((prevBooks) => prevBooks.map((book) => (book.id === id ? validatedBook : book)));

    if (validation === false) {
      debouncedSaveSingleBook(validatedBook);
    } else {
      saveSingleBook(validatedBook);
    }

    return validatedBook;
  }

  function deleteBook(id: number) {
    setBooks((prevBooks) => prevBooks.filter((book) => book.id !== id));
    deleteSingleBook(id);
  }

  // Helper function to convert book to text
  function bookToText(data: Book, useFormat = false) {
    let result = `${useFormat ? "# " : ""}${data.title}\n\n`;
    for (let part of data.parts || []) {
      result += `${useFormat ? "## " : ""}${part.title}\n\n`;
      for (let section of part.sections || []) {
        result += `${useFormat ? "### " : ""}${section.title}\n\n`;
        for (let paragraph of section.paragraphs || []) {
          result += `${paragraph.text}\n\n`;
        }
      }
    }
    return result;
  }

  // Download methods
  const downloadMethods = {
    json: {
      label: "Download (.json)",
      icon: "bi-download",
      execute: (id: number) => {
        const data = getBookById(id);
        if (!data) throw new Error("libro non trovato");
        ui_download.json(data, data.title);
      },
    },
    txt: {
      label: "Download (.txt)",
      icon: "bi-file",
      execute: (id: number) => {
        const data = getBookById(id);
        if (!data) throw new Error("libro non trovato");
        const result = bookToText(data);
        ui_download.text(result, data.title);
      },
    },
    md: {
      label: "Download (.md)",
      icon: "bi-file-earmark-text",
      execute: (id: number) => {
        const data = getBookById(id);
        if (!data) throw new Error("libro non trovato");
        const result = bookToText(data, true);
        ui_download.markdown(result, data.title);
      },
    },
  };

  // Upload methods
  const uploadMethods = {
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
          const validatedBook = validateBook(input);
          if (!validatedBook) return console.error("Formato non valido");
          addBook(validatedBook);
          console.log("Libro caricato con successo:", validatedBook);
        } catch (err) {
          console.error("Errore durante l'upload JSON:", err);
        }
      },
    },
    markdown: {
      label: "Upload (.md)",
      icon: "bi-upload",
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
          console.log("Libro caricato con successo:", validatedBook);
        } catch (err) {
          console.error("Errore durante l'upload markdown:", err);
        }
      },
    },
  };

  return (
    <BookContext.Provider
      value={{
        createBook,
        readAll,
        getBookById,
        updateBook,
        deleteBook,
        addBook,
        download: downloadMethods,
        upload: uploadMethods,
        loading,
      }}
    >
      {children}
    </BookContext.Provider>
  );
}

export function useBooks() {
  const context = useContext(BookContext);
  if (context === undefined) {
    throw new Error("useBooks must be used within a BookProvider");
  }
  return context;
}

