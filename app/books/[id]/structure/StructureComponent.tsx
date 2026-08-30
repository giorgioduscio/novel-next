"use client";

import { useBookComponent } from "../useBookComponent";
import Navigation from "@/app/shareds/Navigation";
import { Breadcrumb } from "@/app/shareds/Breadcrumb";
import Frag from "@/app/shareds/Frag";
import { Dropdown, DropdownContent, DropdownSummary } from "@/app/shareds/Dropdown";
import { LoadingComponent } from "@/app/shareds/LoadingComponent";
import { useMemo } from "react";
import Link from "next/link";
import { Book } from "@/app/schemas/book_schema";
import Field from "@/app/shareds/Field";
import { useAuthContext } from "@/app/data/AuthContext";
import { useCommonPagesContext } from "@/app/data/CommonPagesContext";
import handleArrowKeyFocus from "@/app/tools/handleArrowKeyFocus";

interface UseBookComponentProps { id: string }
export default function StructureComponent(props: UseBookComponentProps) {
  const page = useCommonPagesContext();
  const {PART, SECTION, SORT, bookContext, errors, book, SHARE} = useBookComponent(props);
  const authContext = useAuthContext();
  

  const canRead =useMemo(()=> 
    !!book && !!authContext.CONTROLS.canRead(book)
  , [book, authContext, page])

  const canWrite =useMemo(()=> 
    !!book && !!authContext.CONTROLS.canWrite(book)
  , [book, authContext, page])
  
  const canEdit =useMemo(()=> 
    !!page.isEditMode && !!book && !!authContext.CONTROLS.canWrite(book)
  , [book, authContext, page])


  if (!page.isPageLoaded) return <LoadingComponent/>
  if(!canRead) return (
    <div className="p-3">
      <div className="p-3 mx-auto max-w-fit bg-red-300 text-black border rounded">
        <i className="bi bi-exclamation-triangle me-1"></i>
        <strong>Non hai i permessi per leggere questo libro.</strong> <br />
        <Link href="/books" className="underline">Catalogo</Link>
      </div>
    </div>
  )
  
  return <>
    <Navigation page_title={book?.title ||""} back_btn={{ href:"/books" }} />    
    
    <Breadcrumb routes={["Catalogo:/books", book?.title || "Libro", "Struttura"]} />

    <main id="StructureComponent" 
          className="mx-auto container max-w-[800px]" 
          onKeyDown={handleArrowKeyFocus}>
      {/* LIBRO NON TROVATO */}
      <Frag if={!canRead}>
        <div className="p-3 py-8 text-center text-red-500">
          <i className="bi bi-exclamation-triangle text-2xl"></i>
          <span>Libro non trovato</span>
        </div>
      </Frag>
      
      <Frag if={!!canRead}>
        <section className="pb-10 min-h-dvh">

          {/* PARTI */}
          <Frag if={!!book?.parts?.length}>
            <Frag.Else>
              <div className="my-15 text-red-400 text-center">
                <i className="bi bi-exclamation-triangle me-1"></i>
                <span>Nessuna sezione trovata</span>
              </div>
            </Frag.Else>
            
            <div className="py-3">
              <h2 className="p-2 text-2xl text-orange-500">Sezioni</h2>
              <div className="sm:p-3 grid gap-2 sm:grid-cols-2 md:grid-cols-3 items-start">
                {book?.parts?.map((part, part_i) => (
                  <div className={"sm:shadow-lg sm:border sm:border-black"} key={part.title + part_i}>

                    {/* TITOLO PARTE */}
                    <Frag if={!!part.sections?.length}>
                      <div className="grid grid-cols-[1fr_auto]">
                        <h3 className="hidden">{part.title}</h3>
                        <div>
                          <Field  id={part_i.toString()} 
                                  hide_label label={"Titolo della parte"} 
                                  input_class={`py-2 px-5 font-bold ${canEdit ? "bg-white text-black outline rounded" : ""}`}
                                  type={"text"} 
                                  disabled={!canEdit}
                                  placeholder={"Modifica il titolo della parte"} 
                                  value={part.title || ""} 
                                  error_message={errors[`${part_i}>title`]}
                                  onChange={(e) => PART.update(part_i,"title", e.target.value)}
                          />
                        </div>
                        <div className="p-2">
                          <button className="px-1 bg-gray-200 text-black outline rounded" 
                                  onClick={_e=> SHARE.copyPart(_e, part.id || "")}
                                  title="Copia parte come json">
                            <i className="bi bi-copy"></i>
                          </button>
                        </div>
                      </div>
                    </Frag>


                    {/* SEZIONI */}
                    <div>
                      {part.sections?.map((section, section_i) => 
                        <div key={section.title + section_i}>

                          {/* MODIFICA SEZIONE */}
                          <div className={`border-b border-gray-600`}>
                            <div className="flex">

                              {/* DROPDOWN */}
                              <Frag if={canEdit} className="relative">
                                <Dropdown>
                                  <DropdownSummary className="py-3 px-2">
                                    <i className="bi bi-three-dots"></i>
                                  </DropdownSummary>

                                  <DropdownContent className="absolute start-10 right-0 z-10">
                                    <div className="grid w-max bg-indigo-800 border rounded overflow-hidden">

                                      <button className="py-1 px-2 bg-red-500 truncate text-left" 
                                              onClick={() => SECTION.delete(part_i, section_i)}>
                                        <i className="inline-block w-[20px] bi bi-trash"></i> Rimuovi
                                      </button>
                                      <Frag if={!SORT.isFirstOfBook(part_i, section_i)}>
                                        <button className="py-1 px-2 bg-indigo-600 truncate text-left" 
                                                onClick={() => SORT.pushOrder("up", part_i, section_i)}>
                                          <i className="inline-block w-[20px] bi bi-caret-up-fill"></i> Sposta su
                                        </button>
                                      </Frag>
                                      <Frag if={!SORT.isLastOfBook(part_i, section_i)}>
                                        <button className="py-1 px-2 bg-indigo-600 truncate text-left" 
                                                onClick={() => SORT.pushOrder("down", part_i, section_i)}>
                                          <i className="inline-block w-[20px] bi bi-caret-down-fill"></i> Sposta giù
                                        </button>
                                      </Frag>
                                      <button className="py-1 px-2 bg-indigo-800 text-left" 
                                              onClick={() => SECTION.create(part_i, section_i)}>
                                        <i className="inline-block w-[20px] bi bi-journal-arrow-down"></i>
                                        <span>Aggiungi sezione</span>
                                      </button>

                                    </div>
                                  </DropdownContent>
                                </Dropdown>
                              </Frag>

                              {/* input */}
                              <Frag if={canEdit}>
                                <div className={`py-2 px-1 flex-1`}>
                                  <Field  id={"section-" + section_i} 
                                          hide_label label={"Sezione " + (section_i + 1)} 
                                          input_class={`py-1 px-2 ${canEdit ?'bg-white text-black outline rounded' : ''}`}
                                          type={"text"} 
                                          placeholder={"Nome della sezione"} 
                                          value={section.title} 
                                          disabled={!canEdit}
                                          error_message={errors[`section_title_${section.title}`]}
                                          onChange={(e) => SECTION.updateTitle(part_i, section_i, e.target.value)} 
                                  />
                                </div>
                                
                                {/* freccia */}
                                <Link className={`p-3 flex items-center bg-indigo-800`} 
                                        href={`/books/${book.id}/${part.id}/${section.id}`}>
                                  <i className="bi bi-chevron-right"></i>
                                </Link>
                              </Frag>

                              {/* link */}
                              <Frag if={!canEdit} className="flex-1">
                                <Link className={`p-3 flex items-center justify-between bg-indigo-800`} 
                                        href={`/books/${book?.id}/${part.id}/${section.id}`}>
                                  <span className="flex-1">{section.title}</span>
                                  <i className="bi bi-chevron-right"></i>
                                </Link>
                              </Frag>
                            </div>
                          </div>

                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Frag>

          {/* pulsante aggiunta */}
          <Frag if={canEdit}>
            <div className="mx-auto max-w-fit">
              <div className="flex flex-wrap outline rounded overflow-hidden">
                <button onClick={() => PART.create()}
                        className="py-2 px-3 bg-green-600">
                  <i className="me-1 bi bi-plus-lg"></i>
                  <span>Aggiungi parte</span>
                </button>
                <button onClick={() => SHARE.paste()}
                        className="py-2 px-3 bg-indigo-600">
                  <i className="me-1 bi bi-clipboard-fill"></i>
                  <span>Incolla</span>
                </button>
              </div>
            </div>
          </Frag>
          

          {/* AZIONI */}
          <div className="my-10 border-t border-gray-500">
            <h4 className="p-2 text-xl text-gray-400">Azioni</h4>
            <div className="grid sm:grid-cols-3 sm:gap-2">
              {Object.values(bookContext.download).filter(a => typeof a === 'object').map((action, i) => (
                <button key={i}  onClick={() => action.execute(book?.id!)}
                        className="py-2 px-3 bg-indigo-800" >
                  <div className="flex justify-between items-center">
                    <span>{action.label}</span>
                    <i className={`bi ${action.icon}`}></i>
                  </div>
                </button>
              ))}
            </div>
          </div>
    
        </section>
      </Frag>
    </main>
    
  </>;
}
