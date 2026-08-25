"use client";

import { Breadcrumb } from "@/app/shareds/Breadcrumb";
import Bottombar from "@/app/shareds/Bottombar";
import Frag from "@/app/shareds/Frag";
import { LoadingComponent } from "@/app/shareds/LoadingComponent";
import React, { useMemo, useState } from "react";
import { Book } from "@/app/schemas/book_schema";
import { useBookComponent } from "../useBookComponent";
import Field from "@/app/shareds/Field";
import { BookNavbar } from "../structure/StructureComponent";
import { useAuthContext } from "@/app/data/AuthContext";
import { useCommonPagesContext } from "@/app/data/CommonPagesContext";
import { useDot } from "@/app/tools/customStates";
import handleArrowKeyFocus from "@/app/tools/handleArrowKeyFocus";

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
    preLabel?: string;
    type?: string;
    className?: string;
  };

  const fields = useMemo((): fieldType[] => {
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
            <h2 className="text-xl font-bold my-4">Opsioni</h2>
            <ol className="flex flex-wrap gap-2 items-start">
              {fields.map((field) => <React.Fragment key={field.key}>
                {field.preLabel && (
                  <li className="w-full pt-3 font-bolder italic">{field.preLabel}</li>
                )}
                <li className={`bg-white outline rounded ${field.className || "flex-1 min-w-[150px]"}`}>
                  <Field
                    id={field.key}
                    label={field.label}
                    label_class="px-2 text-black text-sm font-bold italic"
                    input_class="pb-2 px-3 text-black"
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
          </section>
        </Frag>
      </main>
    </>
  );
}