"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Book, book_schema } from "../schemas/book_schema";
import * as v from "valibot";

interface BookContextType {
  books: Book[];
  createBook: (book: Omit<Book, "id">) => void;
  updateBook: (id: number, updatedBook: Partial<Book>) => void;
  deleteBook: (id: number) => void;
  getBookById: (id: number) => Book | undefined;
  addBook: (book: Book) => void;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

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

  const validateBook = (book: unknown): Book => {
    return v.parse(book_schema, book);
  };

  function addBook(book: Book) {
    // validazione
    const validatedBook = validateBook(book); 
    setBooks((prev) => [...prev, validatedBook]);    
  }

  function createBook(book: Omit<Book, "id">) {
    const newBook = { ...book, id: Date.now(), parts: book.parts || [] };
    const validatedBook = validateBook(newBook);
    setBooks((prev) => [...prev, validatedBook]);
  }

  function updateBook(id: number, updatedBook: Partial<Book>) {
    setBooks((prev) =>
      prev.map((book) =>
        book.id === id ? validateBook({ ...book, ...updatedBook }) : book
      )
    );
  }

  function deleteBook(id: number) {
    setBooks((prev) => prev.filter((book) => book.id !== id));
  }

  function getBookById(id: number): Book | undefined {
    return books.find((book) => book.id === id);
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

  return (
    <BookContext.Provider
      value={{ books, createBook, updateBook, deleteBook, getBookById, addBook }}>
      {children} </BookContext.Provider>
  );
}

export function useBooks() {
  const context = useContext(BookContext);
  if (context === undefined) {
    throw new Error("useBooks must be used within a BookProvider");
  }
  return context;
}
