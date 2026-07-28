"use client";

import { useEffect, useMemo, useState } from "react";
import { Book, Paragraph } from "@/app/schemas/_book_schema";
import Frag from "@/app/shareds/Frag";
import { books_store } from "@/app/data/books_store";
import Link from "next/link";
import { redirect } from "next/navigation";
import "./chapter.sass";
import { useEditMode } from "@/app/data/EditModeContext";

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
  
  const paragraph ={
    // inserisce un paragrafo vuoto alla fine
    handle_create(){
      if (!book) return;
      const updated = structuredClone(book);
      const sec = getSection(updated);
      if (!sec) return;
  
      sec.paragraphs.push({
        text: "",
        style: "",
        pre_text: "",
        post_text: "",
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
      if (!sec?.paragraphs[index]) return;
  
      (sec.paragraphs as any)[index][key] = value || (key === "text" ? "" : undefined);
      saveAndSetBook(updated);
    }
  }

  // larghezza dinamica dello schermo
  const template ={
    // imposta il numero di righe in base alla lunghezza del testo
    getrows(p: Paragraph) {
      let result = 0;
      // se lunghezza <20 ==>1; <40 ==>2; <60 ==>3;
      const lengthSteps =[20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300]
      // per ogni elementto della lista
      for (let i = 0; i < lengthSteps.length; i++) {
        // se la lunghezza del testo è minore del valore corrente
        if (p.text.length < lengthSteps[i]) {
          // ritorna il numero di righe
          result = i + 1;
          break;
        }
      }
      // se la lunghezza del testo è maggiore di tutti i valori, ritorna il massimo
      if(!result) result = lengthSteps.length + 1;

      // adatta alla larghezza dello schermo
      // quando togliere 2 righe
      if(width_value >= 300) result -=1
      return result;
    }
  }

  if (!isLoaded) return <div className="text-center text-gray-400 py-20">Caricamento...</div>

  return (
    <main id="chapter">
      <nav className="py-5">
        <div className="fixed top-0 start-0 z-10 w-full bg-gray-800">
          <div className="px-1 flex items-center gap-2">
            <Link href={`/book/${id}`} className="p-3 hover:bg-gray-700">
              <i className="bi bi-chevron-left"></i>
            </Link>

            <h1 className="p-3 text-bold">{section}</h1>

            <button onClick={toggleEditMode} className="ms-auto p-3 bg-green-700">
              {editMode ?<>
                  <i className="bi bi-eye"></i>
              </>:<>
                  <i className="bi bi-pencil"></i>
              </>
              }
            </button>
          </div>
        </div>
      </nav>


      <section className="mx-auto container max-w-[400px]">
        {!chapter ? (
          <div className="py-10 text-center text-red-500">
            <i className="me-1 bi bi-exclamation-triangle"></i> 
            Capitolo non trovato
          </div>

        ) : (<>
          {/* TITOLO */}
          <div className="p-3 py-10 text-center">
            <input className="text-3xl font-bold text-center"
                    value={title_value}
                    disabled={!editMode}
                    onChange={(e) => title_setValue(e.target.value)}
                    onBlur={() => title_handleSubmit(title_value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
            />
          </div>
          <div className="m-3 border-y border-gray-500"></div>


          {/* PARAGRAFO */}
          <div className="pb-30">
            {chapter.paragraphs.map((p, paragraph_i) => (
              <div className="py-3 text-center" key={paragraph_i}>
                <div className={`relative p-3 ${p.style || ""}`}> 

                  <Frag if={!!p.pre_text || !!editMode}>
                    <div className="absolute top-0 start-1/2 -translate-x-1/2 rounded" 
                          style={{transform: 'translateY(-15px)', 
                                  background: p.style?.includes('bg-') ? 'inherit' : '#333', 
                                  borderLeftWidth:'inherit', borderRightWidth:'inherit'}}>
                      {/* input pre_text */}
                      <input className="px-1 max-w-[100px] mx-auto font-bold text-center" type="text" 
                              value={p.pre_text || ''} 
                              disabled={!editMode}
                              placeholder="Titolo"
                              onChange={(e) => paragraph.handle_change(paragraph_i, "pre_text", e.target.value)}
                      />
                    </div>
                  </Frag>

                  {/* input stile */}
                  <Frag if={editMode}>
                    <input className="mb-2 p-1 text-sm" type="text" 
                            value={p.style || ''} 
                            placeholder="Stile (tailwind)"
                            onChange={(e) => paragraph.handle_change(paragraph_i, "style", e.target.value)}
                    />
                  </Frag>


                  {/* input testo */}
                  <Frag if={editMode}>
                    <textarea placeholder="Testo del paragrafo" 
                              value={p.text} 
                              disabled={!editMode}
                              rows={template.getrows(p)}
                              className={`bg-transparent text-inherit font-inherit outline-none`}
                              onChange={(e) => paragraph.handle_change(paragraph_i, "text", e.target.value)}
                    />
                  </Frag>
                  <Frag if={!editMode}>
                    <div dangerouslySetInnerHTML={{__html: p.text}} />
                  </Frag>


                  {/* PULSANTE RIMUOVI PARAGRAFO */}
                  <Frag if={editMode} className="absolute top-0 end-1">
                    <button type="button" 
                            onClick={() => paragraph.handle_remove(paragraph_i)}
                            className="px-2 py-1 bg-red-600 text-white border rounded"
                            style={{transform: "translateY(-50%)"}}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </Frag>

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