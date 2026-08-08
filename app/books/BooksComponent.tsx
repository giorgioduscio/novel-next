"use client";

import Link from "next/link";
import Navbar from "../shareds/navbar";
import { useEffect, useMemo, useState } from "react";
import { Book, book_schema } from "../schemas/book_schema";
import { useBooks } from "@/app/data/BookContext";
import { useEditMode } from "@/app/data/EditModeContext";
import { useAgreeWrapper } from "@/app/shareds/Agree";
import Frag from "../shareds/Frag";
import Field from "../shareds/Field";
import { ui_upload, toast } from "../tools/feedbacksUI";
import { LoadingComponent } from "../shareds/LoadingComponent";
import { safeParse } from "valibot";

export default function BooksComponents() {
  const BookContext = useBooks();
  const { isEditMode, isPageLoaded } = useEditMode();
  const agree = useAgreeWrapper();
  const [books, setbooks] = useState<Book[]>([]);

  useEffect(()=>{
    const allBooks = BookContext.readAll();
    setbooks(allBooks);    
  }, []);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const bookFeat ={
    // crea un nuovo libro con valori predefiniti
    create(){
      BookContext.createBook({
        title: "Book - " + Date.now(),
        description: "Inserisci la descrizione",
        author: "Inserisci l'autore"
      });
      setbooks(BookContext.readAll());
      toast.success("Libro creato");
    },

    // modifica i campi dei singoli libri
    update(index: number, key: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
      const book = books[index];    
      if (!book) throw new Error("Libro non valido");

      const newBook = {...book, [key]: e.currentTarget.value};
      
      // errori
      const validated = safeParse(book_schema, newBook);
      const newKey =`${book.id}>${key}`
      if (!validated.success){
        // aggiunge un campo d'errore
        const message = validated.issues?.[0].message
        setErrors(prev => ({...prev, 
          [newKey]: message
        }));
      } 
      
      else {
        // rimuove il campo con l'errore
        setErrors(prev => {
          const newErrors = {...prev};
          delete newErrors[newKey];
          return newErrors;
        });
        
        BookContext.updateBook(book.id, newBook);
        setbooks(BookContext.readAll());
      }
    },

    // Funzione per eliminare un libro
    async delete(id: number) {
      if (!(await agree.danger("Rimuovere il libro?", "Rimuovi"))) return;
      BookContext.deleteBook(id);
      setbooks(BookContext.readAll());
      toast.success("Libro rimosso");
    },
  }


  const uploadFeat ={
    json: {
      label: 'JSON',
      async execute(){
        try {
          const input = await ui_upload.json();
          const validateBook = safeParse(book_schema, input)
          if (!validateBook.success) return console.error("Dati non validi", validateBook.issues);
          
          BookContext.addBook(validateBook.output);
          setbooks(BookContext.readAll());
          toast.success("Libro caricato da JSON");
        } catch (err) {
          console.error("Errore upload JSON:", err);
        }
      }
    },
    markdown: {
      label: 'MD',
      async execute() {
        try {
          const input = await ui_upload.markdown() as string;

          const book :Book= {
            id: 0,
            title: "Inserire titolo",
            description: "Inserire descrizione",
            author: "Inserire autore",
            parts: [] as any[],
          };

          let currentPart: any = null;
          let currentSection: any = null;

          const lines = input  .split(/\r?\n/)  .map(l => l.trim());

          for (const line of lines) {
            if (!line) continue;

            // # Titolo libro
            if (line.startsWith("# ")) {
              book.title = line.substring(2).trim();
              continue;
            }

            // ## Parte
            if (line.startsWith("## ")) {
              currentPart = {
                title: line.substring(3).trim(),
                sections: []
              };

              book.parts?.push(currentPart);
              currentSection = null;
              continue;
            }

            // ### Sezione
            if (line.startsWith("### ")) {

              // Se non esiste ancora una parte, la creo
              if (!currentPart) {
                currentPart = {
                  title: "",
                  sections: []
                };
                book.parts?.push(currentPart);
              }

              currentSection = {
                title: line.substring(4).trim(),
                paragraphs: []
              };

              currentPart.sections.push(currentSection);
              continue;
            }

            // Testo
            if (!currentSection) {

              // Se manca una sezione la creo automaticamente
              if (!currentPart) {
                currentPart = {
                  title: "",
                  sections: []
                };
                book.parts?.push(currentPart);
              }

              currentSection = {
                title: "",
                paragraphs: []
              };

              currentPart.sections.push(currentSection);
            }

            currentSection.paragraphs.push({
              text: line
            });
          }

          BookContext.createBook(book);
          setbooks(BookContext.readAll());
          toast.success("Libro caricato da Markdown");

        } catch (err) {
          console.error("Errore upload Markdown:", err);
        }
      }
    },
  }

  if (!isPageLoaded) return <LoadingComponent/>

  return (
    <main id="home">
      <Navbar />

      <section className="p-2 mx-auto container max-w-[400px]">

        {/* LIBRI */}
        <div className="text-center">

          {/* UPLOAD */}
          <div className="flex justify-center items-center gap-2">
            {Object.values(uploadFeat).map((uploadOption) => (
              <button key={uploadOption.label}
                      onClick={uploadOption.execute}
                      className="py-2 px-3 text-sm rounded bg-black/50 hover:bg-black/70 transition-colors">
                <i className="mx-1 bi bi-upload"></i> 
                <span className="hidden sm:inline">Upload</span>
                <span>{uploadOption.label}</span>
              </button>
            ))}
          </div>


          {/* TITOLO */}
          <div className="my-5 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Libri</h1>
            <p className="text-gray-400">Totale: {books.length} libri</p>
          </div>

          <Frag if={isEditMode} className="my-5">
            <button onClick={bookFeat.create} 
                    className="w-full py-2 px-3 rounded bg-blue-600 hover:bg-blue-700 transition-colors">
              <i className="bi bi-plus-lg"></i>
              Crea Libro
            </button>
          </Frag>


          {/* LIBRI */}
          <Frag if={books.length > 0}>
            
            <Frag.Else>
              <div className="mt-20 text-red-400 text-center">
                <i className="bi bi-exclamation-triangle me-1"></i>
                <span>Nessun libro trovato</span>
              </div>
            </Frag.Else>

            {/* LIBRO */}
            <ol className="flex flex-wrap gap-2 items-start">
              {books.map((book, book_i) => (
                <li key={book.id + book.title} className="flex-1 min-w-[150px] rounded-lg overflow-hidden border border-gray-400">
                  <div className="text-center relative bg-white/10 hover:bg-white/30 transition-colors">

                    <div className="absolute top-0 right-0 w-fit">
                      <button onClick={() => bookFeat.delete(book.id)} 
                              className="py-1 px-2 rounded bg-red-600 hover:bg-red-700 transition-colors truncate">
                        <i className="bi bi-trash-fill"></i>
                      </button>
                    </div>

                    <Frag if={isEditMode}>
                      {/* visualizzazione */}
                      <Frag.Else>
                        <Link href={`/book/${book.id}`} className="p-2 block">
                          <h4 className="text-center text-lg font-bold">{book.title}</h4>
                          <h6 className="text-center">{book.author}</h6>
                          <p className="text-center">{book.description}</p>
                        </Link>
                      </Frag.Else>

                      {/* modifica */}
                      <Field  id={"title"} 
                              hide_label label={"Titolo del libro"} 
                              type={"text"} 
                              input_class="p-1 bg-white text-black outline text-center text-lg font-bold"
                              disabled={!isEditMode}
                              placeholder={"Inserisci il titolo"} 
                              value={book.title} 
                              onChange={e=> bookFeat.update(book_i, "title", e)}
                              error_message={errors[book.id + ">title"]}
                      />
                      <Field  id={"author"} 
                              hide_label label={"Autore del libro"} 
                              type={"text"} 
                              input_class="p-1 bg-white text-black outline text-center"
                              disabled={!isEditMode}
                              placeholder={"Inserisci l'autore"} 
                              value={book.author} 
                              onChange={e=> bookFeat.update(book_i, "author", e)}
                              error_message={errors[book.id + ">author"]}
                      />
                      <Field  id={"description"} 
                              hide_label label={"Descrizione del libro"} 
                              type={"textarea"} 
                              input_class="p-1 bg-white text-black outline text-center"
                              disabled={!isEditMode}
                              placeholder={"Inserisci la descrizione"} 
                              value={book.description} 
                              onChange={e=> bookFeat.update(book_i, "description", e)}
                              error_message={errors[book.id + ">description"]}
                      />  
                    </Frag>

                    {/* pulsanti */}
                    <Frag if={isEditMode}>
                      <Frag.Else>
                        <div className="grid grid-cols-2 justify-between items-center">
                          <button onClick={() => BookContext.download.json.execute(book.id)}
                                  className="p-1 bg-green-700 hover:bg-green-800 transition-colors truncate">
                            Json <i className="bi bi-download"></i>
                          </button>
                          <button onClick={() => BookContext.download.md.execute(book.id)}
                                  className="p-1 bg-blue-700 hover:bg-blue-800 transition-colors truncate">
                            Markdown <i className="bi bi-download"></i>
                          </button>
                        </div>
                      </Frag.Else>

                      <Link href={`/book/${book.id}`} 
                            className="py-1 px-2 bg-green-600 hover:bg-green-700 transition-colors block">
                        Vai al libro
                        <i className="bi bi-chevron-right ms-2"></i>
                      </Link>
                    </Frag>
                    {/* pulsanti */}

                  </div>
                </li>
              ))}
            </ol>
            {/* LIBRO */}
          </Frag>

        </div>
      </section>
    </main>
  );
}