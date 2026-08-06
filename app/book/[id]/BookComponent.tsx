"use client";

import Link from "next/link";
import { type Book } from "../../schemas/book_schema";
import React, { useEffect, useState } from "react";
import { useBooks } from "../../data/BookContext";
import Frag from "@/app/shareds/Frag";
import { useEditMode } from "@/app/data/EditModeContext";
import Navbar from "@/app/shareds/navbar";
import Field from "@/app/shareds/Field";

interface BookProps {
  id: number;
}

export default function BookComponent({ id }: BookProps) {
  const [book, setBook] = useState<Book | undefined>(undefined);
  const [isLoaded, setIsLoaded] = useState(false);
  const { editMode } = useEditMode();
  const bookStore = useBooks();

  useEffect(() => {
    if (!isNaN(id)) {
      setBook(bookStore.getBookById(id));
    }
    setIsLoaded(true);
  }, [id, bookStore.getBookById]);


  // LIBRO
  function handleUpdateBook(key:string, value: any) {
    if(!book) throw new Error("Libro non trovato");
    (book as any)[key] = value;
    bookStore.updateBook(id, book);
    setBook({ ...book });
  }


  // PARTI
  function handleChangePartTitle(index:number, value: string) {
    if(!book) throw new Error("Libro non trovato");
    (book.parts as any)[index].title = value;
    
    bookStore.updateBook(id, book);
    setBook({ ...book });
  }

  // aggiunge una parte vuota
  function handleAddPart() {
    if(!book) throw new Error("Libro non trovato");

    if(!book.parts) book.parts = [];
    book.parts.push({
      title: "Parte"+ Date.now(),
      sections: [
        {
          title: "Sezione"+ Date.now(),
          paragraphs: []
        }
      ]
    });
    bookStore.updateBook(id, book);
    setBook({ ...book });
  }


  // SEZIONI
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

    bookStore.updateBook(id, book);
    setBook({ ...book });
  }  
  
  function handleChangeSectionTitle(part_i: number, section_i: number, value: string) {
    if(!book) throw new Error("Libro non trovato");
    (book.parts as any)[part_i].sections[section_i].title = value;
    
    bookStore.updateBook(id, book);
    setBook({ ...book });
  }

  function handleAddSection(part_i: number) {
    if(!book) throw new Error("Libro non trovato");
    if(!book.parts || book.parts.length === 0) book.parts = [];

    // aggiunge una sezione vuota alla parte selezionata
    book.parts[part_i].sections.push({
      title: "Sezione"+ Date.now(),
      paragraphs: []
    });

    bookStore.updateBook(id, book);
    setBook({ ...book });
  }

  function href(book_id: number, part: string, section: string) {
    part = part.replaceAll(" ", "-");
    section = section.replaceAll(" ", "-");
    return `/book/${book_id}/${part}/${section}`;
  }


  // caricamento
  if (!isLoaded) return <main className="mx-auto container max-w-[400px] p-8 text-center text-gray-400">Caricamento...</main>

  return (
    <>
      {/* MAIN */}
      <main id="book">
        <Navbar back_btn={{ href:"/", label:"", icon:"bi-chevron-left" }} 
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
              <div className="grid gap-3 overflow-x-hidden">
                <h2 className="hidden">{book.title}</h2>
                <Field id={"title"} 
                        hide_label={!editMode}
                        label={"Titolo"} 
                        input_class={`p-2 text-center rounded text-3xl font-bold ${editMode ?'border' :''}`}
                        type={"text"} 
                        placeholder={"Titolo"} 
                        disabled={!editMode}
                        value={book.title} 
                        onChange={_e=> handleUpdateBook("title", _e.target.value)} 
                />
                <Field id={"author"} 
                        hide_label={!editMode}
                        label={"Autore"} 
                        input_class={`p-2 text-center rounded ${editMode ?'border' :'text-gray-300'}`}
                        type={"text"} 
                        placeholder={"Autore"} 
                        disabled={!editMode}
                        value={book.author} 
                        onChange={_e=> handleUpdateBook("author", _e.target.value)} 
                />
                <Field id={"description"} 
                        hide_label={!editMode}
                        label={"Descrizione"} 
                        input_class={`p-2 text-center rounded ${editMode ?'border' :'text-gray-300'}`}
                        type={"textarea"} 
                        placeholder={"Descrizione"} 
                        disabled={!editMode}
                        value={book.description} 
                        onChange={_e=> handleUpdateBook("description", _e.target.value)} 
                />
              </div>
            </div>
            <div className="mx-3 border-y border-gray-500"></div>


            {/* PARTI */}
            <Frag if={!!book.parts?.length}>
              <Frag.Else>
                <div className="mt-20 text-red-400 text-center">
                  <i className="bi bi-exclamation-triangle me-1"></i>
                  <span>Nessuna sezione trovata</span>
                </div>
              </Frag.Else>
              
              <div className="py-3">
                <h2 className="p-2 text-2xl">Sezioni</h2>
                {book.parts?.map((part, part_i) => (
                  <div className="" key={part.title + part_i}>

                    {/* titolo parte */}
                    {!!part.sections.length && (
                      <Frag if={editMode}>
                        <Frag.Else>
                          <h3 className="p-2 italic">{part.title}</h3>
                        </Frag.Else>

                        <Field  id={part_i.toString()} 
                                hide_label label={"Titolo della parte"} 
                                input_class="py-1 px-2 border"
                                type={"text"} 
                                placeholder={"Modifica il titolo della parte"} 
                                value={part.title} 
                                onChange={(e) => handleChangePartTitle(part_i, e.target.value)}
                        />
                      </Frag>
                    )}

                    {/* SEZIONI */}
                    <div>
                      {part.sections.map((section, section_i) => 
                        <Frag if={editMode} key={section.title + section_i}>
                          <Frag.Else>
                            <Link href={href(book.id!, part.title, section.title)}
                                  className="p-2 block bg-gray-800 hover:bg-gray-700 transition-colors">
                              <div className="flex items-center gap-2">
                                <h4>{section.title}</h4>

                                <i className="ms-auto bi bi-chevron-right text-gray-400"></i>
                              </div>
                            </Link>
                          </Frag.Else>

                          <div className="my-1 border rounded overflow-hidden">
                            <div className="grid grid-cols-[auto_1fr_auto]">
                              <button className="p-2 bg-gray-600" 
                                      onClick={() => console.log(part_i, section_i)}>
                                <i className="bi bi-grip-vertical"></i>
                              </button>
                              <Field  id={"section-" + section_i} 
                                      hide_label label={"Sezione " + (section_i + 1)} 
                                      input_class="p-2 bg-gray-800"
                                      type={"text"} 
                                      placeholder={"Nome della sezione"} 
                                      value={section.title} 
                                      onChange={(e) => handleChangeSectionTitle(part_i, section_i, e.target.value)} 
                              />
                              <button className="p-2 bg-red-500" 
                                      onClick={() => deleteSection(part_i, section_i)}>
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </div>
                        
                          {/* Pulsante aggiunta sezione */}
                          <Frag if={section_i === (book.parts?.[part_i]?.sections.length || 0) - 1}>
                            <button onClick={() => handleAddSection(part_i)}
                                    className="py-1 px-2 mx-auto my-3 block bg-green-600 rounded">
                              <i className="bi bi-arrow-down"></i>
                              <span>Aggiungi sezione</span>
                            </button>
                          </Frag>

                        </Frag>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Frag>
            

            {/* AZIONI */}
            <div className="my-10 border border-gray-500"></div>
            <h4 className="p-2 text-xl text-gray-400">Azioni</h4>
            <div className="flex flex-col">
              {Object.values(bookStore.download).map((action, i) => (
                <button key={i}  onClick={() => action.execute(book.id!)}
                        className="py-2 px-3 bg-gray-800 hover:bg-gray-700 transition-colors" >
                  <div className="flex justify-between items-center">
                    <span>{action.label}</span>
                    <i className={`bi ${action.icon}`}></i>
                  </div>
                </button>
              ))}
            </div>

          </section>
        )}
      </main>
    </>
  );
}
