"use client";

import Link from "next/link";
import Navbar from "../shareds/navbar";
import { useEffect, useMemo, useState } from "react";
import { Book, book_schema } from "../schemas/book_schema";
import { useBooks } from "../data/BookContext";
import { safeParse } from "valibot";
import Frag from "../shareds/Frag";
import { useEditMode } from "../data/EditModeContext";
import Field from "../shareds/Field";
import { UPLOAD } from "../tools/feedbacksUI";


export default function Home() {
  const { books, createBook, deleteBook, addBook, download } = useBooks();
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
  const handleDeleteBook = (id?: number) => {
    if (!confirm("Rimuovere il libro?")) return;
    if (id == undefined) return;
    deleteBook(id);
  };

  function ellipsis(text: string) {
    return weight > 350 ? text : text.slice(0, limit) + "...";
  }


  // FORM 
  const { editMode } = useEditMode();
  // stato iniziale del form
  const form_start ={
    title:       {value: "", label:"Titolo", placeholder:"Inserisci il titolo", type:"text"},
    description: {value: "", label:"Descrizione", placeholder:"Inserisci la descrizione", type: "textarea"},
    author:      {value: "", label:"Autore", placeholder:"Inserisci l'autore", type:"text"},
  };
  
  const [form_value, form_setValue] = useState(form_start);
  const [form_submitOnce, form_setSubmitOnce] = useState(false);

  // crea un nuovo oggetto validato
  const form_newBook = useMemo(()=>{
    const result = {} as typeof form_value;
    Object.entries(form_value).forEach(([key, value]) => {
      (result as any)[key] = value.value;
    });
    return safeParse(book_schema, result);
  }, [form_value]);
  
  // crea oggetti di stringhe per gli errori
  const form_errors: { [k: string]: string } = useMemo(() => {
    let result = {};
    form_newBook.issues?.forEach((issue) => {
      const path = (issue as any).path[0].key;
      (result as any)[path] = issue.message;
    });
    return result;
  }, [form_newBook]);
  
  function form_reset() {
    form_setSubmitOnce(false);
    form_setValue(form_start);
  }

  function form_handleChange(key:string, value:string) {
    form_setValue({ ...form_value, [key]: { ...(form_value as any)[key], value } })
  }

  function form_handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    form_setSubmitOnce(true);

    if (!form_newBook.success) return;
    createBook(form_newBook.output);
    form_reset();
  }

  const upload ={
    json: {
      label: 'Upload (.json)',
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
      label: 'Upload (.md)',
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
        {/* FORM */}
        <Frag if={editMode} className="bg-black/20 p-3 rounded-lg">
          <h2 className="py-3 text-2xl text-center">Aggiungi libro</h2>
          <p className="text-sm text-center">
            I campi contrassegnati con <b className="text-red-500">*</b> sono obbligatori
          </p>

          <form onSubmit={form_handleSubmit} className="">
            {Object.entries(form_value).map(([key, obj]) => (
              <div key={key} className="my-3">
                <Field id={key} 
                       label={key.charAt(0).toUpperCase() + key.slice(1)} 
                       type={obj.type || "text"} 
                       placeholder={obj.placeholder} 
                       value={String(obj.value)} 
                       input_class="py-1 px-2 w-full bg-white text-black rounded"
                       error_message={form_submitOnce ? (form_errors[key] || "") : ""}
                       onChange={(value) => form_handleChange(key, value)}
                />
              </div>
            ))}

            <div className="grid grid-cols-2 rounded overflow-hidden">
              <button type="submit" className="p-2 bg-green-700 hover:bg-green-800 transition-colors">
                <i className="me-1 bi bi-plus-lg"></i>
                <span>Aggiungi</span>
              </button>
              <button type="button"
                      className="p-2 bg-red-700 hover:bg-red-800 transition-colors"
                      onClick={() => form_reset()}>
                <i className="me-1 bi bi-x-lg"></i>
                <span>Reset</span>
              </button>
            </div>

          </form>
        </Frag>


        {/* LIBRI */}
        <Frag if={books.length > 0} className="text-center">
          <Frag.Else>
            <div className="mt-20 text-red-400 text-center">
              <i className="bi bi-exclamation-triangle me-1"></i>
              <span>Nessun libro trovato</span>
            </div>
          </Frag.Else>

          {/* UPLOAD */}
          <div className="py-3 flex justify-center items-center gap-2">
            {Object.values(upload).map((uploadOption) => (
              <button key={uploadOption.label}
                      onClick={uploadOption.execute}
                      className="py-2 px-3 text-sm rounded bg-black/50 hover:bg-black/70 transition-colors">
                <i className="me-1 bi bi-upload"></i> 
                {uploadOption.label}
              </button>
            ))}
          </div>


          {/* TITOLO */}
          <div className="my-5">
            <h1 className="text-2xl font-bold">Libri</h1>
            <p className="text-gray-400">Totale: {books.length} libri</p>
          </div>


          {/* LIBRI */}
          <ol className="flex flex-wrap gap-2">
            {books.map((book) => (
              <li key={book.id} className="flex-1 min-w-[150px]  rounded overflow-hidden border border-gray-400">
                <div className="text-center relative bg-white/10 hover:bg-white/30 transition-colors">

                  <div className="absolute top-0 right-0 w-fit">
                    <button onClick={() => handleDeleteBook(book.id)} 
                            className="py-1 px-2 rounded bg-red-600 hover:bg-red-700 transition-colors truncate">
                      <i className="bi bi-trash-fill"></i>
                    </button>
                  </div>

                  <Link href={`/book/${book.id}`} className="p-2 block">
                    <h4 className="font-bold">{book.title}</h4>
                    <p className="pb-2 mb-2 border-b border-gray-500 italic text-xs">
                      By "{book.author}"
                    </p>

                    <p className="text-sm">{ellipsis(book.description)}</p>
                  </Link>

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
          </ol>

        </Frag>
      </section>
    </main>
  );
}