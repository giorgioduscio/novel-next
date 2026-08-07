"use client";

import Link from "next/link";
import { type Book } from "../../schemas/book_schema";
import React, { useEffect, useState } from "react";
import { useBooks } from "../../data/BookContext";
import Frag from "@/app/shareds/Frag";
import { useEditMode } from "@/app/data/EditModeContext";
import Navbar from "@/app/shareds/navbar";
import Field from "@/app/shareds/Field";
import { LoadingComponent } from "@/app/shareds/LoadingComponent";

interface BookProps {
  id: number;
}

export default function BookComponent({ id }: BookProps) {
  const [book, setBook] = useState<Book | undefined>(undefined);
  const { isEditMode, isPageLoaded } = useEditMode();
  const bookStore = useBooks();

  useEffect(() => {
    if (!isNaN(id)) {
      setBook(bookStore.getBookById(id));
    }
  }, [id, bookStore.getBookById]);


  // LIBRO
  function handleUpdateBook(key:string, value: any) {
    if(!book) throw new Error("Libro non trovato");
    (book as any)[key] = value;
    bookStore.updateBook(id, book);
    setBook({ ...book });
  }


  // PARTI
  const PART = {
    // aggiunge una parte vuota
    create() {
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
    },

    // modifica il titolo della parte
    updateTitle(index:number, value: string) {
      if(!book) throw new Error("Libro non trovato");
      (book.parts as any)[index].title = value;
      
      bookStore.updateBook(id, book);
      setBook({ ...book });
    },
  }

  // SEZIONI
  const SECTION ={
    create(part_i: number) {
      if(!book) throw new Error("Libro non trovato");
      if(!book.parts || book.parts.length === 0) book.parts = [];

      // aggiunge una sezione vuota alla parte selezionata
      book.parts[part_i].sections.push({
        title: "Sezione"+ Date.now(),
        paragraphs: []
      });

      bookStore.updateBook(id, book);
      setBook({ ...book });
    },

    writeHref(book_id: number, part: string, section: string) {
      part = part.replaceAll(" ", "-");
      section = section.replaceAll(" ", "-");
      return `/book/${book_id}/${part}/${section}`;
    },
    
    updateTitle(part_i: number, section_i: number, value: string) {
      if(!book) throw new Error("Libro non trovato");
      (book.parts as any)[part_i].sections[section_i].title = value;
      
      bookStore.updateBook(id, book);
      setBook({ ...book });
    },

    delete(part_i: number, section_i: number) {
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
  }

  // SORT
  const SORT ={
    // controlla se la sezione è la prima del libro
    isFirstOfBook(part_i: number, section_i: number){
      if(!book) throw new Error("Libro non trovato");
      if(!book.parts || book.parts.length === 0) throw new Error("Libro non ha parti");
      return part_i === 0 && section_i === 0;
    },

    // controlla se la sezione è la l'ultima del libro
    isLastOfBook(part_i: number, section_i: number){
      if(!book) throw new Error("Libro non trovato");
      if(!book.parts || book.parts.length === 0) throw new Error("Libro non ha parti");

      const partsCount = book.parts.length; // numero parti
      const isLastPart = part_i === partsCount - 1;
      const sectionCount = book.parts[part_i].sections.length; // numero sezioni nella parte
      const isLastSection = section_i === sectionCount - 1;

      // controlla se la parte è l'ultima del libro e la sezione è l'ultima della sua parte
      return isLastPart && isLastSection;
    },

    pushOrder: (direction: "up" | "down", part_i: number, section_i: number) => {
      if(!book) throw new Error("Libro non trovato");
      if(!book.parts || book.parts.length === 0) book.parts = [];
      const directionToUp = direction === "up";

      // controlla se la parte è la prima / ultima del libro
      const isHemPart = directionToUp 
                          ? part_i === 0 
                          : part_i === book.parts.length - 1;
      // controlla se la sezione target è la prima / ultima della sua parte
      const isHemSectionOfPart = directionToUp 
                          ? section_i === 0 
                          : section_i === book.parts[part_i].sections.length - 1;
      
      if(isHemPart && isHemSectionOfPart) return console.error("La sezione è già la prima / ultima del libro");

      // controlla che la parte abbia più di una sezione
      const isAloneOnPart = book.parts[part_i].sections.length === 1;
      if(isAloneOnPart && !confirm("Sei sicuro di voler spostare questa sezione? Rimuoverai la parte dal libro.")) return;
      
      const targetSection = book.parts[part_i].sections[section_i];
      
      // spostamento verso l'alto
      if(directionToUp){
        // se è la prima sezione, la sposta in fondo alla parte precedente
        if(isHemSectionOfPart){
          // sposta la sezione in fondo alla parte precedente
          book.parts[part_i - 1].sections.push(targetSection);
          // rimuove la sezione dalla parte corrente
          book.parts[part_i].sections.splice(section_i, 1);
          
        // altrimenti scambia solo le sezioni della stessa parte
        } else {
          book.parts[part_i].sections[section_i] = book.parts[part_i].sections[section_i - 1];
          book.parts[part_i].sections[section_i - 1] = targetSection;
        }
        
        // spostamento verso il basso
      } else {
        // se è l'ultima sezione, la sposta in fondo alla parte successiva
        if(isHemSectionOfPart){
          // sposta la sezione in fondo alla parte successiva
          book.parts[part_i + 1].sections.push(targetSection);
          // rimuove la sezione dalla parte corrente
          book.parts[part_i].sections.splice(section_i, 1);
          
        // altrimenti scambia solo le sezioni della stessa parte
        } else {
          book.parts[part_i].sections[section_i] = book.parts[part_i].sections[section_i + 1];
          book.parts[part_i].sections[section_i + 1] = targetSection;
        }
      }
      
      // rimuove tutte le parti del libro senza sezioni
      book.parts = book.parts.filter(part => part.sections.length > 0);
      bookStore.updateBook(id, book);
      console.log(book.parts);
      setBook({ ...book });
    },
    
  }

  // DROPDOWN
  const [dropdownsState, setDropdownsState] = useState<Record<string, boolean>>({});
  const DROPDOWN ={
    toggle(title: string){
      setDropdownsState(prev => ({
        [title]: !prev[title]
      })); 
    },
    autoClose(e: React.MouseEvent){
      // se l'elemento cliccato non è un dropdown, chiude tutti i dropdown
      if(!(e.target as HTMLElement).closest('.dropdown')){
        setDropdownsState({});
      }
    }
  }


  // caricamento
  if (!isPageLoaded) return <LoadingComponent/>

  return (
    <>
      {/* MAIN */}
      <main id="book" onClick={DROPDOWN.autoClose}>
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
                        hide_label={!isEditMode}
                        label={"Titolo"} 
                        input_class={`p-2 text-center rounded text-3xl font-bold ${isEditMode ?'border' :''}`}
                        asterisk
                        type={"text"} 
                        placeholder={"Titolo"} 
                        disabled={!isEditMode}
                        value={book.title} 
                        onChange={_e=> handleUpdateBook("title", _e.target.value)} 
                />
                <Field id={"author"} 
                        hide_label={!isEditMode}
                        label={"Autore"} 
                        input_class={`p-2 text-center rounded ${isEditMode ?'border' :'text-gray-300'}`}
                        asterisk
                        type={"text"} 
                        placeholder={"Autore"} 
                        disabled={!isEditMode}
                        value={book.author} 
                        onChange={_e=> handleUpdateBook("author", _e.target.value)} 
                />
                <Field id={"description"} 
                        hide_label={!isEditMode}
                        label={"Descrizione"} 
                        input_class={`p-2 text-center rounded ${isEditMode ?'border' :'text-gray-300'}`}
                        asterisk
                        type={"textarea"} 
                        placeholder={"Descrizione"} 
                        disabled={!isEditMode}
                        value={book.description} 
                        onChange={_e=> handleUpdateBook("description", _e.target.value)} 
                />
              </div>
            </div>
            <div className="mx-3 border-y border-gray-500"></div>


            {/* PARTI */}
            <Frag if={!!book.parts?.length}>
              <Frag.Else>
                <div className="my-15 text-red-400 text-center">
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
                      <Frag if={isEditMode}>
                        <Frag.Else>
                          <h3 className="p-2 italic">{part.title}</h3>
                        </Frag.Else>

                        <Field  id={part_i.toString()} 
                                hide_label label={"Titolo della parte"} 
                                input_class="py-1 px-2 border"
                                type={"text"} 
                                placeholder={"Modifica il titolo della parte"} 
                                value={part.title} 
                                onChange={(e) => PART.updateTitle(part_i, e.target.value)}
                        />
                      </Frag>
                    )}


                    {/* SEZIONI */}
                    <div>
                      {part.sections.map((section, section_i) => 
                        <Frag if={isEditMode} key={section.title + section_i}>

                          {/* link sezione */}
                          <Frag.Else>
                            <Link href={SECTION.writeHref(book.id!, part.title, section.title)}
                                  className="p-2 block bg-gray-800 hover:bg-gray-700 transition-colors">
                              <div className="flex items-center gap-2">
                                <h4>{section.title}</h4>

                                <i className="ms-auto bi bi-chevron-right text-gray-400"></i>
                              </div>
                            </Link>
                          </Frag.Else>

                          <div className="my-1 border rounded">
                            <div className="grid grid-cols-[auto_1fr_auto]">

                              {/* DROPDOWN */}
                              <div className="relative dropdown">
                                <button onClick={() => DROPDOWN.toggle(section.title)} 
                                        className="p-1 bg-gray-600 hover:bg-gray-500 transition-colors">
                                  <i className="bi bi-three-dots"></i>
                                </button>

                                <Frag if={!!dropdownsState[section.title]} 
                                      className="absolute start-0 right-0 z-10">
                                  <div className="grid min-w-[100px] bg-gray-800 border rounded">
                                    <button className="p-1 bg-red-500 truncate" 
                                            onClick={() => SECTION.delete(part_i, section_i)}>
                                      <i className="bi bi-trash"></i> Rimuovi
                                    </button>
                                    <Frag if={!SORT.isFirstOfBook(part_i, section_i)}>
                                      <button className="p-1 bg-gray-600 truncate" 
                                              onClick={() => SORT.pushOrder("up", part_i, section_i)}>
                                        <i className="bi bi-caret-up-fill"></i> Sposta su
                                      </button>
                                    </Frag>
                                    <Frag if={!SORT.isLastOfBook(part_i, section_i)}>
                                      <button className="p-1 bg-gray-600 truncate" 
                                              onClick={() => SORT.pushOrder("down", part_i, section_i)}>
                                        <i className="bi bi-caret-down-fill"></i> Sposta giù
                                      </button>
                                    </Frag>
                                  </div>
                                </Frag>
                              </div>

                              
                              <Field  id={"section-" + section_i} 
                                      hide_label label={"Sezione " + (section_i + 1)} 
                                      input_class="py-1 px-2 bg-gray-800"
                                      type={"text"} 
                                      placeholder={"Nome della sezione"} 
                                      value={section.title} 
                                      onChange={(e) => SECTION.updateTitle(part_i, section_i, e.target.value)} 
                              />
                              <Link className="p-1 bg-green-600" 
                                      href={SECTION.writeHref(book.id!, part.title, section.title)}>
                                <i className="bi bi-chevron-right"></i>
                              </Link>
                            </div>
                          </div>
                        
                          {/* Pulsante aggiunta sezione */}
                          <Frag if={section_i === (book.parts?.[part_i]?.sections.length || 0) - 1}>
                            <button onClick={() => SECTION.create(part_i)}
                                    className="py-1 px-2 mx-auto my-3 block bg-gray-800 rounded text-sm hover:bg-gray-900 transition-colors">
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

            {/* pulsante aggiunta */}
            <Frag if={isEditMode}>
              <button onClick={() => PART.create()}
                      className="py-2 px-3 mx-auto my-3 block bg-green-600 rounded hover:bg-green-700 transition-colors">
                <i className="bi bi-plus-lg"></i>
                <span>Aggiungi parte</span>
              </button>
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
