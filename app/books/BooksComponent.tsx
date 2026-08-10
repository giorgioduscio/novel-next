"use client";

import { useEffect, useState } from "react";
import { Book, book_schema } from "../schemas/book_schema";
import { useBooks } from "@/app/data/BookContext";
import { useEditMode } from "@/app/data/EditModeContext";
import { useAgreeWrapper } from "@/app/shareds/Agree";
import { ui_upload, toast } from "../tools/feedbacksUI";
import { safeParse } from "valibot";
import BooksTemplate from "./BooksTemplate";

export default function BooksComponent() {
  const hookData = useBooksComponent();
  return <BooksTemplate {...hookData} />;
}


export function useBooksComponent() {
  const BookContext = useBooks();
  const { isEditMode, isPageLoaded } = useEditMode();
  const agree = useAgreeWrapper();
  const [books, setbooks] = useState<Book[]>([]);

  // 1) ERRORI
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 2) LIBRI
  useEffect(() => {
    setbooks(BookContext.readAll());
  }, [BookContext]);

  const bookFeat = {
    // Crea un nuovo libro con valori predefiniti
    create() {
      BookContext.createBook({
        title: "Book_" + Date.now(),
        description: "Descrizione_" + Date.now(),
        author: "Autore_" + Date.now(),
      });

      setbooks(BookContext.readAll());
      toast.success("Libro creato");
    },

    // Aggiorna un libro esistente
    update(
      index: number,
      key: string,
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) {
      const book = books[index];

      if (!book) throw new Error("Libro non valido");

      // Crea una copia del libro con il campo aggiornato
      const newBook = {
        ...book,
        [key]: e.currentTarget.value,
      };

      // Valida il libro aggiornato
      const validated = safeParse(book_schema, newBook);
      const newKey = `${book.id}>${key}`;

      if (!validated.success) {
        // Gestisce gli errori di validazione
        const message = validated.issues?.[0]?.message;

        setErrors((prev) => ({
          ...prev,
          [newKey]: message,
        }));

        return;
      }

      // Rimuove l'errore se la validazione ha successo
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[newKey];
        return newErrors;
      });

      // Aggiorna il libro nel contesto
      BookContext.updateBook(book.id, newBook);
      setbooks(BookContext.readAll());
    },

    // Elimina un libro dopo conferma
    async delete(id: number) {
      if (!(await agree.danger("Rimuovere il libro?", "Rimuovi"))) return;

      BookContext.deleteBook(id);
      setbooks(BookContext.readAll());
      toast.success("Libro rimosso");
    },
  };

  // 3) UPLOAD
  const uploadFeat = {
    json: {
      label: "JSON",

      // Carica un libro da un file JSON
      async execute() {
        try {
          const input = await ui_upload.json();
          const validateBook = safeParse(book_schema, input);

          if (!validateBook.success) {
            return console.error(
              "Dati non validi",
              validateBook.issues
            );
          }

          BookContext.addBook(validateBook.output);
          setbooks(BookContext.readAll());
          toast.success("Libro caricato da JSON");
        } catch (err) {
          console.error("Errore upload JSON:", err);
        }
      },
    },

    markdown: {
      label: "MD",

      // Carica un libro da un file Markdown
      async execute() {
        try {
          const input = (await ui_upload.markdown()) as string;

          // Struttura base del libro
          const book: Book = {
            id: 0,
            title: "Inserire titolo",
            description: "Inserire descrizione",
            author: "Inserire autore",
            parts: [],
          };

          let currentPart: any = null;
          let currentSection: any = null;

          // Elabora ogni riga del file Markdown
          const lines = input.split(/\r?\n/).map((l) => l.trim());

          for (const line of lines) {
            if (!line) continue;

            // Gestisce il titolo del libro
            if (line.startsWith("# ")) {
              book.title = line.substring(2).trim();
              continue;
            }

            // Gestisce le parti del libro
            if (line.startsWith("## ")) {
              currentPart = {
                title: line.substring(3).trim(),
                sections: [],
              };

              book.parts?.push(currentPart);
              currentSection = null;
              continue;
            }

            // Gestisce le sezioni delle parti
            if (line.startsWith("### ")) {
              if (!currentPart) {
                currentPart = {
                  title: "",
                  sections: [],
                };

                book.parts?.push(currentPart);
              }

              currentSection = {
                title: line.substring(4).trim(),
                paragraphs: [],
              };

              currentPart.sections.push(currentSection);
              continue;
            }

            // Gestisce i paragrafi delle sezioni
            if (!currentSection) {
              if (!currentPart) {
                currentPart = {
                  title: "",
                  sections: [],
                };

                book.parts?.push(currentPart);
              }

              currentSection = {
                title: "",
                paragraphs: [],
              };

              currentPart.sections.push(currentSection);
            }

            currentSection.paragraphs.push({
              text: line,
            });
          }

          BookContext.createBook(book);
          setbooks(BookContext.readAll());
          toast.success("Libro caricato da Markdown");
        } catch (err) {
          console.error("Errore upload Markdown:", err);
        }
      },
    },
  };

  // Restituisce i dati e le funzionalità per il template
  return {
    books,
    errors,
    isEditMode,
    isPageLoaded,
    BookContext,
    bookFeat,
    uploadFeat,
  };
}