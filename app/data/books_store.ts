import * as v from "valibot";
import { Book, book_schema } from "../schemas/book_schema";
import { download, UPLOAD } from "../tools/feedbacksUI";

const localstorage ={
  set() {
    if (typeof window !== "undefined") {
      localStorage.setItem("books", JSON.stringify(books_store.getBooks()));
    }
  },
  get() {
    if (typeof window == "undefined") return [];
    const books = localStorage.getItem("books");
    if (!books) return [];
    books_store.books = JSON.parse(books);
    return books_store.books;
  },
}

export const books_store ={
  // Store temporaneo (sostituisci con un database reale)
  books: [] as Book[],
  
  // Callbacks per notificare i cambiamenti
  listeners: [] as (() => void)[],
  
  // Registra un listener per i cambiamenti
  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  },
  
  // Notifica tutti i listeners
  notify() {
    this.listeners.forEach(listener => listener());
  },
  
  // Funzione per validare un libro
  validateBook(book: unknown): Book {
    return v.parse(book_schema, book);
  },
  
  // --- FUNZIONI CRUD ---
  // Create
  createBook(newBook: any): Book {
    const book = { ...newBook, id: Date.now(), parts: newBook.parts || [] }; // Assegna un ID temporaneo e mantiene le parti esistenti
    const validatedBook = this.validateBook(book);
    
    this.books.push(validatedBook);
    localstorage.set();
    this.notify();
    return validatedBook;
  },
  
  // Read (tutti i libri)
  getBooks(): Book[] {
    localstorage.get();
    return this.books;
  },
  
  // Read (per ID)
  getBookById(id: number): Book | undefined {
    localstorage.get();
    return this.books.find((book) => book.id === id);
  },
  
  // Update
  updateBook(id: number, updatedBook: Partial<Book>, validation=true): Book | null {
    const index = this.books.findIndex((book) => book.id === id);
    if (index === -1) return null;
  
    const book = { ...this.books[index], ...updatedBook };
    const validatedBook = validation ? this.validateBook(book) : book;
    this.books[index] = validatedBook;
    localstorage.set();
    this.notify();
    return validatedBook;
  },
  
  // Delete
  deleteBook(id: number): boolean {
    const initialLength = this.books.length;
    this.books = this.books.filter((book) => book.id !== id);
    localstorage.set();
    this.notify();
    return this.books.length !== initialLength;
  },

  // download
  download: {
    json: { 
      label: "Download (.json)", 
      icon: "bi-download", 
      execute: (id: number) =>{ 
        const data = books_store.getBookById(id);
        if(!data) throw new Error("libro non trovato");
        
        download.json( data, data.title )
      }
    },
    
    txt: { label: "Download (.txt)", icon: "bi-file", 
      execute: (id: number) =>{ 
        const data = books_store.getBookById(id);
        if(!data) throw new Error("libro non trovato");

        const result = book_to_text(data);
        download.text( result, data.title )
      }
    },

    md: { label: "Download (.md)", icon: "bi-file-earmark-text", 
      execute: (id: number) =>{ 
        const data = books_store.getBookById(id);
        if(!data) throw new Error("libro non trovato");
        
        const result = book_to_text(data, true);
        download.markdown( result, data.title )
      }
    },
  },

  // upload
  upload:{
    json: {
      label: "Upload (.json)",
      icon: "bi-upload",
      async execute(){
        try {
          const input = await UPLOAD.json();
          if (!input) {
            console.error("Nessun file selezionato");
            return;
          }
          const result = books_store.createBook(input);
          console.log("Libro caricato con successo:", result);
        } catch (err) {
          console.error("Errore durante l'upload JSON:", err);
        }
      },
    },
    markdown: {
      label: "Upload (.md)",
      icon: "bi-upload",
      async execute(){
        try {
          const input = await UPLOAD.text();
          if (!input) {
            console.error("Nessun file selezionato");
            return;
          }
          const result = books_store.createBook(input);
          console.log("Libro caricato con successo:", result);
        } catch (err) {
          console.error("Errore durante l'upload markdown:", err);
        }
      }
    }
  }
}

function book_to_text(data: Book, useFormat=false) {
  // imposta titolo
  let result = `${useFormat ?'# ' :''}${data.title}\n\n`;
  // imposta le parti
  for(let part of data.parts || []){
    result += `${useFormat ?'## ' :''}${part.title}\n\n`;
    // imposta le sezioni
    for(let section of part.sections || []){
      result += `${useFormat ?'### ' :''}${section.title}\n\n`;
      // imposta i paragrafi
      for(let paragraph of section.paragraphs || []){
        result += `${paragraph.text}\n\n`;
      }
    }
  }
  return result;
}