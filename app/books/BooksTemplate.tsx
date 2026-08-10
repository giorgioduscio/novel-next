// Indica che il componente è un Client Component in Next.js (renderizzato lato client)
"use client";

// Import delle dipendenze necessarie
import Link from "next/link";
import Frag from "../shareds/Frag";
import Field from "../shareds/Field";
import { LoadingComponent } from "../shareds/LoadingComponent";
import Navbar from "../shareds/navbar";
import { useBooksComponent } from "./BooksComponent";
import { Breadcrumb } from "../shareds/Breadcrumb";

// Tipo per le props del componente BooksTemplate basato sull'hook useBooksComponent
type BooksTemplateProps = ReturnType<typeof useBooksComponent>;

// Componente template per la visualizzazione e gestione dei libri
export default function BooksTemplate({
  books,
  errors,
  isEditMode,
  isPageLoaded,
  BookContext,
  bookFeat,
  uploadFeat,
}: BooksTemplateProps) {
  // Mostra il componente di caricamento se la pagina non è pronta o è in corso il caricamento
  if (!isPageLoaded || BookContext.loading) {
    return <LoadingComponent />;
  }

  return (
    <main id="BooksTemplate">
      <Navbar page_title="Gestione Libri" />
      <Breadcrumb />

      {/* Sezione principale per la gestione dei libri */}
      <section className="p-2 mx-auto container max-w-[400px]">
        <div className="text-center">


          {/* UPLOAD */}
          <div className="flex justify-center items-center gap-2">
            <div className="truncate">Upload:</div>

            <button onClick={uploadFeat.json.execute}
                    className="py-2 px-3 text-sm rounded bg-green-800 active:bg-green-700 transition-colors">
              <i className="me-2 bi bi-upload"></i>
              <span>{uploadFeat.json.label}</span>
            </button>

            <button onClick={uploadFeat.markdown.execute}
                    className="py-2 px-3 text-sm rounded bg-blue-800 active:bg-blue-700 transition-colors">
              <i className="me-2 bi bi-upload"></i>
              <span>{uploadFeat.markdown.label}</span>
            </button>
          </div>
          {/* UPLOAD */}


          {/* HEAD */}
          <div className="my-5 flex flex-wrap justify-between items-center">
            <h1 className="text-2xl font-bold">Gestione Libri</h1>
            <p className="text-gray-400">
              Totale: {books.length} libri
            </p>
          </div>

          {/* NUOVO LIBRO */}
          <Frag if={isEditMode} className="my-5">
            <button onClick={bookFeat.create} 
                    className="w-full py-2 px-3 rounded bg-blue-700 active:bg-blue-600 transition-colors">
              <i className="me-2 bi bi-plus-lg"></i>
              Crea Libro
            </button>
          </Frag>

          {/* LIBRI */}
          <Frag if={books.length > 0}>
          {/* NESSUN LIBRO TROVATO */}
            <Frag.Else>
              <div className="mt-20 text-red-400 text-center">
                <i className="bi bi-exclamation-triangle me-1"></i>
                <span>Nessun libro trovato</span>
              </div>
            </Frag.Else>

            {/* LISTA LIBRI */}
            <ol className="flex flex-wrap gap-2 items-start">
              {books.map((book, book_i) => (
                <li key={book.id + book.title}
                    className="flex-1 min-w-[150px] rounded overflow-hidden border border-gray-400 shadow-lg"
                >
                  <div className="text-center relative bg-white/10 active:bg-white/30 transition-colors">
                    {/* ELIMINA LIBRO */}
                    <div className="absolute top-0 right-0 w-fit">
                      <button
                        aria-label={"Rimuovi libro " + book.title}
                        onClick={() => bookFeat.delete(book.id)}
                        className="py-1 px-2 rounded bg-red-800 active:bg-red-600 transition-colors truncate"
                      >
                        <i className="bi bi-trash-fill"></i>
                      </button>
                    </div>

                    {/* Visualizzazione o modifica dei dettagli del libro */}
                    <Frag if={isEditMode}>
                      {/* VISUALIZZA LIBRO */}
                      <Frag.Else>
                        <Link href={`/book/${book.id}`} className="p-3 block">
                          <h4 className="text-center text-lg font-bold">
                            {book.title}
                          </h4>
                          <h6 className="text-center">
                            {book.author}
                          </h6>
                          <p className="text-center">
                            {book.description}
                          </p>
                        </Link>
                      </Frag.Else>

                      {/* MODIFICA LIBRO */}
                      <Field id="title"
                             hide_label
                             label="Titolo del libro"
                             type="text"
                             input_class="p-1 bg-white text-black outline text-center text-lg font-bold"
                             disabled={!isEditMode}
                             placeholder="Inserisci il titolo"
                             value={book.title}
                             onChange={e=> bookFeat.update(book_i, "title", e)}
                             error_message={errors[`${book.id}>title`]}
                      />

                      <Field id="author"
                             hide_label
                             label="Autore del libro"
                             type="text"
                             input_class="p-1 bg-white text-black outline text-center"
                             disabled={!isEditMode}
                             placeholder="Inserisci l'autore"
                             value={book.author}
                             onChange={e =>bookFeat.update(book_i, "author", e)}
                             error_message={errors[`${book.id}>author`]}
                      />

                      <Field id="description"
                             hide_label
                             label="Descrizione del libro"
                             type="textarea"
                             input_class="p-1 bg-white text-black outline text-center"
                             disabled={!isEditMode}
                             placeholder="Inserisci la descrizione"
                             value={book.description}
                             onChange={e => bookFeat.update(book_i, "description", e)}
                             error_message={errors[`${book.id}>description`]}
                      />
                    </Frag>

                    {/* DOWNLOAD */}
                    <Frag if={isEditMode}>
                      <Frag.Else>
                        <div className="grid grid-cols-2 justify-between items-center">
                          <button onClick={() => BookContext.download.json.execute(book.id)}
                                  className="p-1 bg-green-800 active:bg-green-700 transition-colors truncate">
                            Json <i className="bi bi-download"></i>
                          </button>

                          <button onClick={() => BookContext.download.md.execute(book.id)}
                                  className="p-1 bg-blue-800 active:bg-blue-700 transition-colors truncate">
                            Markdown <i className="bi bi-markdown"></i>
                          </button>
                        </div>
                      </Frag.Else>

                      <Link href={`/book/${book.id}`}
                            className="py-1 px-2 bg-green-800 active:bg-green-700 transition-colors block">
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
          
        </div>
      </section>
    </main>
  );
}