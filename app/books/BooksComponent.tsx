"use client";

import Link from "next/link";
import { Breadcrumb } from "../shareds/Breadcrumb";
import Field from "../shareds/Field";
import Frag from "../shareds/Frag";
import { LoadingComponent } from "../shareds/LoadingComponent";
import Navigation from "../shareds/Navigation";
import { useBooksComponent } from "./useBooksComponent";
import useSharedText from "../data/sharedText";
import { useCommonPagesContext } from "../data/CommonPagesContext";
import { useBookContext } from "../data/BookContext";

export default function BooksComponent() {
  const page = useCommonPagesContext();
  const bookContext = useBookContext();
  const { books, filteredBooks, searchQuery, createVoidBook, isInList, removeFromList, addToList } = useBooksComponent();
  const { upload } = useSharedText();

  // feedback per il caricamento
  if (!page.isPageLoaded.get || !bookContext.isBookLoaded.get) {
    return <LoadingComponent />;
  }

  return (
    <>
      <Navigation page_title="Catalogo" />

      <Breadcrumb routes={["Catalogo"]} />

      <main id="BooksTemplate" className="mx-auto container max-w-[800px]">
        <section className="p-2 min-h-dvh">
          {/* HEAD */}
          <div className="mx-auto max-w-[400px]">
            <div className="my-3 flex flex-wrap gap-2 justify-between items-center">
              <h1 className="text-2xl font-bold truncate text-orange-500">Gestione Catalogo</h1>

              {/* NUOVO LIBRO */}
              <button onClick={() => createVoidBook()} className="py-1 px-2 rounded bg-blue-800 whitespace-nowrap">
                <i className="me-2 bi bi-plus-lg"></i>
                Aggiungi Libro
              </button>
              
              <Frag if={books.get.length > 0}>
                <div className="py-1 px-2 rounded outline rounded-full text-xs text-gray-300 text-nowrap">
                  Catalogo: {filteredBooks.length}
                </div>
              </Frag>

              <button onClick={upload} className="py-2 px-3 text-sm rounded bg-green-800">
                <i className="me-2 bi bi-upload"></i>
                <span>Upload (.json / .md)</span>
              </button>
            </div>
            
            {/* SEARCH INPUT */}
            <div className="relative my-3">
              <label htmlFor="search" className="bi bi-search absolute bottom-1 left-3 text-gray-600"></label>
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
            <div className="mt-20 text-red-400 text-center">
              <i className="bi bi-exclamation-triangle me-1"></i>
              <span>Nessun libro trovato</span>
            </div>
          </Frag>

          {/* NESSUN RISULTATO RICERCA */}
          <Frag if={books.get.length > 0 && filteredBooks.length === 0}>
            <div className="mt-20 text-yellow-400 text-center">
              <i className="bi bi-search me-1"></i>
              <span>Nessun libro corrisponde alla ricerca</span>
            </div>
          </Frag>

          {/* LISTA LIBRI */}
          <Frag if={filteredBooks.length > 0}>
            <ol className="flex flex-wrap gap-2 items-start justify-around">
              {filteredBooks.map((book, book_i) => (
                  <li key={book.id} className="w-full sm:w-[48%]">
                    <div className="outline rounded overflow-hidden">
                      {/* Visualizzazione dei dettagli del libro */}
                      <Link
                        href={`/books/${book.id}/structure`}
                        className="block p-2 bg-indigo-600"
                      >
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
                      <div className="grid grid-cols-2 justify-between items-center">
                        {/* DOWNLOAD */}
                        <button
                          onClick={() => bookContext.download.json.execute(book.id)}
                          className="p-1 bg-green-800 truncate"
                        >
                          Json <i className="bi bi-download"></i>
                        </button>

                        <button
                          onClick={() => bookContext.download.md.execute(book.id)}
                          className="p-1 bg-blue-800 truncate"
                        >
                          Markdown <i className="bi bi-markdown"></i>
                        </button>
                      </div>

                      {/* PULSANTE AGGIUNGI/RIMUOVI DALLA LISTA */}
                      <div className="flex justify-between items-center">
                        <Link href={`/books/${book.id}/structure`}
                              className="py-1 px-2 bg-green-700 flex justify-between w-full">
                          Vai al libro
                          <i className="ms-auto bi bi-caret-right-fill"></i>
                        </Link>
                        
                        {/* Pulsante rimuovi dalla lista (solo se nella lista) */}
                        <Frag if={isInList(book.id)}>
                          <button onClick={() => removeFromList(book.id)}
                                  className="py-1 px-2 bg-red-700 text-nowrap"
                                  title="Rimuovi dalla lista">
                            <i className="me-1 bi bi-x-lg"></i>
                            <span>Rimuovi</span>
                          </button>
                        </Frag>
                        
                        {/* Pulsante aggiungi alla lista (solo se non in lista e si sta cercando) */}
                        <Frag if={!isInList(book.id) && searchQuery.get.trim().length > 0}>
                          <button onClick={() => addToList(book.id)}
                                  className="py-1 px-2 bg-orange-700"
                                  title="Aggiungi alla lista">
                            <i className="bi bi-plus-lg"></i>
                          </button>
                        </Frag>
                      </div>
                    </div>
                  </li>
              ))}
            </ol>
          </Frag>
          {/* LISTA LIBRI */}
        </section>
      </main>
    </>
  );
}
