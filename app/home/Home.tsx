"use client";

import Link from "next/link";
import Navbar from "../shareds/navbar";
import { useEffect, useMemo, useState } from "react";
import { Book, book_schema } from "../schemas/_book_schema";
import { books_store } from "../data/books_store";
import { safeParse } from "valibot";
import Frag from "../shareds/Frag";
import { useEditMode } from "../data/EditModeContext";
import Field from "../shareds/Field";

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [weight, setWeight] = useState(0);
  const [limit, setLimit] = useState(0);

  useEffect(() => {
    setBooks(books_store.getBooks());

    const handleResize = () => {
      setWeight(window.innerWidth);
      setLimit(Math.floor(window.innerWidth / 10));
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Funzione per eliminare un libro
  const handleDeleteBook = (id?: number) => {
    if (!confirm("Rimuovere il libro?")) return;
    if (id == undefined) return;
    books_store.deleteBook(id);
    setBooks(books_store.getBooks()); // Aggiorna lo stato locale
  };

  function ellipsis(text: string) {
    return weight > 350 ? text : text.slice(0, limit) + "...";
  }

  // Form ( invariato )
  const { editMode } = useEditMode();
  const form_editMode = editMode;
  const [form_state, form_setState] = useState<Omit<Book, "id" | "parts">>({
    title: "",
    description: "",
    author: "",
  });

  const form_array = useMemo(
    () => Object.entries(form_state).map(([key, value]) => ({ key, value })),
    [form_state]
  );

  function form_reset() {
    form_setSubmitOnce(false);
    form_setState({
      title: "",
      description: "",
      author: "",
    });
  }

  const [form_submitOnce, form_setSubmitOnce] = useState(false);
  const form_newBook = useMemo(() => safeParse(book_schema, form_state), [form_state]);

  const form_errors: { [k: string]: string } = useMemo(() => {
    let result = {};
    form_newBook.issues?.forEach((issue) => {
      const path = (issue as any).path[0].key;
      (result as any)[path] = issue.message;
    });
    return result;
  }, [form_newBook]);

  function form_handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    form_setSubmitOnce(true);

    if (form_newBook.success) {
      books_store.createBook(form_newBook.output);
      form_reset();
      setBooks(books_store.getBooks()); // Aggiorna lo stato locale
    }
  }

  return (
    <main id="home">
      <Navbar />

      <section className="p-2 mx-auto container max-w-[400px]">
        {/* FORM */}
        <Frag if={form_editMode} className="bg-black/20 p-3 rounded-lg">
          <h2 className="py-3 text-2xl text-center">Aggiungi libro</h2>
          <p className="text-sm text-center">
            I campi contrassegnati con <b className="text-red-500">*</b> sono obbligatori
          </p>

          <form onSubmit={form_handleSubmit} className="">
            {form_array.map(({ key, value }) => (
              <div key={key} className="my-3">
                <Field id={key} 
                       label={key.charAt(0).toUpperCase() + key.slice(1)} 
                       type="text" 
                       placeholder={"Inserire " + key} 
                       value={String(value)} 
                       input_class="py-1 px-2 w-full bg-white text-black rounded"
                       error_message={form_submitOnce ? (form_errors[key] || "") : ""}
                       onChange={(value) => form_setState({ ...form_state, [key]: value })}
                />
              </div>
            ))}

            <div className="grid grid-cols-2 rounded overflow-hidden">
              <button type="submit" className="p-2 bg-green-700 hover:bg-green-800 transition-colors">
                <i className="me-1 bi bi-plus-lg"></i>
                <span>Aggiungi</span>
              </button>
              <button type="button"
                      className="p-2 bg-red-700 hover:bg-red-800 transition-colors"
                      onClick={() => form_reset()}>
                <i className="me-1 bi bi-x-lg"></i>
                <span>Reset</span>
              </button>
            </div>

          </form>
        </Frag>


        {/* LIBRI */}
        <Frag if={books.length > 0} className="text-center">
          <Frag.Else>
            <div className="mt-20 text-red-400 text-center">
              <i className="bi bi-exclamation-triangle me-1"></i>
              <span>Nessun libro trovato</span>
            </div>
          </Frag.Else>

          <div className="my-5">
            <h1 className="text-2xl font-bold">Libri</h1>
            <p className="text-gray-400">Totale: {books.length} libri</p>
          </div>

          <ol className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {books.map((book) => (
              <li key={book.id} className="bg-white/10 hover:bg-white/30 transition-colors rounded overflow-hidden">
                <div className="text-center relative">

                  {/* pulsante eliminazione */}
                  <Frag if={editMode} className="absolute top-0 right-0">
                    <button onClick={() => handleDeleteBook(book.id)} 
                            className="py-1 px-2 bg-red-600 hover:bg-red-700 transition-colors">
                      <i className="bi bi-trash-fill"></i>
                    </button>
                  </Frag>

                  <Link href={`/book/${book.id}`} className="p-2 block">
                    <h4 className="font-bold">{book.title}</h4>
                    <p className="pb-2 mb-2 border-b border-gray-500 italic text-xs">
                      By "{book.author}"
                    </p>

                    <p className="text-sm">{ellipsis(book.description)}</p>
                  </Link>

                </div>
              </li>
            ))}
          </ol>

        </Frag>
      </section>
    </main>
  );
}