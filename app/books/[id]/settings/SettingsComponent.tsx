"use client";

import Navigation from "@/app/shareds/Navigation";
import { Breadcrumb } from "@/app/shareds/Breadcrumb";
import Bottombar from "@/app/shareds/Bottombar";
import Frag from "@/app/shareds/Frag";
import { Dropdown, DropdownContent, DropdownSummary } from "@/app/shareds/Dropdown";
import { LoadingComponent } from "@/app/shareds/LoadingComponent";
import { useMemo } from "react";
import { Book } from "@/app/schemas/book_schema";
import { useBookComponent } from "../useBookComponent";
import Field from "@/app/shareds/Field";
import { BookNavbar } from "../structure/StructureComponent";

interface UseBookComponentProps { id: string }

export default function SettingsComponent(props: UseBookComponentProps) {
  const data = useBookComponent(props);
  const { view, book, page, errors, handleUpdateBook, auth } = data;

  const canRead = useMemo(() => !!book && !!auth.CONTROLS.canRead(book), [book, auth]);
  const canWrite = useMemo(() => !!book && !!auth.CONTROLS.canWrite(book), [book, auth]);

  type fieldType = {
    key: keyof Book;
    label: string;
    value: any;
    placeholder: string;
    asterisk?: boolean;
    rows?: number;
    preLabel?: string;
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
      },
      {
        key: "auth_write",
        value: book.auth_write,
        label: "Codice di scrittura",
        placeholder: "Codice di scrittura",
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
                      type={field.key === "description" ? "textarea" : "text"}
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