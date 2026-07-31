"use client";

import { useEffect, useMemo, useState } from "react";
import { Book, Paragraph, paragraph_schema } from "@/app/schemas/book_schema";
import Frag from "@/app/shareds/Frag";
import { books_store } from "@/app/data/books_store";
import Link from "next/link";
import { redirect } from "next/navigation";
import "./chapter.sass";
import { useEditMode } from "@/app/data/EditModeContext";
import Field from "@/app/shareds/Field";
import { safeParse } from "valibot";
import Navbar from "@/app/shareds/navbar";

interface ChapterProps {
  id: number;
  part: string;
  section: string;
}

export default function Chapter({ id, part, section }: ChapterProps) {
  // dati
  const [book, setBook] = useState<Book | undefined>(undefined);
  const chapter = useMemo(() => {
    if (!book?.parts) return undefined;
    const foundPart = book.parts.find((p) => p.title.toLowerCase() === part.toLowerCase());
    return foundPart?.sections.find((s) => s.title.toLowerCase() === section.toLowerCase());
  }, [book, part, section]);

  // user interface
  const [isLoaded, setIsLoaded] = useState(false);
  const [width_value, width_setValue] = useState(400);
  
  // editMode dal contesto globale
  const { editMode, toggleEditMode } = useEditMode();

  useEffect(() => {
    if (!isNaN(id)) {
      const foundBook = books_store.getBookById(id);
      setBook(foundBook);
    }
    setIsLoaded(true);

    // larghezza
    const setWidth =()=> width_setValue(window.innerWidth);
    setWidth();
    window.addEventListener('resize', setWidth);
    return () => { window.removeEventListener('resize', setWidth) };
  }, [id]);

  // ritorna la sezione corrente
  function getSection(bookObj: Book) {
    return bookObj.parts
      ?.find((p) => p.title.toLowerCase() === part.toLowerCase())
      ?.sections.find((s) => s.title.toLowerCase() === section.toLowerCase());
  }

  // aggiorna il template e (opsionale) salva il libro
  function saveAndSetBook(updatedBook: Book, save=true) {
    setBook(updatedBook);
    if(save) books_store.updateBook(id, updatedBook);
  }


  // TITOLO
  const [title_value, title_setValue] = useState(section);

  useEffect(() => {
    title_setValue(section);
  }, [section]);

  // aggiorna il titolo della sezione e reindirizza alla nuova URL
  function title_handleSubmit(newTitle: string) {
    const trimmed = newTitle.trim();
    if (!book || !trimmed || trimmed === section) return;

    const updated = structuredClone(book);
    const sec = getSection(updated);
    if (!sec) return;

    sec.title = trimmed;
    books_store.updateBook(id, updated);
    setBook(updated);

    // redirect alla nuova URL del capitolo
    const _part = part.replaceAll(" ", "-");
    const _title = trimmed.replaceAll(" ", "-");
    redirect(`/book/${id}/${_part}/${_title}`);
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
    handle_create(){
      if (!book) return;
      const updated = structuredClone(book);
      const sec = getSection(updated);
      if (!sec) return;
  
      sec.paragraphs.push({
        ex_style: "",
        style: "",
        pre_text: "",
        text: "",
      } as Paragraph);
  
      saveAndSetBook(updated, false);
    },
  
    // rimuove un paragrafo
    handle_remove(index: number) {
      if (!book) return;
      const updated = structuredClone(book);
      const sec = getSection(updated);
      if (!sec) return;
  
      sec.paragraphs.splice(index, 1);
      saveAndSetBook(updated);
    },
  
    handle_change(index: number, key: keyof Paragraph, value: string) {
      if (!book) return;
      const updated = structuredClone(book);
      const sec = getSection(updated);
      if (!sec?.paragraphs[index]) return console.error("Paragrafo non trovato");
  
      (sec.paragraphs as any)[index][key] = value || "";
      setBook(updated);
      // salvataggio     
      books_store.updateBook(id, updated, false);
    },
  }

  if (!isLoaded) return <div className="text-center text-gray-400 py-20">Caricamento...</div>

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
          {/* TITOLO */}
          <div className="p-3 py-10 text-center">
            <Field  input_class="text-3xl font-bold text-center"
                    hide_label={editMode ? false : true}
                    label="Titolo del capitolo"
                    value={title_value}
                    disabled={!editMode}
                    onChange={(_v) => title_setValue(_v)}
                    // @ts-ignore
                    onBlur={() => title_handleSubmit(title_value)}
                    onKeyDown={(e:React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        e.currentTarget.blur();
                      }
                    }}
            />
            <div className="mt-5 border-y border-gray-500"></div>
          </div>


          {/* PARAGRAFO */}
          <div className="pb-30">
            {chapter.paragraphs.map((p, paragraph_i) => (
              <div className="py-3" key={paragraph_i}>
                <div className={`${p.ex_style || ""}`}>
                  <div className={`relative p-3 ${p.in_style || ""}`}> 

                    <Frag if={!!p.pre_text || !!editMode}>
                      <div className="absolute top-0 start-1/2 -translate-x-1/2 rounded" 
                            style={{transform: 'translateY(-15px)', 
                                    background: (p.in_style?.includes('bg-') || p.ex_style?.includes('bg-')) ? 'inherit' : 'var(--global-bg)', 
                                    borderLeftWidth:'inherit', borderRightWidth:'inherit',
                                    borderLeftColor:'inherit', borderRightColor:'inherit'}}>
                        {/* input pre_text */}
                        <Field  input_class="px-1 max-w-[100px] mx-auto font-bold text-center text-inherit"
                                type="text"
                                id={"pre_text>" + paragraph_i}
                                value={p.pre_text || ''}
                                disabled={!editMode}
                                placeholder="Titolo"
                                onChange={(_v) => paragraph.handle_change(paragraph_i, "pre_text", _v)} 
                                hide_label label={"Titolo"}
                                error_message={errors_value[`${paragraph_i}>pre_text`]}
                        />
                      </div>
                    </Frag>

                    {/* input stile */}
                    <Frag if={editMode}>
                      <Field  input_class="mb-2 p-1 text-sm" 
                              type="text" 
                              value={p.ex_style || ''} 
                              placeholder="* Stile esterno (tailwind)"
                              onChange={(_v) => paragraph.handle_change(paragraph_i, "ex_style", _v)}
                              id={"ex_style>" + paragraph_i}
                              hide_label label={"Stile esterno (tailwind)"}
                              error_message={errors_value[`${paragraph_i}>ex_style`]}
                      />
                      <Field input_class="mb-2 p-1 text-sm" type="text" 
                              value={p.in_style || ''} 
                              placeholder="* Stile interno (tailwind)"
                              onChange={(_v) => paragraph.handle_change(paragraph_i, "in_style", _v)}
                              id={"in_style>" + paragraph_i}
                              hide_label label={"Stile interno (tailwind)"}
                              error_message={errors_value[`${paragraph_i}>in_style`]}
                      />
                    </Frag>


                    {/* input testo */}
                    <Field  input_class="mb-2 p-1 text-sm" 
                            placeholder="Testo del paragrafo" 
                            value={p.text} 
                            disabled={!editMode}
                            hide_label
                            label="Testo del paragrafo"
                            type="textarea"
                            id={"text>" + paragraph_i}
                            onChange={(_v) => paragraph.handle_change(paragraph_i, "text", _v)}
                            error_message={errors_value[`${paragraph_i}>text`]}
                    />


                    {/* PULSANTE RIMUOVI PARAGRAFO */}
                    <Frag if={editMode} className="absolute top-0 end-1">
                      <button type="button" 
                              onClick={() => paragraph.handle_remove(paragraph_i)}
                              className="px-2 py-1 bg-red-600 text-white border rounded-full"
                              style={{transform: "translateY(-50%)"}}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </Frag>

                  </div>
                </div>
              </div>
            ))}
              
            {/* PULSANTE AGGIUNTA PARAGRAFO */}
            <Frag if={editMode} className="py-5">
              <button type="button" 
                      onClick={paragraph.handle_create}
                      className="px-3 py-2 m-auto bg-green-500/50 block rounded">
                <i className="bi bi-plus"></i>
                Aggiungi paragrafo
              </button>
            </Frag>
          </div>
          {/* PARAGRAFO */}
          
        </>)}
      </section>
    </main>
  )
}