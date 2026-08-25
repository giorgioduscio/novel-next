import { useState, useEffect, useMemo } from "react";
import { safeParse } from "valibot";
import useAuth from "../auth/useAuth";
import { useBookContext } from "../data/BookContext";
import { useCommonPagesContext } from "../data/CommonPagesContext";
import { Book, book_schema } from "../schemas/book_schema";
import { useAgreeWrapper } from "../shareds/Agree";
import { useDot } from "../tools/customStates";
import { toast } from "../tools/feedbacksUI";

export function useBooksComponent() {
  const BookHook = useBookContext();
  const page = useCommonPagesContext();
  const agree = useAgreeWrapper();
  const auth = useAuth();
  const { canRead, canWrite } = auth;

  
  // 1) LIBRI
  const [books, setbooks] = useState<Book[]>([]);
  useEffect(() => {
    // trova tutti i libri per cui ha un codice di lettura
    const booksMatch = BookHook.readAll().filter(_book=> {
      const res = canRead(_book)      
      return res
    });
    setbooks(booksMatch);   
  }, [BookHook.books]);

  const BOOKS = {
    // Crea un nuovo libro con valori predefiniti
    create() {
      // aggiornamento stato
      const clone = structuredClone(books);
      clone.unshift({
        id: crypto.randomUUID(),
        title: "",
        description: "",
        author_name: "",
        auth_read: "",
        auth_write: "",
      });
      setbooks(clone);

      // feedback utente
      toast.success("Libro creato");
    },

    // Aggiorna un libro esistente
    update(index: number, key: keyof Book, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
      // validazione
      const book = books[index];
      if (!book) throw new Error("Libro non valido");

      // Crea una copia del libro con il campo aggiornato
      const newBook = structuredClone({ ...book, [key]: e.currentTarget.value });

      // Aggiorna il libro nel contesto
      setbooks(prev=> prev.map(_book=> _book.id === book.id ? newBook : _book));

      // aggiorna database (se non esiste, crea, altrimenti aggiorna)
      const isPresent = BookHook.books.find(_book=> _book.id === book.id);
      const result =(!!isPresent) 
        ? BookHook.updateBook(book.id, newBook)
        : BookHook.addBook(newBook);
        
      // feedback utente
      if(!result) return toast.danger("Errore nell'aggiornamento del libro");
      toast.success("Libro aggiornato");
    },

    // Elimina un libro dopo conferma
    async delete(id: string) {
      if (!(await agree.danger("Rimuovere il libro?", "Rimuovi"))) return;
      // aggiorna lo stato
      setbooks(BookHook.readAll());
      // elimina il libro
      const res = BookHook.deleteBook(id);
      if (!res) return toast.danger("Errore nell'eliminazione del libro");
      // feedback utente
      toast.success("Libro rimosso");
    },

    deleteTargets: useDot<string[]>([]),

    toggleTarget(id: string){
      const current = BOOKS.deleteTargets.get();
      if(current.includes(id)){
        BOOKS.deleteTargets.set(current.filter(i => i !== id))
      } else {
        BOOKS.deleteTargets.set([...current, id])
      }
    },

    async deleteMany() {
      const targets = BOOKS.deleteTargets.get();
      if(!targets.length) return console.error("Nessun target selezionato");

      if(!(await agree.danger(`Rimuovere '${targets.length}' libri?`, "Rimuovi"))) return;

      // elimina i libri dal database
      const results = targets.map(id => BookHook.deleteBook(id));
      if(results.some(res => !res)) return toast.danger("Eliminazione fallita");

      // aggiorna lo stato
      const updated = books.filter(book => !targets.includes(book.id));
      setbooks(updated);
      BOOKS.deleteTargets.set([]);

      // feedback     
      toast.success('Libri rimossi');
    },
  };

  
  // 2) ERRORI
  const errors = useMemo(()=>{
    const result :Record<string, string> ={}

    for (let i = 0; i < books.length; i++) {
      const book = structuredClone(books[i]);
      delete book.parts
      const validated = safeParse(book_schema, book);
      if(validated.success) continue;
      
      for (const issue of validated.issues) {
        const [key, message] = issue.message.split(": ");
        result[`${book.id}>${key}`] = message || "Errore di validazione";
      }
    }
        
    return result
  }, [books])

  // Restituisce i dati e le funzionalità per il template
  return {
    books,
    errors,
    page,
    BookHook,
    BOOKS,
    deleteTargets: BOOKS.deleteTargets,
    auth,
    canRead, canWrite
  };
}