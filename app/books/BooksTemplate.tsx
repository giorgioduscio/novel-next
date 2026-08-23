// Indica che il componente è un Client Component in Next.js (renderizzato lato client)
"use client";

// Import delle dipendenze necessarie
import Link from "next/link";
import Frag from "../shareds/Frag";
import Field from "../shareds/Field";
import { LoadingComponent } from "../shareds/LoadingComponent";
import { useBooksComponent } from "./BooksComponent";
import { Breadcrumb } from "../shareds/Breadcrumb";
import EditModeComponent from "../shareds/EditModeComponent";
import Navigation from "../shareds/Navigation";

// Componente template per la visualizzazione e gestione dei libri
export default function BooksTemplate({
  books,
  errors,
  page,
  BookHook,
  BOOKS,
}: ReturnType<typeof useBooksComponent>) {
  // Mostra il componente di caricamento se la pagina non è pronta o è in corso il caricamento
  if (!page.isPageLoaded || BookHook.loading) {
    return <LoadingComponent />;
  }

  const {isEditMode} = page;
  return (<>
    <Navigation page_title="Libri" />
    <Breadcrumb />

    <main id="BooksTemplate" className="mx-auto container max-w-[800px]">
      {/* Sezione principale per la gestione dei libri */}
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


        {/* UPLOAD */}
        <div className="py-3 flex justify-center items-center gap-3">
          <div className="md:hidden truncate">Upload:</div>

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
              <li key={book.id + book.title} className="min-w-[150px] max-w-[300px] rounded overflow-hidden border border-gray-400 shadow-lg">
                <div className="text-center relative">
                  {/* ELIMINA LIBRO */}
                  <div className="absolute top-0 right-0 z-1 w-fit">
                    <button
                      aria-label={"Rimuovi libro " + book.title}
                      onClick={() => BOOKS.delete(book.id)}
                      className="py-1 px-2 rounded bg-red-800 truncate"
                    >
                      <i className="bi bi-trash-fill"></i>
                    </button>
                  </div>

                  {/* Visualizzazione o modifica dei dettagli del libro */}
                  <Link href={isEditMode ?'' :`/books/${book.id}`}
                        aria-disabled={!isEditMode}
                        className="block p-2 bg-indigo-600">
                    {/* MODIFICA LIBRO */}
                    <Field id="title"
                            hide_label
                            label="Titolo del libro"
                            type="textarea"
                            input_class={`p-2 text-center text-2xl font-bold ${isEditMode ?"bg-white text-black outline rounded" :"pointler-event-none"}`}
                            disabled={!isEditMode}
                            placeholder="Inserisci il titolo"
                            value={book.title}
                            onChange={e=> BOOKS.update(book_i, "title", e)}
                            error_message={errors[`${book.id}>title`]}
                    />

                    <Field id="author"
                            hide_label
                            label="Autore del libro"
                            type="textarea"
                            input_class={`p-2 text-center text-lg italic border-t ${isEditMode ?"bg-white text-gray-800 outline rounded" :"pointler-event-none"}`}
                            disabled={!isEditMode}
                            placeholder="Inserisci l'autore"
                            value={book.author}
                            onChange={e =>BOOKS.update(book_i, "author", e)}
                            error_message={errors[`${book.id}>author`]}
                    />
                  </Link>

                  {/* DOWNLOAD */}
                  <Frag if={isEditMode}>
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

                    <Link href={`/books/${book.id}`}
                          className="py-1 px-2 bg-green-800 block">
                      Vai al libro
                      <i className="bi bi-chevron-right ms-2"></i>
                    </Link>
                  </Frag>
                </div>
              </li>
            ))}
          </ol>
        </Frag>
        {/* LIBRI */}
      </section>
      <EditModeComponent page={page} />

    </main>
  </>);
}