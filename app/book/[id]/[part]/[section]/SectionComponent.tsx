"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Book, Paragraph, paragraph_schema } from "@/app/schemas/book_schema";
import Frag from "@/app/shareds/Frag";
import { useBooks } from "@/app/data/BookContext";
import { useRouter } from "next/navigation";
import "./Section.sass";
import { useEditMode } from "@/app/data/EditModeContext";
import Field from "@/app/shareds/Field";
import { safeParse } from "valibot";
import Navbar from "@/app/shareds/navbar";
import { LoadingComponent } from "@/app/shareds/LoadingComponent";

interface ChapterProps {
  id: number;
  part: string;
  section: string;
}

export default function SectionComponent({ id, part, section }: ChapterProps) {
  // dati
  const router = useRouter();
  const [book, setBook] = useState<Book | undefined>(undefined);
  
  // isEditMode dal contesto globale
  const { isEditMode, isPageLoaded } = useEditMode();
  const { getBookById, updateBook } = useBooks();

  // TITOLO
  const [title_value, title_setValue] = useState(section);
  useEffect(() => title_setValue(section), [section]);


  useEffect(() => {
    if (!isNaN(id)) {
      const foundBook = getBookById(id);
      setBook(foundBook);
    }

  }, [id, getBookById]);
  

  const chapter = useMemo(() => {
    if (!book?.parts) return undefined;

    const foundPart = book.parts.find(
      (p) => p.title.toLowerCase() === part.toLowerCase()
    );

    return (
      foundPart?.sections.find(
        (s) => s.title.toLowerCase() === title_value.toLowerCase()
      ) ??
      foundPart?.sections.find(
        (s) => s.title.toLowerCase() === section.toLowerCase()
      )
    );
  }, [book, part, section, title_value]);


  // ritorna la sezione corrente
  function getSection(bookObj: Book) {
    return bookObj.parts
      ?.find((p) => p.title.toLowerCase() === part.toLowerCase())
      ?.sections.find((s) => s.title.toLowerCase() === section.toLowerCase());
  }

  // aggiorna il titolo della sezione e reindirizza alla nuova URL
  function title_handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title_value.trim();
    
    if (!book || !trimmed || trimmed === section) throw new Error("Titolo non modificato");

    const updated = structuredClone(book);
    const sec = getSection(updated);
    if (!sec) throw new Error("Sezione non trovata");

    sec.title = trimmed;
    updateBook(id, updated);
    setBook(updated);

    // redirect alla nuova URL del capitolo
    const _part = part.replaceAll(" ", "-");
    const _title = trimmed.replaceAll(" ", "-");
    router.push(`/book/${id}/${_part}/${_title}`);
  }
  
  // oggetto di errori "2>text": "messaggio"
  const errors_value =useMemo<Record<string, string>>(() => {
    const obj: Record<string, string> = {};

    chapter?.paragraphs.forEach((p, i) => {
      const res = safeParse(paragraph_schema, p);
      if (res.success) return;
      
      const attr_name = res.issues?.[0].path?.[0]?.key;        
      if(!attr_name) return;

      const newKey = `${i}>${attr_name}`;
      obj[newKey] = res.issues?.map((i) => i.message).join(", ");
    });

    return obj;
  }, [chapter]);


  const paragraph ={
    // inserisce un paragrafo vuoto alla fine
    handle_create(index?:number){
      if (!book) return;
      const updated = structuredClone(book);
      const sec = getSection(updated);
      if (!sec) return;

      // nessun indice -> aggiungi in fondo
      if(index === undefined) {
        sec.paragraphs.push({
          ex_style: "",
          style: "",
          pre_text: "",
          text: "",
        } as Paragraph);
        setBook(updated);

      // inserisce dopo l'indice 
      } else {
        sec.paragraphs.splice(index + 1, 0, {
          ex_style: "",
          style: "",
          pre_text: "",
          text: "",
        } as Paragraph);
    
        setBook(updated);
      }
    },
  
    // rimuove un paragrafo
    handle_remove(index:number, paragraph: Paragraph) {
      if(paragraph.text.length && !confirm(`Rimuovere il paragrafo "${paragraph.text}"?`)) return;

      if (!book) throw new Error("Book not found");
      const updated = structuredClone(book);
      const sec = getSection(updated);
      if (!sec) throw new Error("Section not found");
  
      sec.paragraphs.splice(index, 1);
      
      setBook(updated);
      updateBook(id, updated);
    },
  
    handle_change(index: number, key: keyof Paragraph, value: string) {
      if (!book) return;
      const updated = structuredClone(book);
      const sec = getSection(updated);
      if (!sec?.paragraphs[index]) return console.error("Paragrafo non trovato");
  
      (sec.paragraphs as any)[index][key] = value || "";
      setBook(updated);
      // salvataggio     
      updateBook(id, updated, false);
    },
  }

  if (!isPageLoaded) return <LoadingComponent />

  return (
    <main id="chapter">
      {/* NAVBAR */}
      <Navbar back_btn={{ href:`/book/${id}` }} prop_title={section}/>

      <section className="mx-auto container max-w-[400px]">
        {!chapter ? (
          <div className="py-10 text-center text-red-500">
            <i className="me-1 bi bi-exclamation-triangle"></i> 
            Capitolo non trovato
          </div>

        ) : (<>
          {/* TITOLO SEZIONE */}
          <form onSubmit={title_handleSubmit} className="p-3 py-10 text-center">
            <Field  input_class="text-3xl font-bold text-center"
                    hide_label={isEditMode ? false : true}
                    label="Titolo del capitolo"
                    value={title_value}
                    disabled={!isEditMode}
                    asterisk
                    onChange={(_e) => title_setValue(_e.target.value)} 
                    id={"title"} 
                    type={"text"} 
                    placeholder={"Titolo del capitolo"}            
            />
            <div className="mt-5 border-y border-gray-500"></div>
          </form>


          {/* WRAPPER PARAGRAFI */}
          <Frag if={chapter.paragraphs.length > 0} className="pb-30">
            <Frag.Else>
              <div className="py-10 text-center">
                <i className="me-1 bi bi-file-text"></i> 
                Nessun paragrafo
              </div>

              <Frag if={isEditMode} className="flex justify-center">
                <button onClick={_e=> paragraph.handle_create()}
                        className="py-2 px-3 border rounded bg-blue-500/30 text-blue-300">
                  <i className="bi bi-plus-lg"></i>
                  Aggiungi paragrafo
                </button>
              </Frag>
            </Frag.Else>

            {chapter.paragraphs.map((p, paragraph_i) => (
              <div key={paragraph_i} className="relative">

                {/* PARAGRAFO */}
                <div className={`pt-3 ${p.ex_style || ""}`}>
                  <div className={`p-1 ${p.in_style || ""}`}> 

                  {/* STRUMENTI EDITING */}
                  <Frag if={isEditMode} className="mb-5 text-black bg-white/60 outline rounded overflow-hidden">
                    <div className="grid grid-cols-[1fr_auto]">
                      <Field  input_class="p-1 border" 
                              type="text" 
                              value={p.ex_style || ''} 
                              placeholder="Stile esterno (tailwind)"
                              onChange={(_e) => paragraph.handle_change(paragraph_i, "ex_style", _e.target.value.toLowerCase())}
                              id={"ex_style>" + paragraph_i}
                              hide_label label={"Stile esterno (tailwind)"}
                              error_message={errors_value[`${paragraph_i}>ex_style`]}
                      />

                      <button type="button" 
                              onClick={() => paragraph.handle_remove(paragraph_i, p)}
                              className="px-2 py-1 bg-red-600 text-white">
                        <i className="bi bi-trash"></i>
                      </button>

                      <Field  input_class="p-1 border" 
                              type="text" 
                              value={p.in_style || ''} 
                              placeholder="Stile interno (tailwind)"
                              onChange={(_e) => paragraph.handle_change(paragraph_i, "in_style", _e.target.value.toLowerCase())}
                              id={"in_style>" + paragraph_i}
                              hide_label label={"Stile interno (tailwind)"}
                              error_message={errors_value[`${paragraph_i}>in_style`]}
                      />
                    </div>
                  </Frag>

                    {/* TITOLO */}
                    <Frag if={!!p.pre_text || !!isEditMode}>
                        <Field  input_class="mb-3 px-1 max-w-[100px] mx-auto font-bold text-center text-inherit"
                                type="text"
                                id={"pre_text>" + paragraph_i}
                                value={p.pre_text || ''}
                                disabled={!isEditMode}
                                placeholder="Titolo"
                                onChange={(_e) => paragraph.handle_change(paragraph_i, "pre_text", _e.target.value)} 
                                hide_label label={"Titolo"}
                                error_message={errors_value[`${paragraph_i}>pre_text`]}
                        />
                    </Frag>


                    {/* TESTO */}
                    <Field  input_class="p-1 text-center" 
                            placeholder="Testo del paragrafo" 
                            value={p.text} 
                            disabled={!isEditMode}
                            hide_label
                            label="Testo del paragrafo"
                            asterisk
                            type="textarea"
                            id={"text>" + paragraph_i}
                            onChange={(_e) => paragraph.handle_change(paragraph_i, "text", _e.target.value)}
                            error_message={errors_value[`${paragraph_i}>text`]}
                    />

                  </div>
                </div>
                {/* PARAGRAFO */}

                {/* pulsante inserimento */}
                <Frag if={isEditMode} className="py-4">
                  <button onClick={_e=> paragraph.handle_create(paragraph_i)}
                          className="mx-auto block px-1 border rounded-full bg-blue-500/30 text-blue-300">
                    <i className="bi bi-plus-lg"></i>
                  </button>
                </Frag>

              </div>
            ))}
          </Frag>
          {/* WRAPPER PARAGRAFI */}
          
        </>)}
      </section>
    </main>
  )
}