"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Book, book_schema } from "../schemas/book_schema";
import * as v from "valibot";
import { download, UPLOAD } from "../tools/feedbacksUI";

interface Load { label: string; icon: string; execute: (id: number) => void };

const BookContext = createContext<{
  books: Book[];
  createBook: (book: Omit<Book, "id">) => void;
  readAll: () => Book[];
  getBookById: (id: number) => Book | undefined;
  updateBook: (id: number, updatedBook: Partial<Book>, validation?: boolean) => void;
  deleteBook: (id: number) => void;
  addBook: (book: Book) => void;
  download: {
    json: Load;
    txt: Load;
    md: Load;
  };
  upload: {
    json: Load;
    markdown: Load;
  };
} | undefined>(undefined);

export function BookProvider({ children }: { children: React.ReactNode }) {
  const [books, setBooks] = useState<Book[]>([]);

  // Carica i libri dal localStorage all'avvio
  useEffect(() => {
    const stored = storage.get();
    if (stored.length)  setBooks(stored);
  }, []);

  // Salva i libri nel localStorage quando cambiano
  useEffect(() => {
    if (typeof window !== "undefined" && books.length > 0) {
      storage.set();
    }
  }, [books]);

  
  
  function validateBook(book: unknown): Book | null {
    try {
      return v.parse(book_schema, book);
    } catch (error) {
      console.error("Validation error:", error);
      return null;
    }
  };

  function addBook(book: Book) {
    // validazione
    const validatedBook = validateBook(book);
    if (!validatedBook) return null;
    setBooks((prev) => [...prev, validatedBook]);    
  }

  function createBook(book: Omit<Book, "id">) {
    const newBook = { ...book, id: Date.now(), parts: book.parts || [] };
    const validatedBook = validateBook(newBook);
    if (!validatedBook) return null;
    setBooks((prev) => [...prev, validatedBook]);
  }

  function readAll(): Book[] {
    const stored = storage.get();
    return stored;
  }

  function getBookById(id: number): Book | undefined {
    return books.find((book) => book.id === id);
  }

  function updateBook(id: number, updatedBook: Partial<Book>, validation = true) {
    setBooks((prev) =>
      prev.map((book) => {
        if (book.id === id) {
          const merged = { ...book, ...updatedBook };
          if (validation) {
            const validated = validateBook(merged);
            return validated || book;
          }
          return merged;
        }
        return book;
      })
    );
  }

  function deleteBook(id: number) {
    setBooks((prev) => prev.filter((book) => book.id !== id));
  }


  const storage ={
    set() {
      if (typeof window !== "undefined") {
        localStorage.setItem("books", JSON.stringify(books));
      }
    },
    get() :Book[] {
      if (typeof window == "undefined") return [];
      const books = localStorage.getItem("books");
      if (!books) return [];
      return JSON.parse(books);
    },
  }

  // Helper function to convert book to text
  function bookToText(data: Book, useFormat = false) {
    let result = `${useFormat ? '# ' : ''}${data.title}\n\n`;
    for (let part of data.parts || []) {
      result += `${useFormat ? '## ' : ''}${part.title}\n\n`;
      for (let section of part.sections || []) {
        result += `${useFormat ? '### ' : ''}${section.title}\n\n`;
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
        download.json(data, data.title);
      },
    },
    txt: {
      label: "Download (.txt)",
      icon: "bi-file",
      execute: (id: number) => {
        const data = getBookById(id);
        if (!data) throw new Error("libro non trovato");
        const result = bookToText(data);
        download.text(result, data.title);
      },
    },
    md: {
      label: "Download (.md)",
      icon: "bi-file-earmark-text",
      execute: (id: number) => {
        const data = getBookById(id);
        if (!data) throw new Error("libro non trovato");
        const result = bookToText(data, true);
        download.markdown(result, data.title);
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
          const input = await UPLOAD.json();
          if (!input) {
            console.error("Nessun file selezionato");
            return;
          }
          const validatedBook = validateBook(input);
          if (!validatedBook) return console.error("Formato non valido");
          setBooks((prev) => [...prev, validatedBook]);
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
          const input = await UPLOAD.text();
          if (!input) {
            console.error("Nessun file selezionato");
            return;
          }
          const validatedBook = validateBook(input);
          if (!validatedBook) return console.error("Formato non valido");
          setBooks((prev) => [...prev, validatedBook]);
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
        books,
        readAll,
        getBookById,
        createBook,
        updateBook,
        deleteBook,
        addBook,
        download: downloadMethods,
        upload: uploadMethods,
      }}>{children} </BookContext.Provider>
  );
}

export function useBooks() {
  const context = useContext(BookContext);
  if (context === undefined) {
    throw new Error("useBooks must be used within a BookProvider");
  }
  return context;
}
