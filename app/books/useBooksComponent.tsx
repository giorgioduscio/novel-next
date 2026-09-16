import { useEffect } from "react";
import { useBookContext } from "../data/BookContext";
import { Book } from "../schemas/book_schema";
import { toast } from "../tools/feedbacksUI";
import { useDotNotation } from "../tools/reactCustomization";
import { useAgreeWrapper } from "../shareds/Agree";

export function useBooksComponent() {
  const bookContext = useBookContext();
  const agree = useAgreeWrapper();

  class BooksFeatures {
    constructor() {
      this.createVoidBook = this.createVoidBook.bind(this);
      this.addToList = this.addToList.bind(this);
      this.removeFromList = this.removeFromList.bind(this);
      this.isInList = this.isInList.bind(this);
      
      // Carica tutti i libri disponibili
      useEffect(() => {
        const allBooks = bookContext.readAll();
        this.books.set(allBooks);
      }, [bookContext.books]);
    }

    // 1) LIBRI
    books = useDotNotation<Book[]>([]);
    searchQuery = useDotNotation("");

    // Filtra i libri in base alla ricerca e alla lista locale
    get filteredBooks() {
      const isSearching = this.searchQuery.get.trim().length > 0;
      const query = this.searchQuery.get.toLowerCase();
      
      return this.books.get.filter(book => {
        const matchesSearch = !isSearching || 
          book.title.toLowerCase().includes(query) || 
          book.author_name.toLowerCase().includes(query);
        
        const isInList = bookContext.isInBookList(book.id);
        
        // Mostra il libro se è nella lista locale OR se l'utente sta cercando
        return matchesSearch && (isInList || isSearching);
      });
    }

    // Crea un nuovo libro con valori predefiniti e reindirizza alla pagina structure
    async createVoidBook() {
      const newBookId = bookContext.createId();
      
      // Crea il libro con valori di default
      const newBook = {
        id: newBookId,
        title: "inserire_titolo",
        description: "",
        author_name: "inserire_autore",
        auth_read: "",
        auth_write: "",
        parts: [],
      };
      
      // Salva il libro
      const result = bookContext.addBook(newBook);
      
      if (!result) {
        toast.danger("Errore nella creazione del libro");
        return;
      }
      
      // Aggiungi alla lista locale
      bookContext.addBookToList(newBookId);
      
      // Reindirizza alla pagina structure
      window.location.href = `/books/${newBookId}/structure`;
    }

    // Aggiunge un libro alla lista locale
    addToList(bookId: string) {
      bookContext.addBookToList(bookId);
      toast.success("Libro aggiunto alla lista");
    }

    // Rimuove un libro dalla lista locale
    async removeFromList(bookId: string) {
      const book = bookContext.getBookById(bookId);
      if (!book) return console.error("libro non trovato");

      const confirmed = await agree.danger(`Sicuro di rimuovere "${book.title}" dalla lista?`, "Rimuovi");
      if (confirmed) {
        bookContext.removeBookFromList(bookId);
        toast.success("Libro rimosso dalla lista");
      }
    }

    // Verifica se un libro è nella lista locale
    isInList(bookId: string): boolean {
      return bookContext.isInBookList(bookId);
    }
  }

  return new BooksFeatures();
}