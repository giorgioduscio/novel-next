"use client";

import Link from "next/link";
import Navbar from "../shareds/navbar";
import { useEffect, useState } from "react";
import { Book, book_schema } from "../schemas/book_schema";
import { useBooks } from "../data/BookContext";
import { safeParse } from "valibot";
import Frag from "../shareds/Frag";
import { useEditMode } from "../data/EditModeContext";
import Field from "../shareds/Field";
import { UPLOAD } from "../tools/feedbacksUI";


export default function BooksComponents() {
  const { books, createBook, deleteBook, addBook, updateBook, download } = useBooks();
  const { editMode } = useEditMode();
  const [weight, setWeight] = useState(0);
  const [limit, setLimit] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setWeight(window.innerWidth);
      setLimit(Math.floor(window.innerWidth / 10));
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Funzione per eliminare un libro
  function handleDeleteBook(id: number, index:number) {
    if (!confirm("Rimuovere il libro?")) return;
    if (id !== -1){
      deleteBook(id);
      
    } else {
      const idMatch = books[index];
      if (!idMatch) throw new Error("Id o indice non vaalido");
      deleteBook(idMatch.id || -1);
    }
  };
  
  // crea un nuovo libro con valori predefiniti
  function handleCreateBook(){
    createBook({
      title: "Book - " + Date.now(),
      description: "Inserisci la descrizione",
      author: "Inserisci l'autore"
    });
  }


  // FORM 
  // modifica i campi dei singoli libri
  function handleChangebook(index: number, key: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const book = books[index];    
    if (!book || !book.id) throw new Error("Libro non valido");
    updateBook(book.id, { [key]: e.currentTarget.value });
  }



  const upload ={
    json: {
      label: 'JSON',
      async execute(){
        try {
          const input = await UPLOAD.json();
          const validateBook = safeParse(book_schema, input)
          if (!validateBook.success) return console.error("Dati non validi", validateBook.issues);
          
          addBook(validateBook.output);
        } catch (err) {
          console.error("Errore upload JSON:", err);
        }
      }
    },
    markdown: {
      label: 'MD',
      async execute() {
        try {
          const input = await UPLOAD.markdown() as string;

          const book :Book= {
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

          createBook(book);

        } catch (err) {
          console.error("Errore upload Markdown:", err);
        }
      }
    },
  }

  return (
    <main id="home">
      <Navbar />

      <section className="p-2 mx-auto container max-w-[400px]">

        {/* LIBRI */}
        <Frag if={books.length > 0} className="text-center">
          <Frag.Else>
            <div className="mt-20 text-red-400 text-center">
              <i className="bi bi-exclamation-triangle me-1"></i>
              <span>Nessun libro trovato</span>
            </div>
          </Frag.Else>

          {/* UPLOAD */}
          <div className="flex justify-center items-center gap-2">
            {Object.values(upload).map((uploadOption) => (
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

          <div className="my-5">
            <button onClick={handleCreateBook} 
                    className="w-full py-2 px-3 rounded bg-blue-600 hover:bg-blue-700 transition-colors">
              <i className="bi bi-plus-lg"></i>
              Aggiungi libro
            </button>
          </div>


          {/* LIBRI */}
          <ol className="flex flex-wrap gap-2 items-start">

            {/* LIBRO */}
            {books.map((book, book_i) => (
              <li key={book.id + book.title} className="flex-1 min-w-[150px]  rounded overflow-hidden border border-gray-400">
                <div className="text-center relative bg-white/10 hover:bg-white/30 transition-colors">

                  <div className="absolute top-0 right-0 w-fit">
                    <button onClick={() => handleDeleteBook(book.id || -1, book_i)} 
                            className="py-1 px-2 rounded bg-red-600 hover:bg-red-700 transition-colors truncate">
                      <i className="bi bi-trash-fill"></i>
                    </button>
                  </div>

                  <Frag if={editMode}>
                    {/* visualizzazione */}
                    <Frag.Else>
                      <Link href={`/book/${book.id}`} className="p-2 block">
                        <h4 className="text-center text-lg font-bold">{book.title}</h4>
                        <h6 className="text-center">{book.author}</h6>
                        <p className="text-center">{book.description}</p>
                      </Link>
                    </Frag.Else>

                    {/* modifica */}
                    <div className="p-2 block">
                      <Field  id={"title"} 
                              hide_label label={"Titolo del libro"} 
                              type={"text"} 
                              input_class="p-1 bg-white text-black border rounded text-center text-lg font-bold"
                              disabled={!editMode}
                              placeholder={"Inserisci il titolo"} 
                              value={book.title} 
                              onChange={e=> handleChangebook(book_i, "title", e)}
                      />
                      <Field  id={"author"} 
                              hide_label label={"Autore del libro"} 
                              type={"text"} 
                              input_class="p-1 bg-white text-black border rounded text-center"
                              disabled={!editMode}
                              placeholder={"Inserisci l'autore"} 
                              value={book.author} 
                              onChange={e=> handleChangebook(book_i, "author", e)}
                      />
                      <Field  id={"description"} 
                              hide_label label={"Descrizione del libro"} 
                              type={"textarea"} 
                              input_class="p-1 bg-white text-black border rounded text-center"
                              disabled={!editMode}
                              placeholder={"Inserisci la descrizione"} 
                              value={book.description} 
                              onChange={e=> handleChangebook(book_i, "description", e)}
                      />
                    </div>
                  </Frag>

                  {/* pulsante eliminazione */}
                  <div className="grid grid-cols-2 justify-between items-center">
                    <button onClick={() => download.json.execute(book.id || -1)}
                            className="p-1 bg-green-700 hover:bg-green-800 transition-colors truncate">
                      Json <i className="bi bi-download"></i>
                    </button>
                    <button onClick={() => download.md.execute(book.id || -1)}
                            className="p-1 bg-blue-700 hover:bg-blue-800 transition-colors truncate">
                      Markdown <i className="bi bi-download"></i>
                    </button>
                  </div>

                </div>
              </li>
            ))}
            {/* LIBRO */}
          </ol>

        </Frag>
      </section>
    </main>
  );
}