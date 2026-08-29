"use client";

import Link from "next/link";
import { Breadcrumb } from "../shareds/Breadcrumb";
import Field from "../shareds/Field";
import Frag from "../shareds/Frag";
import { LoadingComponent } from "../shareds/LoadingComponent";
import Navigation from "../shareds/Navigation";
import { useBooksComponent } from "./useBooksComponent";
import handleArrowKeyFocus from "../tools/handleArrowKeyFocus";
import { useBookContext } from "../data/BookContext";

export default function BooksComponent() {
  const { page, books, filteredBooks, searchQuery, BOOKS, canWrite, errors } = useBooksComponent();
  const bookContext = useBookContext();
  const { isEditMode } = page;

  // Mostra il componente di caricamento se la pagina non è pronta o è in corso il caricamento
  if (!page.isPageLoaded || bookContext.loading) {
    return <LoadingComponent />;
  }

  return (
    <>
      <Navigation page_title="Catalogo" />

      <Breadcrumb routes={["Catalogo"]} />

      {/* UPLOAD */}
      <div className="py-2 flex justify-center items-center gap-2">
        <button
          onClick={bookContext.upload.json.execute}
          className="py-2 px-3 text-sm rounded bg-green-800"
        >
          <i className={`me-2 bi ${bookContext.upload.json.icon}`}></i>
          <span>{bookContext.upload.json.label}</span>
        </button>

        <button
          onClick={bookContext.upload.markdown.execute}
          className="py-2 px-3 text-sm rounded bg-blue-800"
        >
          <i className={`me-2 bi ${bookContext.upload.markdown.icon}`}></i>
          <span>{bookContext.upload.markdown.label}</span>
        </button>
      </div>
      {/* UPLOAD */}

      <main
        id="BooksTemplate"
        className="mx-auto container max-w-[800px]"
        onKeyDown={handleArrowKeyFocus}
      >
        <section className="p-2 min-h-dvh">
          {/* HEAD */}
          <div className="mx-auto max-w-[400px]">
            <div className="my-3 flex gap-2 justify-between items-center">
              <h1 className="text-2xl font-bold truncate text-orange-500">Gestione Catalogo</h1>

              <Frag
                if={!isEditMode && books.length > 0}
                className="py-1 px-2 rounded outline rounded-full text-xs text-gray-300"
              >
                Catalogo: {filteredBooks.length}
              </Frag>
              {/* NUOVO LIBRO */}
              <Frag if={isEditMode}>
                <button
                  onClick={BOOKS.create}
                  className="py-1 px-2 rounded bg-blue-800 whitespace-nowrap"
                >
                  <i className="me-2 bi bi-plus-lg"></i>
                  Crea Libro
                </button>
              </Frag>
            </div>
            
            {/* SEARCH INPUT */}
            <div className="my-3 bg-white text-black outline-2 rounded">
              <Field
                id="search"
                label="Cerca libri"
                type="search"
                label_class="px-2 pt-1 text-sm font-bold italic"
                input_class="pb-2 px-3"
                placeholder="Cerca per titolo o autore..."
                value={searchQuery.get()}
                onChange={(e) => searchQuery.set(e.target.value)}
              />
            </div>
          </div>

          {/* LIBRI */}
          {/* NESSUN LIBRO TROVATO */}
          <Frag if={books.length === 0}>
            <div className="mt-20 text-red-400 text-center">
              <i className="bi bi-exclamation-triangle me-1"></i>
              <span>Nessun libro trovato</span>
            </div>
          </Frag>

          {/* NESSUN RISULTATO RICERCA */}
          <Frag if={books.length > 0 && filteredBooks.length === 0}>
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
                    {/* Visualizzazione o modifica dei dettagli del libro */}
                    <Link
                      href={isEditMode && canWrite(book) ? "" : `/books/${book.id}/structure`}
                      aria-disabled={!isEditMode && !canWrite(book)}
                      className="block p-2 bg-indigo-600"
                    >
                      {/* MODIFICA LIBRO */}
                      <Field
                        id={`${book.id}-title`}
                        hide_label
                        label="Titolo del libro"
                        type="textarea"
                        input_class={`p-2 text-center text-2xl font-bold ${
                          isEditMode && canWrite(book)
                            ? "bg-white text-black outline rounded"
                            : "pointer-events-none"
                        }`}
                        disabled={!isEditMode && !canWrite(book)}
                        placeholder="Inserisci il titolo"
                        value={book.title}
                        onChange={(e) => BOOKS.update(book.id, "title", e)}
                        error_message={errors[`${book.id}>title`]}
                      />

                      <Field
                        id={`${book.id}-author_name`}
                        hide_label
                        label="Autore del libro"
                        type="textarea"
                        input_class={`p-2 text-center italic border-t ${
                          isEditMode && canWrite(book)
                            ? "bg-white text-gray-800 outline rounded"
                            : "pointer-events-none"
                        }`}
                        disabled={!isEditMode && !canWrite(book)}
                        placeholder="Inserisci l'autore"
                        value={book.author_name}
                        onChange={(e) => BOOKS.update(book.id, "author_name", e)}
                        error_message={errors[`${book.id}>author_name`]}
                      />
                    </Link>

                    {/* DOWNLOAD */}
                    <Frag if={isEditMode && canWrite(book)}>
                      <Frag.Else>
                        <div className="grid grid-cols-2 justify-between items-center">
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
                      </Frag.Else>

                      <Link
                        href={`/books/${book.id}/structure`}
                        className="py-1 px-2 bg-green-700 flex justify-between w-full"
                      >
                        Vai al libro
                        <i className="ms-auto bi bi-caret-right-fill"></i>
                      </Link>
                    </Frag>
                  </div>
                </li>
              ))}
            </ol>
          </Frag>
          {/* LIBRI */}
        </section>
      </main>
    </>
  );
}
