"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Book, book_schema } from "../schemas/book_schema";
import * as v from "valibot";
import { ui_upload, debounce, ui_download } from "../tools/feedbacksUI";

interface Load { label: string; icon: string; execute: (id: number) => void };

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
    json: Load;
    markdown: Load;
  };
} | undefined>(undefined);

export function BookProvider({ children }: { children: React.ReactNode }) {  
  
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
    const currentBooks = storage.get();
    storage.set([...currentBooks, validatedBook]);
    return validatedBook;  
  }

  function createBook(book: Omit<Book, "id">) {
    const newBook = { ...book, id: Date.now(), parts: book.parts || [] };
    return addBook(newBook);
  }


  // read
  function readAll(): Book[] {
    const stored = storage.get();
    return stored;
  }

  function getBookById(id: number): Book | undefined {
    const stored = storage.get();
    return stored.find((book) => book.id === id);
  }

  
  function updateBook(id: number, updatedBook: Partial<Book>, validation = true) {
    const stored = getBookById(id);
    if (!stored){
      console.error("Libro non trovato");
      return null;
    } 
    
    const validatedBook = validateBook({
      ...stored,
      ...updatedBook
    });
    if (!validatedBook) return null;
    
    const currentBooks = storage.get();
    const updatedBooks = currentBooks.map(book => book.id === id ? validatedBook : book);
    
    // Use debounced storage update for frequent changes, immediate for validation=false (typing)
    if (validation === false) {
      storage.debouncedStorageSet(updatedBooks);
    } else {
      storage.set(updatedBooks);
    }
    
    return validatedBook;
  }
  
  function deleteBook(id: number) {
    const books = storage.get();
    storage.set(books.filter((book) => book.id !== id));
  }
  
  
  const storage ={
    debouncedStorageSet: debounce((books: Book[]) => {
      storage.set(books);
    }, 1000),

    set(books: Book[]) {
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
          const input = await ui_upload.json();
          if (!input) {
            console.error("Nessun file selezionato");
            return;
          }
          const validatedBook = validateBook(input);
          if (!validatedBook) return console.error("Formato non valido");
          const currentBooks = storage.get();
          storage.set([...currentBooks, validatedBook]);
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
          const input = await ui_upload.text();
          if (!input) {
            console.error("Nessun file selezionato");
            return;
          }
          const validatedBook = validateBook(input);
          if (!validatedBook) return console.error("Formato non valido");
          const currentBooks = storage.get();
          storage.set([...currentBooks, validatedBook]);
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
