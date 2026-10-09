"use client";

import Link from "next/link";
import { Breadcrumb } from "../shareds/Breadcrumb";
import Field from "../shareds/Field";
import Frag from "../shareds/Frag";
import Navbar from "../shareds/Navbar";
import { useBooksComponent } from "./useBooksComponent";
import useSharedText from "../data/sharedText";
import { useBookContext } from "../data/BookContext";
import Bottombar from "../shareds/Bottombar";
import React from "react";

export default function BooksComponent() {
  const bookContext = useBookContext();
  const { books, filteredBooks, searchQuery, createVoidBook, card_buttons } = useBooksComponent();
  const { upload } = useSharedText();


  return (
    <>
      <Navbar page_title="Catalogo" />

      <Breadcrumb routes={["Catalogo"]} />

      <main id="BooksComponent" className="mx-auto container max-w-[800px]">
        <section className="p-2 min-h-dvh">
          {/* HEAD */}
          <div className="mx-auto max-w-[800px]">
            <div className="my-3 flex flex-wrap gap-2 justify-between items-center">
              <h1 className="text-2xl font-bold truncate text-light">Gestione Catalogo</h1>

              <Frag if={books.get.length > 0}>
                <div className="py-1 px-2 rounded outline rounded-full text-xs text-nowrap">
                  Catalogo: {filteredBooks.length}
                </div>
              </Frag>
            </div>

            <div className="w-max flex shadow-lg rounded-lg overflow-hidden">
              {/* NUOVO LIBRO */}
              <button onClick={() => createVoidBook()} 
                      className="py-1 px-2 text-bg-primary truncate">
                <i className="me-2 bi bi-plus-lg"></i>
                <span>Aggiungi Libro</span>
              </button>

              <button onClick={upload} 
                      className="py-2 px-2 text-bg-tertiary truncate">
                <i className="me-2 bi bi-upload"></i>
                <span>Upload (.json / .md)</span>
              </button>
            </div>
            
            {/* SEARCH INPUT */}
            <div className="mx-auto my-3 max-w-[400px] relative">
              <label htmlFor="search" className="bi bi-search absolute bottom-1 left-3 text-dark"></label>
              <Field
                id="search"
                label="Cerca libri"
                type="search"
                label_class="px-2 pt-1 text-sm  font-bold italic"
                input_class="pl-8 px-3 py-1 bg-white text-black outline rounded-full"
                placeholder="Cerca per titolo o autore..."
                value={searchQuery.get}
                onChange={(e) => searchQuery.set(e.target.value)}
              />
            </div>
          </div>

          {/* LIBRI */}
          {/* NESSUN LIBRO TROVATO */}
          <Frag if={books.get.length === 0}>
            <div className="mt-20 text-danger text-center">
              <i className="bi bi-exclamation-triangle me-1"></i>
              <span>Nessun libro trovato</span>
            </div>
          </Frag>

          {/* NESSUN RISULTATO RICERCA */}
          <Frag if={books.get.length > 0 && filteredBooks.length === 0}>
            <div className="mt-20 text-danger text-center">
              <i className="bi bi-search me-1"></i>
              <span>Nessun libro corrisponde alla ricerca</span>
            </div>
          </Frag>

          {/* LISTA LIBRI */}
          <Frag if={filteredBooks.length > 0}>
            <ol className="flex flex-wrap gap-2 items-start justify-around">
              {filteredBooks.map((book, book_i) => (
                  <li key={book.id} className="w-full sm:w-[48%]">
                    <div data-CARD className="rounded overflow-hidden shadow-lg">
                      {/* Visualizzazione dei dettagli del libro */}
                      <Link href={`/books/${book.id}/structure`}
                            className="block p-2 text-bg-dark">
                        {/* TITOLO LIBRO */}
                        <div className="p-2 text-center text-2xl font-bold pointer-events-none">
                          {book.title || "Senza titolo"}
                        </div>

                        {/* AUTORE LIBRO */}
                        <div className="p-2 text-center italic border-t pointer-events-none">
                          {book.author_name || "Autore sconosciuto"}
                        </div>
                      </Link>

                      {/* AZIONI */}
                      <div className="flex items-center text-bg-dark">
                        {card_buttons.map((btn, i)=><React.Fragment key={btn.label + i}>

                          <Frag if={btn.condition(book.id)}>
                            <button onClick={_=> btn.event(book.id)}
                                    className={`flex-1 p-1 truncate ${btn.className}`}>
                              <i className={`bi ${btn.icon}`}></i>
                              <span className="ms-2 hidden sm:inline">{btn.label}</span>
                            </button>
                          </Frag>

                        </React.Fragment>)}
                      </div>
                    </div>
                  </li>
              ))}
            </ol>
          </Frag>
          {/* LISTA LIBRI */}
        </section>
      </main>

      <Bottombar>
        <Link href={"/auth"} className="circle text-bg-primary">
          <i className="bi bi-person-vcard-fill"></i>
        </Link>
      </Bottombar>
    </>
  );
}
