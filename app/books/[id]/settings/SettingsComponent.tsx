"use client";

import { Breadcrumb } from "@/app/shareds/Breadcrumb";
import Bottombar from "@/app/shareds/Bottombar";
import Frag from "@/app/shareds/Frag";
import { LoadingComponent } from "@/app/shareds/LoadingComponent";
import { useMemo, useState } from "react";
import { Book } from "@/app/schemas/book_schema";
import { useBookComponent } from "../useBookComponent";
import Field from "@/app/shareds/Field";
import { BookNavbar } from "../structure/StructureComponent";
import { useAuthContext } from "@/app/data/AuthContext";
import { useCommonPagesContext } from "@/app/data/CommonPagesContext";
import { useDot } from "@/app/tools/customStates";

interface UseBookComponentProps { id: string }

export default function SettingsComponent(props: UseBookComponentProps) {
  const { book, errors, handleUpdateBook } = useBookComponent(props);
  const authContext = useAuthContext();
  const page = useCommonPagesContext();

  const canRead = useMemo(() => !!book && !!authContext.CONTROLS.canRead(book), [book, authContext]);
  const canWrite = useMemo(() => !!book && !!authContext.CONTROLS.canWrite(book), [book, authContext]);

  type fieldType = {
    key: keyof Book;
    label: string;
    value: any;
    placeholder: string;
    asterisk?: boolean;
    rows?: number;
    preLabel?: string;
    type?: string;
  };

  const fields = useMemo((): fieldType[] => {
    if (!book) return [];
    return [
      {
        preLabel: "Generali",
        key: "title",
        value: book.title,
        label: "Titolo",
        placeholder: "Titolo",
        asterisk: true,
      },
      {
        key: "description",
        value: book.description,
        label: "Descrizione",
        placeholder: "Descrizione",
        asterisk: true,
        rows: 5,
        type:"textarea",
      },
      {
        key: "author_name",
        value: book.author_name,
        label: "Autore",
        placeholder: "Autore",
        asterisk: true,
      },
      {
        preLabel: "Autorizzazioni",
        key: "auth_read",
        value: book.auth_read,
        label: "Codice di lettura",
        placeholder: "Codice di lettura",
        type: "password"
      },
      {
        key: "auth_write",
        value: book.auth_write,
        label: "Codice di scrittura",
        placeholder: "Codice di scrittura",
        type: "password"
      },
    ];
  }, [book]);


  if (!page.isPageLoaded) return <LoadingComponent />;
  return (
    <>
      <BookNavbar book={book} canRead={canRead} canWrite={canWrite} />

      <Breadcrumb />

      <main id="StructureComponent" className="mx-auto container max-w-[800px]">
        <Frag if={!canRead}>
          <div className="p-3 py-8 text-center text-red-500">
            <i className="bi bi-exclamation-triangle text-2xl"></i>
            <span>Libro non trovato</span>
          </div>
        </Frag>

        <Frag if={!!canRead}>
          <section className="px-3 pb-10 min-h-dvh">
            <ol>
              {fields.map((field) => (
                <li key={field.key}>
                  {field.preLabel && (
                    <div className="pt-3 font-bolder italic">{field.preLabel}</div>
                  )}
                  <div>
                    <Field
                      id={field.key}
                      label={field.label}
                      input_class={`p-2 rounded bg-white text-black outline`}
                      asterisk={field.asterisk}
                      type={field.type || "text"}
                      rows={field.rows}
                      placeholder={field.placeholder}
                      value={field.value || ""}
                      error_message={errors[field.key]}
                      onChange={(_e) => handleUpdateBook(field.key, _e.target.value)}
                    />
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </Frag>
      </main>

      <Bottombar page={page} />
    </>
  );
}