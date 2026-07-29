import * as v from "valibot";
import { Book, book_schema } from "../schemas/_book_schema";

export const books_store ={
  // Store temporaneo (sostituisci con un database reale)
  books: [] as Book[],
  
  // Funzione per validare un libro
  validateBook(book: unknown): Book {
    return v.parse(book_schema, book);
  },

  safeToLocalstorrage() {
    if (typeof window !== "undefined") {
      localStorage.setItem("books", JSON.stringify(this.books));
    }
  },
  getFromLocalstorrage() {
    if (typeof window !== "undefined") {
      const books = localStorage.getItem("books");
      if (books) {
        this.books = JSON.parse(books);
      }
    }
  },
  
  // --- FUNZIONI CRUD ---
  // Create
  createBook(newBook: Omit<Book, "id" | "parts">): Book {
    const book = { ...newBook, id: Date.now(), parts: [] }; // Assegna un ID temporaneo
    const validatedBook = this.validateBook(book);
    
    this.books.push(validatedBook);
    this.safeToLocalstorrage();
    return validatedBook;
  },
  
  // Read (tutti i libri)
  getBooks(): Book[] {
    this.getFromLocalstorrage();
    return this.books;
  },
  
  // Read (per ID)
  getBookById(id: number): Book | undefined {
    this.getFromLocalstorrage();
    return this.books.find((book) => book.id === id);
  },
  
  // Update
  updateBook(id: number, updatedBook: Partial<Book>, validation=true): Book | null {
    const index = this.books.findIndex((book) => book.id === id);
    if (index === -1) return null;
  
    const book = { ...this.books[index], ...updatedBook };
    const validatedBook = validation ? this.validateBook(book) : book;
    this.books[index] = validatedBook;
    this.safeToLocalstorrage();
    return validatedBook;
  },
  
  // Delete
  deleteBook(id: number): boolean {
    const initialLength = this.books.length;
    this.books = this.books.filter((book) => book.id !== id);
    this.safeToLocalstorrage();
    return this.books.length !== initialLength;
  }
}