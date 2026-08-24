"use client";

import { useState, useEffect, useCallback } from "react";
import { Book, book_schema } from "../schemas/book_schema";
import * as v from "valibot";
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
    console.log('debounce');
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

export default function useBookHook() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  // Carica i libri da Firebase all'avvio
  useEffect(() => {
    API.loadBooks();
  }, []);
  
  // interazione con le api (firebase)
  const API = {
    URL: FIREBASE_URL,
    saveSingleBook: API_SERVICE.saveSingleBook,
    saveDebounced: API_SERVICE.saveDebounced,
    deleteSingleBook: API_SERVICE.deleteSingleBook,

    // carica tutti i libri
    async loadBooks() {
      try {
        setLoading(true);
        const response = await fetch(`${this.URL}.json`);
        if (!response.ok) return console.error("Caricamento non riiuscito", response.status);
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
  } as const;

  // stato dei dati 
  const CRUD ={
    // crea l'id univoco (UUID v4)
    createId(){
      return crypto.randomUUID()
    },

    // Migra i dati per garantire che i campi note siano presenti
    migrateBook(book: any): Book {
      const migrated = structuredClone(book);
      
      // Migra le parti
      if (migrated.parts && Array.isArray(migrated.parts)) {
        migrated.parts = migrated.parts.map((part: any) => ({
          ...part,
          note: part.note ?? "",
          // Migra le sezioni
          sections: part.sections?.map((section: any) => ({
            ...section,
            note: section.note ?? "",
          })) || [],
        }));
      }
      
      return migrated;
    },

    // Valida un libro usando valibot
    validateBook(book: unknown): Book | null {
      try {
        // Prima migra i dati
        const migratedBook = this.migrateBook(book as any);
        
        const result = v.safeParse(book_schema, migratedBook);
  
        if (!result.success) {
          console.error("Validation error:", result.issues);
          return null;
        }
        return result.output;
  
      } catch (error) {
        console.error("Validation error:", error);
        return null;
      }
    },
  
  
    // Aggiunge un libro alla lista e lo salva su Firebase
    addBook(book: Book) {
      const validatedBook = this.validateBook(book);
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
  
    // Crea un nuovo libro con un ID univoco e lo aggiunge alla lista
    createBook(book: Omit<Book, "id">) {
      let newId =  CRUD.createId();
      while (books.some((b) => b.id === newId)) {
        newId = CRUD.createId();
      }
  
      const newBook: Book = { ...book, id: newId, parts: book.parts || [] };
      return this.addBook(newBook);
    },
  
  
    // Restituisce tutti i libri
    readAll :useCallback((): Book[] => {
      return books;
    }, [books]),
  
    // Trova un libro per ID
    getBookById :useCallback(
      (id: string): Book | undefined => {
        return books.find((book) => book.id === id);
      }, [books]
    ),
  
    // Aggiorna un libro esistente
    updateBook(id: string, updatedBook: Partial<Book>, validation = true) {
      const stored = this.getBookById(id);
      if (!stored) {
        console.error("Libro non trovato");
        return null;
      }

      const merged = { ...stored, ...updatedBook };
      const validatedBook = validation ? this.validateBook(merged as Book) : (merged as Book);
      if (!validatedBook) return null;

      setBooks((prevBooks) => prevBooks.map((book) => (book.id === id ? validatedBook : book)));

      API.saveDebounced(validatedBook);

      return validatedBook;
    },
  
    deleteBook(id: string) {
      setBooks((prevBooks) => prevBooks.filter((book) => book.id !== id));
      const res = API.deleteSingleBook(id);
      if (!res) return false;
      return true;
    }
  } as const
  
  // Download methods
  const DOWNLOAD = {
    // Helper function to convert book to text
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
      execute(id: string){
        const data = CRUD.getBookById(id);
        if (!data) throw new Error("libro non trovato");
        ui_download.json(data, data.title);
      },
    },

    txt: {
      label: "Download (.txt)",
      icon: "bi-file",
      execute(id: string) {
        const data = CRUD.getBookById(id);
        if (!data) throw new Error("libro non trovato");
        const result = DOWNLOAD._json_to_text(data);
        ui_download.text(result, data.title);
      },
    },
    md: {
      label: "Download (.md)",
      icon: "bi-file-earmark-text",
      execute(id: string) {
        const data = CRUD.getBookById(id);
        if (!data) throw new Error("libro non trovato");
        const result = DOWNLOAD._json_to_text(data, true);
        ui_download.markdown(result, data.title);
      },
    },
  };

  // Upload methods
  const UPLOAD = {
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

          // Type guard: ensure input is a single Book, not an array
          if (Array.isArray(input)) {
            toast.danger("Caricare un solo libro alla volta");
            return;
          }

          // Gestione libro esistente - genera nuovo ID se duplicato
          const existingBook = CRUD.readAll().find((book) => book.id === input.id);
          if (existingBook) {
            input.id = CRUD.createId(); // genera nuovo ID per il libro caricato
          }
          const res = CRUD.addBook(input);

          if(!res) toast.danger("Errore durante il caricamento")
          toast.success("Libro caricato da JSON"); // Feedback
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
          const validatedBook = CRUD.validateBook(input);
          if (!validatedBook) return console.error("Formato non valido");

          CRUD.addBook(validatedBook);
          setBooks(CRUD.readAll()); // Aggiorna lo stato
          toast.success("Libro caricato da Markdown"); // Feedback
        } catch (err) {
          console.error("Errore durante l'upload markdown:", err);
        }
      },
    },
  };

  function findFirsted(book:Book) :{part:string, section:string} {
    return {
      part: book.parts?.[0].id || "", 
      section: book.parts?.[0].sections?.[0].id || ""
    };
  }

  return {
    ...CRUD,
    books,
    download: DOWNLOAD,
    upload: UPLOAD,
    loading,
    findFirsted
  };
}
