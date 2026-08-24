"use client";

import Link from "next/link";
import Bottombar from "../shareds/Bottombar";
import { Breadcrumb } from "../shareds/Breadcrumb";
import Field from "../shareds/Field";
import Frag from "../shareds/Frag";
import { LoadingComponent } from "../shareds/LoadingComponent";
import ManySelect from "../shareds/ManySelect";
import Navigation from "../shareds/Navigation";
import { useBooksComponent } from "./useBooksComponent";

export default function BooksComponent() {
  const {page, BookHook, deleteTargets, books, BOOKS, canWrite, errors} = useBooksComponent();
  // Mostra il componente di caricamento se la pagina non è pronta o è in corso il caricamento
  if (!page.isPageLoaded || BookHook.loading) {
    return <LoadingComponent />;
  }

  const {isEditMode} = page;
  return (<>
    <Frag if={deleteTargets.get().length === 0}>
      <Navigation page_title="Libri" />
    </Frag>

    {/* AZIONI MULTIPLE */}
    <Frag if={deleteTargets.get().length > 0}>
      <ManySelect 
        targets={deleteTargets}
        allItems={books.map(b => b.id)}
        onDeleteMany={BOOKS.deleteMany}
      />
    </Frag>

    <Breadcrumb />

    {/* UPLOAD */}
    <div className="py-2 flex justify-center items-center gap-2">
      <button onClick={BookHook.upload.json.execute}
              className="py-2 px-3 text-sm rounded bg-green-800">
        <i className={`me-2 bi ${BookHook.upload.json.icon}`}></i>
        <span>{BookHook.upload.json.label}</span>
      </button>

      <button onClick={BookHook.upload.markdown.execute}
              className="py-2 px-3 text-sm rounded bg-blue-800">
        <i className={`me-2 bi ${BookHook.upload.markdown.icon}`}></i>
        <span>{BookHook.upload.markdown.label}</span>
      </button>
    </div>
    {/* UPLOAD */}



    <main id="BooksTemplate" className="mx-auto container max-w-[800px]">
      <section className="p-2 min-h-dvh">

        {/* HEAD */}
        <div className="mx-auto max-w-[400px]">
          <div className="my-3 flex gap-2 justify-between items-center">
            <h1 className="text-2xl font-bold truncate text-orange-500">Gestione Libri</h1>

            <Frag if={!isEditMode && books.length >0} 
                  className="py-1 px-2 rounded outline rounded-full text-xs text-gray-300">
              Libri: {books.length}
            </Frag>
            {/* NUOVO LIBRO */}
            <Frag if={isEditMode}>
              <button onClick={BOOKS.create} 
                      className="py-1 px-2 rounded bg-blue-800 whitespace-nowrap">
                <i className="me-2 bi bi-plus-lg"></i>
                Crea Libro
              </button>
            </Frag>
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

        {/* LISTA LIBRI */}
        <Frag if={books.length > 0}>
          <ol className="flex flex-wrap gap-2 items-start justify-around">
            {books.map((book, book_i) => (
              <li key={book.id + book.title} className={``}>
                <div className="grid grid-cols-[auto_1fr] gap-2">
                  <div className="pt-2">
                    {/* SELEZIONA LIBRO */}
                    <input
                      type="checkbox"
                      checked={deleteTargets.get().includes(book.id)}
                      onChange={() => BOOKS.toggleTarget(book.id)}
                      className="block m-auto scale-150"
                    />
                    {/* ELIMINA LIBRO */}
                    <button
                      aria-label={"Rimuovi libro " + book.title}
                      onClick={() => BOOKS.delete(book.id)}
                      className="my-4 py-1 px-2 rounded-full bg-red-700"
                    >
                      <i className="bi bi-trash-fill"></i>
                    </button>
                  </div>

                  <div className="outline rounded">
                    {/* Visualizzazione o modifica dei dettagli del libro */}
                    <Link href={isEditMode && canWrite(book) ?'' :`/books/${book.id}/structure`}
                          aria-disabled={!isEditMode && canWrite(book)}
                          className={`block p-2 ${deleteTargets.get().includes(book.id) ? 'bg-red-600' : 'bg-indigo-600'}`}>
                      {/* MODIFICA LIBRO */}
                      <Field id="title"
                              hide_label
                              label="Titolo del libro"
                              type="textarea"
                              input_class={`p-2 text-center text-2xl font-bold ${isEditMode && canWrite(book) ?"bg-white text-black outline rounded" :"pointler-event-none"}`}
                              disabled={!isEditMode && canWrite(book)}
                              placeholder="Inserisci il titolo"
                              value={book.title}
                              onChange={e=> BOOKS.update(book_i, "title", e)}
                              error_message={errors[`${book.id}>title`]}
                      />

                      <Field id="author_name"
                              hide_label
                              label="Autore del libro"
                              type="textarea"
                              input_class={`p-2 text-center italic border-t ${isEditMode && canWrite(book) ?"bg-white text-gray-800 outline rounded" :"pointler-event-none"}`}
                              disabled={!isEditMode && canWrite(book)}
                              placeholder="Inserisci l'autore"
                              value={book.author_name}
                              onChange={e =>BOOKS.update(book_i, "author_name", e)}
                              error_message={errors[`${book.id}>author_name`]}
                      />
                    </Link>

                    {/* DOWNLOAD */}
                    <Frag if={isEditMode && canWrite(book)}>
                      <Frag.Else>
                        <div className="grid grid-cols-2 justify-between items-center">
                          <button onClick={() => BookHook.download.json.execute(book.id)}
                                  className="p-1 bg-green-800 truncate">
                            Json <i className="bi bi-download"></i>
                          </button>

                          <button onClick={() => BookHook.download.md.execute(book.id)}
                                  className="p-1 bg-blue-800 truncate">
                            Markdown <i className="bi bi-markdown"></i>
                          </button>
                        </div>
                      </Frag.Else>

                      <Link href={`/books/${book.id}/structure`}
                            className="py-1 px-2 bg-green-700 flex justify-between w-full">
                        Vai al libro
                        <i className="ms-auto bi bi-caret-right-fill"></i>
                      </Link>
                    </Frag>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </Frag>
        {/* LIBRI */}
      </section>
      <Bottombar page={page} />

    </main>
  </>);
}
