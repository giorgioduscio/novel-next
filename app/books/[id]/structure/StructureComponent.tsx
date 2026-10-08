"use client";

import { useBookComponent } from "../useBookComponent";
import Navbar from "@/app/shareds/Navbar";
import { Breadcrumb } from "@/app/shareds/Breadcrumb";
import Frag from "@/app/shareds/Frag";
import { Dropdown, DropdownContent, DropdownSummary } from "@/app/shareds/Dropdown";
import { useMemo } from "react";
import Link from "next/link";
import Field from "@/app/shareds/Field";
import { useAuthContext } from "@/app/data/AuthContext";
import { EditModeToggleButton, useCommonPagesContext } from "@/app/data/CommonPagesContext";
import handleArrowKeyFocus from "@/app/tools/handleArrowKeyFocus";
import InsertAuthCodesComponent from "@/app/shareds/InsertAuthCodesComponent";
import Bottombar from "@/app/shareds/Bottombar";

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
    !!page.isEditMode.get && !!book && !!authContext.CONTROLS.canWrite(book)
  , [book, authContext, page])

  if (!!book && !canRead) return <InsertAuthCodesComponent targetId={props.id} />
  
  return <>
    <Navbar page_title={book?.title ||""} back_btn={{ href:"/books" }}>
      {/* impostazioni del libro */}
      <Frag if={canWrite}>
        <Link href={`/books/${book?.id || ''}/settings`}
              className="m-1 py-1 px-2 text-bg-tertiary rounded-full"
              title="Vai alle impostazioni">
          <i className="bi bi-three-dots-vertical"></i>
        </Link>
      </Frag>
    </Navbar>
    
    <Breadcrumb routes={["Catalogo:/books", book?.title || "Libro", "Struttura"]} />

    <main id="StructureComponent" 
          className="sm:p-3 mx-auto container max-w-[800px]" 
          onKeyDown={handleArrowKeyFocus}>
      {/* LIBRO NON TROVATO */}
      <Frag if={!canRead}>
        <div className="p-3 py-8 text-center text-red-500">
          <i className="bi bi-exclamation-triangle text-2xl"></i>
          <span>Libro non trovato</span>
        </div>
      </Frag>
      
      {/* LIBRO TROVATO */}
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
              <h2 className="p-2 text-2xl app-text-accent">Sezioni</h2>

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
                                  input_class={`p-2 text-xl text-bold ${canEdit ? "bg-white text-black outline rounded" : ""}`}
                                  type={"text"} 
                                  disabled={!canEdit}
                                  placeholder={"Modifica il titolo della parte"} 
                                  value={part.title || ""} 
                                  error_message={errors[`${part_i}>title`]}
                                  onChange={(e) => PART.update(part_i,"title", e.target.value)}
                          />
                        </div>
                        <Frag if={canEdit} className="p-2">
                          <button className="px-1 app-bg-light text-black outline rounded" 
                                  onClick={_e=> SHARE.copyPart(_e, part.id || "")}
                                  title="Copia parte come json" 
                                  data-feedback>
                            <i className="bi bi-copy"></i>
                          </button>
                        </Frag>
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
                                  <DropdownSummary>
                                    <button className="py-3 px-2">
                                      <i className="bi bi-three-dots"></i>
                                    </button>
                                  </DropdownSummary>

                                  <DropdownContent className="absolute start-10 right-0 z-10">
                                    <div className="grid w-max text-bg-dark border rounded overflow-hidden">

                                      <button className="py-1 px-2 text-bg-danger truncate text-left" 
                                              onClick={() => SECTION.delete(part_i, section_i)}>
                                        <i className="inline-block w-[20px] bi bi-trash"></i> Rimuovi
                                      </button>
                                      <Frag if={!SORT.isFirstOfBook(part_i, section_i)}>
                                        <button className="py-1 px-2 text-bg-dark truncate text-left" 
                                                onClick={() => SORT.pushOrder("up", part_i, section_i)}>
                                          <i className="inline-block w-[20px] bi bi-caret-up-fill"></i> Sposta su
                                        </button>
                                      </Frag>
                                      <Frag if={!SORT.isLastOfBook(part_i, section_i)}>
                                        <button className="py-1 px-2 text-bg-dark truncate text-left" 
                                                onClick={() => SORT.pushOrder("down", part_i, section_i)}>
                                          <i className="inline-block w-[20px] bi bi-caret-down-fill"></i> Sposta giù
                                        </button>
                                      </Frag>
                                      <button className="py-1 px-2 text-bg-dark text-left" 
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
                                <Link className={`p-3 flex items-center text-bg-dark`} 
                                        href={`/books/${book.id}/${part.id}/${section.id}`}>
                                  <i className="bi bi-chevron-right"></i>
                                </Link>
                              </Frag>


                              {/* LINK VISUALIZZAZIONE */}
                              <Frag if={!canEdit} className="flex-1">
                                <Link className={`p-3 flex items-center justify-between text-bg-dark text-white italic border-b border-gray-500`} 
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
                        className="py-2 px-3 text-bg-primary">
                  <i className="me-1 bi bi-plus-lg"></i>
                  <span>Aggiungi parte</span>
                </button>
                <button onClick={() => SHARE.paste()}
                        className="py-2 px-3 text-bg-tertiary">
                  <i className="me-1 bi bi-clipboard-fill"></i>
                  <span>Incolla</span>
                </button>
              </div>
            </div>
          </Frag>
          


          {/* AZIONI */}
          <div className="my-10 border-t border-gray-500">
            <h4 className="p-2 text-xl app-text-accent">Azioni</h4>

            <div className="grid sm:grid-cols-3 sm:gap-2">
              {Object.values(bookContext.download).filter(a => typeof a === 'object').map((action, i) => (
                <button key={i}  onClick={() => action.execute(book?.id!)}
                        className="py-2 px-3 text-bg-secondary" >
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


    <Bottombar>
      <Link href={"/auth"} className="circle text-bg-tertiary" title="Mostra codici">
        <i className="bi bi-person-vcard-fill"></i>
      </Link>
      <Frag if={canWrite}>
        <EditModeToggleButton />
      </Frag>
    </Bottombar>    
  </>;
}
