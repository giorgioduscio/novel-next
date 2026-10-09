"use client";

import { useState, useEffect, useMemo } from "react";
import { Book, book_schema } from "../schemas/book_schema";
import * as v from "valibot";
import { nanoid } from "nanoid";
import { ui_upload, ui_download, debounce, toast } from "../tools/feedbacksUI";
import { sanitizeAccessCode, isValidAccessCode } from "@/lib/security";
import { generateContext, useDotNotation } from "../tools/reactCustomization";
import {
  saveBookLocally,
  saveAllBooksLocally,
  getAllBooksLocally,
  deleteBookLocally,
  addToSyncQueue,
  removeFromSyncQueue,
  getSyncQueue,
  isOnline,
  onNetworkChange,
} from "@/lib/offlineStorage";

const FIREBASE_URL = "https://books-3e4c3-default-rtdb.europe-west1.firebasedatabase.app/books";

/**
 * Generates a secure random key for authentication
 * @returns A random string of 16 characters
 */
export function generateSecureKey(): string {
  return Math.random().toString(36).slice(2, 18);
}

// Gestione del localStorage per la lista libri
const LOCAL_BOOK_LIST = {
  book_list_title: "book_list",
  get(): string[] {
    if (typeof window === "undefined") return [];
    try {
      const res = localStorage.getItem(this.book_list_title);
      return res ? JSON.parse(res) : [];
    } catch (error) {
      console.error("Errore nel parsing della lista libri:", error);
      return [];
    }
  },
  set(bookList: string[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(this.book_list_title, JSON.stringify(bookList));
    } catch (error) {
      console.error("Errore nel salvataggio della lista libri:", error);
    }
  },
};

// Servizio API separato dal ciclo di vita del hook
const API_SERVICE = {
  async saveSingleBook(book: Book, showFeedback = false): Promise<boolean> {
    try {
      const response = await fetch(`${FIREBASE_URL}/${book.id}.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(book),
      });
      if (!response.ok) {
        console.error("Salvataggio non riuscito:", response.statusText);
        if (showFeedback) toast.danger("Errore nel salvataggio su server");
        return false;
      }
      if (showFeedback) toast.success("Salvataggio completato");
      return true;
    } catch (error) {
      console.warn("Rete non disponibile durante salvataggio:", error);
      if (showFeedback) toast.info("Salvato in locale (offline)");
      return false;
    }
  },

  saveDebounced: debounce(function (book: Book, showFeedback = false) {
    console.warn("debounce");
    return API_SERVICE.saveSingleBook(book, showFeedback);
  }, 300),

  async deleteSingleBook(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${FIREBASE_URL}/${id}.json`, {
        method: "DELETE",
      });
      if (!response.ok) {
        console.error("Eliminazione non riuscita:", response.statusText);
        return false;
      }
      return true;
    } catch (error) {
      console.warn("Rete non disponibile durante eliminazione:", error);
      return false;
    }
  },
};

function bookContextValue() {
  const [books, setBooks] = useState<Book[]>([]);
  const isBookLoaded = useDotNotation(false);
  const isSaving = useDotNotation(false);
  const isOnlineState = useDotNotation(isOnline());
  const pendingSyncCount = useDotNotation(0);
  const [target, setTarget] = useState<Book | undefined>(undefined);
  const bookList = useDotNotation<string[]>([]);

  // Sincronizzazione modifiche offline verso Firebase
  async function syncNow(): Promise<void> {
    if (!isOnline()) return;
    const queue = await getSyncQueue();
    if (queue.length === 0) {
      pendingSyncCount.set(0);
      return;
    }

    isSaving.set(true);
    let syncedCount = 0;
    try {
      for (const item of queue) {
        if (item.action === "save" && item.book) {
          const success = await API_SERVICE.saveSingleBook(item.book);
          if (success) {
            await removeFromSyncQueue(item.id);
            syncedCount++;
          }
        } else if (item.action === "delete") {
          const success = await API_SERVICE.deleteSingleBook(item.id);
          if (success) {
            await removeFromSyncQueue(item.id);
            syncedCount++;
          }
        }
      }
      const remaining = await getSyncQueue();
      pendingSyncCount.set(remaining.length);
      if (syncedCount > 0) {
        toast.success(`Sincronizzazione completata (${syncedCount} modifich${syncedCount === 1 ? "a" : "e"})`);
      }
    } catch (err) {
      console.error("Errore durante la sincronizzazione:", err);
    } finally {
      isSaving.set(false);
    }
  }

  // Carica i libri all'avvio in modalità Offline-First
  useEffect(() => {
    let mounted = true;
    async function initBooks() {
      try {
        // 1. Carica istantaneamente dalla cache locale (IndexedDB)
        const localBooks = await getAllBooksLocally();
        if (mounted && localBooks && localBooks.length > 0) {
          const validated = localBooks
            .map((b) => validateBook(b))
            .filter((b): b is Book => b !== null);
          setBooks(validated);
          isBookLoaded.set(true);
        }
      } catch (err) {
        console.warn("Errore lettura cache locale:", err);
      }

      // 2. Controlla la coda di sincronizzazione
      try {
        const queue = await getSyncQueue();
        if (mounted) pendingSyncCount.set(queue.length);
      } catch {}

      // 3. Se online, carica da Firebase e sincronizza eventuali modifiche pendenti
      if (isOnline()) {
        await API.loadBooks();
        await syncNow();
      } else {
        if (mounted) isBookLoaded.set(true);
      }
    }

    initBooks();
    return () => {
      mounted = false;
    };
  }, []);

  // Ascolta lo stato della connessione per auto-sync
  useEffect(() => {
    const unsubscribe = onNetworkChange(async (online) => {
      isOnlineState.set(online);
      if (online) {
        toast.info("Connessione ripristinata: avvio sincronizzazione...");
        await syncNow();
      } else {
        toast.warning("Sei offline: le modifiche verranno salvate localmente");
      }
    });
    return unsubscribe;
  }, []);

  // Sincronizza la lista libri con localStorage all'avvio
  useEffect(() => {
    bookList.set(LOCAL_BOOK_LIST.get());
  }, []);

  // Sincronizza tra tab tramite storage event
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === LOCAL_BOOK_LIST.book_list_title) {
        bookList.set(LOCAL_BOOK_LIST.get());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Valida un libro usando Valibot
  function validateBook(book: unknown): Book | null {
    try {
      // Migrazione automatica per paragrafi senza ex_style e scripted_style
      if (book && typeof book === "object") {
        const bookObj = book as any;
        if (bookObj.parts) {
          bookObj.parts.forEach((part: any) => {
            if (part.sections) {
              part.sections.forEach((section: any) => {
                if (section.paragraphs) {
                  section.paragraphs.forEach((paragraph: any) => {
                    // Se in_style non esiste, inizializzalo
                    if (paragraph.in_style === undefined) {
                      paragraph.in_style = "";
                    }
                    // Se ex_style non esiste, inizializzalo
                    if (paragraph.ex_style === undefined) {
                      paragraph.ex_style = "";
                    }
                    // Se scripted_style non esiste, inizializzalo
                    if (paragraph.scripted_style === undefined) {
                      paragraph.scripted_style = "";
                    }
                    // Se isMarcked non esiste, inizializzalo
                    if (paragraph.isMarcked === undefined) {
                      paragraph.isMarcked = false;
                    }
                  });
                }
              });
            }
          });
        }
      }

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

  const saveDebounced = useMemo(() => {
    return debounce(async (book: Book, showFeedback = false) => {
      if (!isOnline()) {
        await addToSyncQueue({ id: book.id, action: "save", book, timestamp: Date.now() });
        const q = await getSyncQueue();
        pendingSyncCount.set(q.length);
        if (showFeedback) toast.info("Salvato localmente (offline)");
        return;
      }

      isSaving.set(true);
      try {
        const success = await API_SERVICE.saveSingleBook(book, showFeedback);
        if (!success) {
          await addToSyncQueue({ id: book.id, action: "save", book, timestamp: Date.now() });
          const q = await getSyncQueue();
          pendingSyncCount.set(q.length);
        } else {
          await removeFromSyncQueue(book.id);
          const q = await getSyncQueue();
          pendingSyncCount.set(q.length);
        }
      } finally {
        isSaving.set(false);
      }
    }, 300);
  }, []);

  // Oggetto API
  const API = {
    URL: FIREBASE_URL,
    async saveSingleBook(book: Book, showFeedback = false) {
      if (!isOnline()) {
        await addToSyncQueue({ id: book.id, action: "save", book, timestamp: Date.now() });
        const q = await getSyncQueue();
        pendingSyncCount.set(q.length);
        if (showFeedback) toast.info("Salvato localmente (offline)");
        return false;
      }

      isSaving.set(true);
      try {
        const success = await API_SERVICE.saveSingleBook(book, showFeedback);
        if (!success) {
          await addToSyncQueue({ id: book.id, action: "save", book, timestamp: Date.now() });
          const q = await getSyncQueue();
          pendingSyncCount.set(q.length);
        }
        return success;
      } finally {
        isSaving.set(false);
      }
    },
    saveDebounced,
    deleteSingleBook: API_SERVICE.deleteSingleBook,

    async loadBooks() {
      try {
        if (!isOnline()) {
          const local = await getAllBooksLocally();
          if (local.length > 0) {
            setBooks(local.map((b) => validateBook(b)).filter((b): b is Book => b !== null));
          }
          isBookLoaded.set(true);
          return;
        }

        const response = await fetch(`${FIREBASE_URL}.json`);
        if (!response.ok) {
          console.error("Caricamento non riuscito", response.status);
          return;
        }

        const data = await response.json();
        let booksArray: Book[] = [];

        if (data) {
          const rawBooks = Array.isArray(data) ? data : Object.values(data);
          booksArray = rawBooks
            .filter(function (b) { return Boolean(b && typeof b === "object"); })
            .map(function (b) { return validateBook(b); })
            .filter(function (b): b is Book { return b !== null; });
        }

        // Preserva i libri che hanno modifiche offline in sospeso
        const queue = await getSyncQueue();
        const queuedIds = new Set(queue.map((q) => q.id));

        setBooks(function (prevBooks) {
          return booksArray.map(function (remoteBook) {
            if (queuedIds.has(remoteBook.id)) {
              const localBook = prevBooks.find(function (p) { return p.id === remoteBook.id; });
              return localBook || remoteBook;
            }
            return remoteBook;
          });
        });

        // Salva in cache IndexedDB
        await saveAllBooksLocally(booksArray);
      } catch (error) {
        console.warn("Errore nel caricamento delle api:", error);
        const local = await getAllBooksLocally();
        if (local.length > 0) {
          setBooks(local.map(function (b) { return validateBook(b); }).filter(function (b): b is Book { return b !== null; }));
        }
      } finally {
        isBookLoaded.set(true);
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

    // Cerca un libro per ID
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
      saveBookLocally(validatedBook);

      if (isOnline()) {
        API.saveSingleBook(validatedBook);
      } else {
        addToSyncQueue({ id: validatedBook.id, action: "save", book: validatedBook, timestamp: Date.now() });
        pendingSyncCount.set((prev) => prev + 1);
      }
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
    updateBook: function (id: string, updatedBook: Partial<Book>, validation = true, showFeedback = false): Book | null {
      const stored = this.getBookById(id);
      if (!stored) {
        console.error("Libro non trovato");
        return null;
      }

      const merged = { ...stored, ...updatedBook };
      const validatedBook = validation ? this.validateBook(merged as Book) : (merged as Book);
      if (!validatedBook) return null;

      // 1. Aggiorna lo stato React
      setBooks(function (prevBooks) {
        return prevBooks.map(function (book) {
          return book.id === id ? validatedBook : book;
        });
      });

      // 2. Persisti IMMEDIATAMENTE nel database locale IndexedDB
      saveBookLocally(validatedBook);

      // 3. Salva su server con debounce se online, altrimenti accoda
      if (isOnline()) {
        API.saveDebounced(validatedBook, showFeedback);
      } else {
        addToSyncQueue({ id: validatedBook.id, action: "save", book: validatedBook, timestamp: Date.now() });
        getSyncQueue().then((q) => pendingSyncCount.set(q.length));
        if (showFeedback) toast.info("Salvato localmente (offline)");
      }

      return validatedBook;
    },

    // Elimina un libro
    deleteBook: function (id: string): boolean {
      setBooks(function (prevBooks) {
        return prevBooks.filter(function (book) { return book.id !== id; });
      });
      deleteBookLocally(id);
      if (isOnline()) {
        API.deleteSingleBook(id);
      } else {
        addToSyncQueue({ id, action: "delete", timestamp: Date.now() });
        getSyncQueue().then((q) => pendingSyncCount.set(q.length));
      }
      return true;
    },
  };

  // Funzioni per gestire la lista locale dei libri
  const bookListManager = {
    addBookToList(bookId: string): void {
      bookList.set((prev) => {
        if (prev.includes(bookId)) return prev;
        const next = [...prev, bookId];
        LOCAL_BOOK_LIST.set(next);
        return next;
      });
    },

    removeBookFromList(bookId: string): void {
      bookList.set((prev) => {
        const next = prev.filter((id) => id !== bookId);
        LOCAL_BOOK_LIST.set(next);
        return next;
      });
    },

    isInBookList(bookId: string): boolean {
      return bookList.get.includes(bookId);
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
    isBookLoaded,
    isSaving,
    isOnline: isOnlineState,
    pendingSyncCount,
    syncNow,
    ...CRUD,
    download,
    upload,
    findFirsted,
    target,
    setTarget,
    verifyAccessCode,
    ...bookListManager,
  };
}

export const {
  provider: BookProvider,
  context: useBookContext
} = generateContext(bookContextValue);