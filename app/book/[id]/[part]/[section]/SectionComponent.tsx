"use client";

import React, { useEffect, useMemo, useState } from "react";
import { book_schema, Book, Paragraph, paragraph_schema, section_schema } from "@/app/schemas/book_schema";
import Frag from "@/app/shareds/Frag";
import { useBooks } from "@/app/data/BookContext";
import { useRouter } from "next/navigation";
import "./Section.sass";
import { useEditMode } from "@/app/data/EditModeContext";
import Field from "@/app/shareds/Field";
import { safeParse } from "valibot";
import Navbar from "@/app/shareds/navbar";
import { LoadingComponent } from "@/app/shareds/LoadingComponent";
import { useAgreeWrapper } from "@/app/shareds/Agree";
import { toast } from "@/app/tools/feedbacksUI";

interface ChapterProps {
  book_id: number;
  part_title: string;
  section_title: string;
}

export default function SectionComponent({ book_id, part_title, section_title }: ChapterProps) {
  // dati
  const router = useRouter();
  const [book, setBook] = useState<Book | undefined>(undefined);
  
  // isEditMode dal contesto globale
  const { isEditMode, isPageLoaded } = useEditMode();
  const bookContext = useBooks();
  const agree = useAgreeWrapper();

  // ERRORI
  const [errors, setErrors] = useState<{[k:string]: string}>({});

  function toggleErrors(key:string, bookParam: unknown) {
    const validatedBook = safeParse(book_schema, bookParam);

    if (!validatedBook.success) {
      setErrors(prev=> ({...prev, [key]: validatedBook.issues[0].message}));
      toast.danger("Errore di validazione");
      return null;
    } else {
      setErrors(prev=> {
        const newErrors = {...prev};
        delete newErrors[key];
        return newErrors;
      });
      return validatedBook.output;
    }
  }

  // TITOLO
  const [title_value, title_setValue] = useState(section_title);
  useEffect(() => title_setValue(section_title), [section_title]);

  useEffect(() => {
    if (!isNaN(book_id)) {
      const foundBook = bookContext.getBookById(book_id);
      setBook(foundBook);
    }

  }, [book_id, bookContext.getBookById]);
  

  const bookSection = useMemo(() => {
    if (!book?.parts) return undefined;

    const foundPart = book.parts.find(
      (p) => p.title.toLowerCase() === part_title.toLowerCase()
    );

    return (
      foundPart?.sections.find(
        (s) => s.title.toLowerCase() === title_value.toLowerCase()
      ) ??
      foundPart?.sections.find(
        (s) => s.title.toLowerCase() === section_title.toLowerCase()
      )
    );
  }, [book, part_title, section_title, title_value]);


  // ritorna la sezione corrente
  function getSection(bookObj: Book) {
    return bookObj.parts
      ?.find((p) => p.title.toLowerCase() === part_title.toLowerCase())
      ?.sections.find((s) => s.title.toLowerCase() === section_title.toLowerCase());
  }

  // aggiorna il titolo della sezione e reindirizza alla nuova URL
  function title_handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title_value.trim();
    
    if (!book || !trimmed || trimmed === section_title) throw new Error("Titolo non modificato");

    const updated = structuredClone(book);
    const sec = getSection(updated);
    if (!sec) throw new Error("Sezione non trovata");

    sec.title = trimmed;
    
    const validatedBook = toggleErrors("sec_title", updated);
    if (!validatedBook) return;

    bookContext.updateBook(book_id, validatedBook);
    setBook(validatedBook);

    // redirect alla nuova URL del capitolo
    const _part = part_title.replaceAll(" ", "-");
    const _title = trimmed.replaceAll(" ", "-");
    router.push(`/book/${book_id}/${_part}/${_title}`);
  }
  

  const paragraphFunc ={
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
        toast.success("Paragrafo aggiunto");

      // inserisce dopo l'indice 
      } else {
        sec.paragraphs.splice(index + 1, 0, {
          ex_style: "",
          style: "",
          pre_text: "",
          text: "",
        } as Paragraph);
    
        setBook(updated);
        toast.success("Paragrafo aggiunto");
      }
    },
  
    // rimuove un paragrafo
    async handle_remove(index:number, paragraph: Paragraph) {
      if(paragraph.text.length && !(await agree.danger(`Rimuovere il paragrafo "${paragraph.text}"?`, "Rimuovi"))) return;

      if (!book) throw new Error("Book not found");
      const updated = structuredClone(book);
      const sec = getSection(updated);
      if (!sec) throw new Error("Section not found");
  
      sec.paragraphs.splice(index, 1);
      
      setBook(updated);
      bookContext.updateBook(book_id, updated);
      toast.success("Paragrafo rimosso");
    },
  
    handle_change(index: number, key: keyof Paragraph, value: string) {
      if (!book) return;
      const updated = structuredClone(book);
      const sec = getSection(updated);
      if (!sec?.paragraphs[index]) return console.error("Paragrafo non trovato");
  
      (sec.paragraphs as any)[index][key] = value || "";
      setBook(updated);
      
      const errorKey = `${index}>${key}`;
      const validatedBook = toggleErrors(errorKey, updated);
      if (!validatedBook) return;
      
      // salvataggio
      bookContext.updateBook(book_id, validatedBook, false);
    },
  }

  if (!isPageLoaded) return <LoadingComponent />

  return (
    <main id="SectionComponent">
      {/* NAVBAR */}
      <Navbar back_btn={{ href:`/book/${book_id}` }} prop_title={section_title}/>

      <section className="mx-auto container max-w-[400px]">
        {!bookSection ? (
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
                    onChange={(_e) => {
                      title_setValue(_e.target.value);
                      if (!book) return;
                      const updated = structuredClone(book);
                      const sec = getSection(updated);
                      if (!sec) return;
                      sec.title = _e.target.value;
                      const errorKey = "section_title";
                      toggleErrors(errorKey, updated);
                    }} 
                    error_message={errors["section_title"]}
                    id={"title"} 
                    type={"text"} 
                    placeholder={"Titolo del capitolo"}            
            />
            <div className="mt-5 border-y border-gray-500"></div>
          </form>


          {/* WRAPPER PARAGRAFI */}
          <Frag if={bookSection.paragraphs.length > 0} className="pb-30">
            <Frag.Else>
              <div className="py-10 text-center">
                <i className="me-1 bi bi-file-text"></i> 
                Nessun paragrafo
              </div>

              <Frag if={isEditMode} className="flex justify-center">
                <button onClick={_e=> paragraphFunc.handle_create()}
                        className="py-2 px-3 border rounded bg-blue-500/30 text-blue-300">
                  <i className="bi bi-plus-lg"></i>
                  Aggiungi paragrafo
                </button>
              </Frag>
            </Frag.Else>

            {bookSection.paragraphs.map((p, paragraph_i) => (
              <div key={paragraph_i} className="relative">

                {/* PARAGRAFO */}
                <div className={`pt-3 ${p.ex_style || ""}`}>
                  <div className={`p-1 ${p.in_style || ""}`}> 

                  {/* STRUMENTI EDITING */}
                  <Frag if={isEditMode} className="mb-5 text-black bg-white/60 outline rounded overflow-hidden">
                    <div className="grid grid-cols-[1fr_auto]">
                      <div>
                        <Field  input_class="p-1 border" 
                                type="text" 
                                value={p.ex_style || ''} 
                                placeholder="Stile esterno (tailwind)"
                                onChange={(_e:any) => paragraphFunc.handle_change(paragraph_i, "ex_style", _e.target.value.toLowerCase())}
                                id={"ex_style>" + paragraph_i}
                                hide_label label={"Stile esterno (tailwind)"}
                                error_message={errors[`${paragraph_i}>ex_style`]}
                        />
                      </div>

                      <button type="button" 
                              onClick={() => paragraphFunc.handle_remove(paragraph_i, p)}
                              className="px-2 py-1 bg-red-600 text-white">
                        <i className="bi bi-trash"></i>
                      </button>

                      <div>
                        <Field  input_class="p-1 border" 
                                type="text" 
                                value={p.in_style || ''} 
                                placeholder="Stile interno (tailwind)"
                                onInput={(_e:any) => paragraphFunc.handle_change(paragraph_i, "in_style", _e.target.value.toLowerCase())}
                                id={"in_style>" + paragraph_i}
                                hide_label label={"Stile interno (tailwind)"}
                                error_message={errors[`${paragraph_i}>in_style`]}
                        />
                      </div>
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
                                onChange={(_e) => paragraphFunc.handle_change(paragraph_i, "pre_text", _e.target.value)} 
                                hide_label label={"Titolo"}
                                error_message={errors[`${paragraph_i}>pre_text`]}
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
                            onInput={(_e:any) => paragraphFunc.handle_change(paragraph_i, "text", _e.target.value)}
                            error_message={errors[`${paragraph_i}>text`]}
                    />

                  </div>
                </div>
                {/* PARAGRAFO */}

                {/* pulsante inserimento */}
                <Frag if={isEditMode} className="py-4">
                  <button onClick={_e=> paragraphFunc.handle_create(paragraph_i)}
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