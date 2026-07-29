"use client";

import Link from "next/link";
import type { Book, Section } from "../../schemas/_book_schema";
import React, { useEffect, useMemo, useState } from "react";
import { books_store } from "../../data/books_store";
import Frag from "@/app/shareds/Frag";
import { useEditMode } from "@/app/data/EditModeContext";
import Navbar from "@/app/shareds/navbar";
import Field from "@/app/shareds/Field";

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
      {/* MAIN */}
      <main id="book">
        <Navbar back_btn={{ href:"/", label:"Libri", icon:"bi-book" }} 
                prop_title={book?.title || ""}/>

        {!book ? (
          // LIBRO NON TROVATO
          <div className="p-3 py-8 text-center text-red-500">
            <i className="bi bi-exclamation-triangle text-2xl"></i>
            <span>Libro non trovato</span>
          </div>

        ) : (
          // LIBRO TROVATO
          <section className="pb-10 mx-auto container max-w-[400px]">
            {/* HEADER */}
            <div className="p-3 py-8 text-center">
              <div className="grid gap-5">
                <h2 className="text-3xl font-bold">{book.title}</h2>
                <p className="text-gray-400">{book.description}</p>
                <p className="text-gray-400">{book.author}</p>
              </div>
            </div>
            <div className="mx-3 border-y border-gray-500"></div>

            {/* FORM */}
            <Frag if={editMode} className="bg-white/10 p-2 rounded-lg">
              <form onSubmit={form_submit} className="overflow-hidden rounded-lg">
                <h2 className="py-3 text-center font-bold">Aggiungi parte e sezione</h2>
                <p className="text-center text-sm">
                  <b>Attenzione:</b> inserendo il nome esatto di una parte già esistente, la nuova sezione verrà aggiunta alla fine della parte già esistente.
                </p>
    
                <div className="p-2">
                  {form_value_array.map((item) => (
                    <React.Fragment key={item.key}>
                      <div className="my-3">
                        <Field id={item.key} 
                               label={item.label} 
                               type="text" 
                               placeholder={item.placeholder} 
                               value={item.value ?? ""} 
                               input_class="w-full bg-gray-900 p-2"
                               onChange={(value) => {
                          form_setValue({
                            ...form_value,
                            [item.key]: value,
                          });
                        }} />
                      </div>
                    </React.Fragment>
                  ))}
                </div>

                <div className="flex justify-between">
                  <button type="submit" className="p-2 bg-green-700 hover:bg-green-800 transition-colors">
                    <i className="me-1 bi bi-plus-lg"></i>
                    <span>Aggiungi</span>
                  </button>

                  <button type="reset"
                          className="p-2 bg-red-700 hover:bg-red-800 transition-colors"
                          onClick={() => form_reset()}>
                    <i className="me-1 bi bi-x-lg"></i>
                    <span>Reset</span>
                  </button>
                </div>

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
                <div className="" key={part.title + part_i}>
                  {!!part.sections.length && (
                    <h3 className="p-2 italic">{part.title}</h3>
                  )}

                  {/* SEZIONI */}
                  <div className="grid grid-cols-[auto_1fr] items-center">
                    {part.sections.map((section, section_i) => <React.Fragment key={section.title + section_i}>
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
                    </React.Fragment>)}
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