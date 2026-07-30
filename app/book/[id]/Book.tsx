"use client";

import Link from "next/link";
import { Part, parts_schema, section_schema, type Book, type Section } from "../../schemas/_book_schema";
import React, { useEffect, useMemo, useState } from "react";
import { books_store } from "../../data/books_store";
import Frag from "@/app/shareds/Frag";
import { useEditMode } from "@/app/data/EditModeContext";
import Navbar from "@/app/shareds/navbar";
import Field from "@/app/shareds/Field";
import { safeParse } from "valibot";

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

  const [errors_value, errors_setValue] = useState<Record<string, string>>({
    part: "",
    section: ""
  });

  const newPart =useMemo(()=>{
    const result = safeParse(parts_schema, { 
      title: form_value.part.value.trim(), 
      sections: [] 
    } as Part);
    return result;
  }, [form_value.part.value]);
  
  const newSection =useMemo(()=>{
    const result = safeParse(section_schema, { 
      title: form_value.section.value.trim(), 
      paragraphs: [] 
    } as Section);
    return result;
  }, [form_value.section.value]);


  const form_value_array = useMemo(() => Object.entries(form_value)
    .map(([key, obj]) => ({...obj, key, error: errors_value[key]}))
  , [form_value, errors_value]);


  function form_reset(){
    form_setValue((prev) => ({
      ...prev,
      part:{    value: "", label:"Parte",   placeholder: "Inserire o ripetere" },
      section:{ value: "", label:"Sezione", placeholder: "Sezione" },
    }));
    errors_setValue({ part: "", section: "" });
    form_setSubmitOnce(false);
  }

  function form_handleChange(key: string, value: string) {
    form_setValue((prev) => ({
      ...prev,
      [key]: { ...prev[key as keyof typeof prev], value: value.trim() },
    }));
    errors_setValue(prev => ({ ...prev, [key]: "" }));    
  }

  // inserisce la nuova sezione nel libro
  const [form_submitOnce, form_setSubmitOnce] = useState(false);
  function form_submit(e: React.FormEvent) {    
    e.preventDefault(); 
    form_setSubmitOnce(true);
    if(!book) return console.error("Libro non esistente");
    if(!newPart) return console.error("Parte non valida");
    if(!newSection) return console.error("Sezione non valida");

    errors_setValue(prev=>{
      return { ...prev,
        part: newPart.success ? "" : "Parte non valida",
        section: newSection.success ? "" : "Sezione non valida",
      }
    })

    const part_title = (newPart as any).output.title.trim() as string;
    const section_title = (newSection as any).output.title.trim() as string;
        
    // 1. Controlla che la parte esista già o se è nuova 
    const exixtinPart = book.parts?.find(part => 
      part.title.toLowerCase() === part_title.toLowerCase()
    );
    
    // PARTE GIA' ESISTENTE     
    if(exixtinPart){
      // aggiunge la sezione alla parte esistente
      exixtinPart.sections.push({
        title: section_title,
        paragraphs: []
      })

    // NUOVA PARTE
    } else {
      book.parts?.push({
        title: part_title,
        sections: [{
          title: section_title,
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
            <Frag if={!editMode} className="p-3 py-8 text-center">
              <div className="grid gap-5">
                <h2 className="text-3xl font-bold">{book.title}</h2>
                <p className="text-gray-400">{book.description}</p>
                <p className="text-gray-400">{book.author}</p>
              </div>
            </Frag>
            <div className="mx-3 border-y border-gray-500"></div>

            {/* FORM */}
            <Frag if={editMode} className="bg-black/20 p-3 rounded-lg">
              <form onSubmit={form_submit} className="">
                <h2 className="py-3 text-center text-2xl">Aggiungi parte e sezione</h2>
                <p className="text-center text-sm">
                  <b>Attenzione:</b> inserendo il nome esatto di una parte già esistente, la nuova sezione verrà aggiunta alla fine della parte già esistente.
                </p>
    
                <div className="p-2">
                  {form_value_array.map((item) => (
                    <div key={item.key} className="my-3">
                      <Field id={item.key} 
                              label={item.label} 
                              type="text" 
                              placeholder={item.placeholder} 
                              value={item.value ?? ""} 
                              error_message={form_submitOnce ? (item.error || '') : ''}
                              input_class="py-1 px-2 w-full bg-white text-black rounded"
                              onChange={(v) => form_handleChange(item.key, v)}
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 rounded overflow-hidden">
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
            <Frag if={!!book.parts?.length} className="py-3">
              <Frag.Else>
                <div className="mt-20 text-red-400 text-center">
                  <i className="bi bi-exclamation-triangle me-1"></i>
                  <span>Nessuna sezione trovata</span>
                </div>
              </Frag.Else>
              
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