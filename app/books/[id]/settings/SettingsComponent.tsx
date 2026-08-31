"use client";

import { Breadcrumb } from "@/app/shareds/Breadcrumb";
import Frag from "@/app/shareds/Frag";
import { LoadingComponent } from "@/app/shareds/LoadingComponent";
import React, { useMemo } from "react";
import { Book } from "@/app/schemas/book_schema";
import { useBookComponent } from "../useBookComponent";
import Field from "@/app/shareds/Field";
import { useAuthContext } from "@/app/data/AuthContext";
import { useCommonPagesContext } from "@/app/data/CommonPagesContext";
import handleArrowKeyFocus from "@/app/tools/handleArrowKeyFocus";
import AuthFormComponent from "./SettingsCodesFormComponent";
import { useBookContext } from "@/app/data/BookContext";
import { useRouter } from "next/navigation";
import { useAgreeWrapper } from "@/app/shareds/Agree";
import Navigation from "@/app/shareds/Navigation";
import UnathorizeComponent from "@/app/shareds/UnathorizeComponent";

export const settings_component_label_class="px-3 text-black text-sm font-bold italic"
export const settings_component_input_class="pb-2 px-3 text-black w-full"

interface UseBookComponentProps { id: string }
export default function SettingsComponent(props: UseBookComponentProps) {
  const { book, errors, handleUpdateBook } = useBookComponent(props);
  const authContext = useAuthContext();
  const page = useCommonPagesContext();
  const bookContext = useBookContext();
  const route = useRouter();
  const agree = useAgreeWrapper();

  const canRead = useMemo(() => !!book && !!authContext.CONTROLS.canRead(book), [book, authContext]);
  const canWrite = useMemo(() => !!book && !!authContext.CONTROLS.canWrite(book), [book, authContext]);

  type fieldType = {
    key: keyof Book;
    label: string;
    value: any;
    placeholder: string;
    asterisk?: boolean;
    preLabel?: string;
    type?: string;
    className?: string;
  };

  const generalFields = useMemo((): fieldType[] => {
    if (!book) return [];
    return [
      {
        preLabel: "Generali",
        key: "title",
        value: book.title,
        label: "Titolo",
        placeholder: "Inserire il titolo del libro",
        asterisk: true,
      },
      {
        key: "author_name",
        value: book.author_name,
        label: "Autore",
        placeholder: "Inserire il nome dell'autore",
        asterisk: true,
      },
      {
        key: "description",
        value: book.description,
        label: "Descrizione",
        placeholder: "Descrivi brevemente di cosa parla il libro",
        asterisk: true,
        type:"textarea",
        className: "w-full",
      },
    ];
  }, [book]);

  async function handleDelete() {
    if(!book) return console.error("Libro non disponibile");
    if(!(await agree.danger(`Rimuovere l'intero libro '${book?.author_name}'?`, "Rimuovi"))) return;
    const res = bookContext.deleteBook(book.id)

    if(!res) return console.error("Eliminazione fallita");
    route.push("/books")
  }

  if (!page.isPageLoaded) return <LoadingComponent />;
  if(!canWrite) return <UnathorizeComponent />

  return (
    <>
      <Navigation page_title={book?.title ||""} back_btn={{ href:"/books" }} />    

      <Breadcrumb routes={["Catalogo:/books", `${book?.title}:/${book?.id}/structure`, "Impostazioni"]} />

      <main id="StructureComponent" 
            className="mx-auto container max-w-[500px]"
            onKeyDown={handleArrowKeyFocus}>
        <Frag if={!canRead}>
          <div className="p-3 py-8 text-center text-red-500">
            <i className="bi bi-exclamation-triangle text-2xl"></i>
            <span>Libro non trovato</span>
          </div>
        </Frag>

        <Frag if={!!canRead}>
          <section className="px-3 pb-10 min-h-dvh">
            <h2 className="text-xl font-bold my-4">Opzioni</h2>
            
            <ol className="flex flex-wrap gap-2 items-start">
              {generalFields.map((field) => <React.Fragment key={field.key}>
                {field.preLabel && (
                  <li className="w-full pt-3 font-bolder italic">{field.preLabel}</li>
                )}
                <li className={`bg-white outline rounded ${field.className || "flex-1 min-w-[200px]"}`}>
                  <Field
                    id={field.key}
                    label={field.label}
                    label_class={settings_component_label_class}
                    input_class={settings_component_input_class}
                    asterisk={field.asterisk}
                    type={field.type || "text"}
                    placeholder={field.placeholder}
                    value={field.value || ""}
                    error_message={errors[field.key]}
                    onChange={(_e) => handleUpdateBook(field.key, _e.target.value)}
                  />
                </li>
              </React.Fragment>)}
            </ol>

            <h3 className="my-3 text-red-400 font-bold">
              <i className="bi bi-exclamation-triangle"></i> Danger zone
            </h3>
            <h4 className="pt-2 text-red-400">Codice per la lettura</h4>
            <p className="m-2 p-3 bg-blue-700 outline rounded">
              <i className="bi bi-info-circle"></i> Chiunque abbia questo codice sarà autorizzato a leggere questo libro. Se non impostato alcun codice, il libro sarà leggibile da tutti.
            </p>
            <AuthFormComponent labelParam={"Codice lettura"} attributeKey="auth_read" book={book!} />
            
            <h4 className="pt-2 text-red-400">Codice per la scrittura</h4>
            <p className="m-2 p-3 bg-blue-700 outline rounded">
              <i className="bi bi-info-circle"></i> Chiunque abbia questo codice sarà autorizzato a modificare e rimuovere questo libro. Se non impostato alcun codice, sarà modificabile da chiunque.
            </p>
            <AuthFormComponent labelParam={"Codice scrittura"} attributeKey="auth_write" book={book!} />


            {/* elimina */}
            <div className="p-2 my-2 outline outline-red-400 rounded">
              <div className="flex justify-between items-center">
                <strong className="text-red-400">Rimuovi questo libro</strong>
                <button onClick={handleDelete} className="px-3 py-2 bg-red-600 rounded">Elimina</button>
              </div>
            </div>

          </section>
        </Frag>
      </main>
    </>
  );
}