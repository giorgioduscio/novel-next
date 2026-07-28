"use client";

import Link from "next/link";
import type { Book, Section } from "../../schemas/_book_schema";
import React, { useEffect, useMemo, useState } from "react";
import { books_store } from "../../data/books_store";
import Frag from "@/app/shareds/Frag";
import { useEditMode } from "@/app/data/EditModeContext";

interface BookProps {
  id: number;
}

export default function Book({ id }: BookProps) {
  const [book, setBook] = useState<Book | undefined>(undefined);
  const [isLoaded, setIsLoaded] = useState(false);
  const { editMode } = useEditMode();

  useEffect(() => {
    if (!isNaN(id)) {
      setBook(books_store.getBookById(id));
    }
    setIsLoaded(true);
  }, [id]);

  function href(book_id: number, part: string, section: string) {
    part = part.replaceAll(" ", "-");
    section = section.replaceAll(" ", "-");
    return `/book/${book_id}/${part}/${section}`;
  }

  function deleteSection(part_i: number, section_i: number) {
    if(!confirm("Sei sicuro di voler eliminare questa sezione?")) return;
    if(!book || !book.parts || !book.parts[part_i]) 
      return console.error("Libro non esistente o parte non trovata");
    
    // Rimuovi la sezione dall'array
    book.parts[part_i].sections.splice(section_i, 1);

    // se la parte è rimasta senza sezioni, rimuovila
    if(book.parts[part_i].sections.length === 0){
      book.parts.splice(part_i, 1);
    }

    books_store.updateBook(id, book);
    setBook({ ...book });
  }

  // FORM
  const [form_value, form_setValue] = useState({
    part:{    value: "", label:"Parte",   placeholder: "Inserire o ripetere" },
    section:{ value: "", label:"Sezione", placeholder: "Sezione" },
  });

  const form_value_array = useMemo(() => Object.entries(form_value)
    .map(([key, obj]) => ({...obj, key}))
  , [form_value]);

  function form_reset(){
    form_setValue((prev) => ({
      ...prev,
      part:{    value: "", label:"Parte",   placeholder: "Inserire o ripetere" },
      section:{ value: "", label:"Sezione", placeholder: "Sezione" },
    }));
  }

  // inserisce la nuova sezione nel libro
  function form_submit(e: React.FormEvent) {    
    e.preventDefault(); // Evita il ricaricamento della pagina
    if(!book) return console.error("Libro non esistente");

    // 1. Controlla che la parte esista già o se è nuova 
    const newPart = form_value.part.value.trim();
    const exixtinPart = book?.parts?.find(part => part.title.toLowerCase() === newPart.toLowerCase());
    
    // La parte esiste già    
    if(exixtinPart){
      // aggiunge la sezione alla parte esistente
      exixtinPart.sections.push({
        title: form_value.section.value.trim(),
        paragraphs: []
      })
    } else {
      // crea una nuova parte
      book?.parts?.push({
        title: newPart,
        sections: [{
          title: form_value.section.value.trim(),
          paragraphs: []
        }]
      })
    }

    // 5. Aggiorna il libro nello store e nello stato locale
    books_store.updateBook(id, book);
    setBook(book); // Aggiorna lo stato locale per riflettere le modifiche

    // 6. Resetta il form
    form_reset();
  }

  // caricamento
  if (!isLoaded) return <main className="mx-auto container max-w-[400px] p-8 text-center text-gray-400">Caricamento...</main>

  return (
    <>
      {/* NAVBAR */}
      <nav className="py-6">
        <div className="fixed w-full top-0 start-0 bg-gray-800">
          <div className="mx-auto container">
            <div className="px-2 flex items-center gap-2">

              <Link href="/" className="p-2 hover:bg-gray-700">
                <i className="bi bi-chevron-left"></i>
              </Link>
              <h1 className="font-bold">{book?.title || "Libro"}</h1>

            </div>
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <main id="book" className="pb-10 mx-auto container max-w-[400px]">
        {!book ? (
          // LIBRO NON TROVATO
          <div className="p-3 py-8 text-center text-red-500">
            <i className="bi bi-exclamation-triangle text-2xl"></i>
            <span>Libro non trovato</span>
          </div>

        ) : (
          // LIBRO TROVATO
          <section>
            {/* HEADER */}
            <div className="p-3 py-8 text-center">
              <div className="grid gap-5">
                <h1 className="text-3xl font-bold">{book.title}</h1>
                <p className="text-gray-400">{book.description}</p>
                <p className="text-gray-400">{book.author}</p>
              </div>
            </div>
            <div className="mx-3 border-y border-gray-500"></div>

            {/* FORM */}
            <Frag if={editMode} className="my-5">
              <form onSubmit={form_submit} className="rounded overflow-hidden bg-white/20">
                <h2 className="p-2 px-3 text-xl bg-green-600 text-center">Aggiungi parte e sezione</h2>
    
                <div className="p-2 flex flex-col gap-2">
                  <p className="p-2 bg-orange-200 text-orange-900 border rounded text-sm">
                    <b>Attenzione:</b> inserendo una parte già esistente, la nuova sezione verrà aggiunta alla fine della parte già esistente.
                  </p>

                  {form_value_array.map((item) => (
                    <React.Fragment key={item.key}>
                      <label htmlFor={item.key} className="p-1">{item.label}</label>
                      <input  type="text"
                              id={item.key}
                              name={item.key}
                              className="p-2 bg-gray-700 border rounded"
                              placeholder={item.placeholder}
                              value={item.value ?? ""}
                              onChange={(e) =>
                                form_setValue({
                                  ...form_value,
                                  [item.key]: {
                                    ...form_value[item.key as keyof typeof form_value],
                                    value: e.target.value,
                                  },
                                })
                              }
                      />
                    </React.Fragment>
                  ))}
                </div>

                
                <button className="m-2 p-2 bg-green-600 hover:bg-green-700 rounded" type="submit">
                  <i className="bi bi-plus-lg"></i>
                  Aggiungi
                </button>

              </form>
            </Frag>


            {/* PARTI */}
            <Frag if={!book.parts?.length} 
                  className="p-3 bg-red-200 text-red-900 border rounded">
              <i className="me-1 bi bi-exclamation-triangle"></i>
              Nessuna sezione trovata.
            </Frag>

            <Frag if={!!book.parts?.length} className="py-3">
              <h2 className="p-2 text-2xl">Sezioni</h2>

              {book.parts?.map((part, part_i) => (
                <div className="" key={part_i}>
                  {!!part.sections.length && (
                    <h3 className="p-2 italic">{part.title}</h3>
                  )}

                  {/* SEZIONI */}
                  <div className="grid grid-cols-[auto_1fr] items-center">
                    {part.sections.map((section, section_i) => <>
                      {editMode ?(
                        <button className="p-2 bg-red-500" onClick={() => deleteSection(part_i, section_i)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      ) : <i></i>}
                      
                      <Link key={section_i}
                            href={href(book.id!, part.title, section.title)}
                            className="p-2 bg-gray-800 hover:bg-gray-700 transition-colors">
                        <div className="flex items-center gap-2">
                          <h4>{section.title}</h4>

                          <i className="ms-auto bi bi-chevron-right text-gray-400"></i>
                        </div>
                      </Link>
                    </>)}
                  </div>
                </div>
              ))}

            </Frag>
          </section>
        )}
      </main>
    </>
  );
}