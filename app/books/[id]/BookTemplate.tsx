"use client";

import Field from "@/app/shareds/Field";
import Frag from "@/app/shareds/Frag";
import { LoadingComponent } from "@/app/shareds/LoadingComponent";
import { Breadcrumb } from "@/app/shareds/Breadcrumb";
import Link from "next/link";
import { useBookComponent } from "./BookComponent";
import EditModeComponent from "@/app/shareds/EditModeComponent";
import Navigation from "@/app/shareds/Navigation";

export default function BookTemplate({
  book,
  page,
  errors,
  handleUpdateBook,
  PART,
  SECTION,
  SORT,
  DROPDOWN,
  dropdownsState,
  BookHook,
}: ReturnType<typeof useBookComponent>) {  

  // caricamento
  if (!page.isPageLoaded) return <LoadingComponent/>

  const {isEditMode} =page;
  return (
      <main id="BookTemplate" onClick={DROPDOWN.autoClose} className="flex-1 flex flex-col">
        <Navigation back_btn={{ href:"/books", label:"", icon:"bi-chevron-left" }} 
                page_title={book?.title || ""}/>
        <Breadcrumb />

        {/* LIBRO NON TROVATO */}
        <Frag if={!book}>
          <div className="p-3 py-8 text-center text-red-500">
            <i className="bi bi-exclamation-triangle text-2xl"></i>
            <span>Libro non trovato</span>
          </div>
        </Frag>
        
        {/* LIBRO TROVATO */}
        <Frag if={!!book}>
          <section className="pb-10 mx-auto container max-w-[800px] flex-1">
            {/* HEADER */}
            <div className="p-3 py-8 text-center">
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr] gap-1">
                <div>

                  <h2 className="hidden">{book?.title}</h2>
                  <div>
                    <Field id={"title"} 
                            hide_label
                            label={"Titolo"} 
                            input_class={`p-2 rounded text-2xl text-orange-500 ${isEditMode ?'bg-white text-black outline' :''}`}
                            asterisk
                            type={"textarea"} 
                            placeholder={"Titolo"} 
                            disabled={!isEditMode}
                            value={book?.title || ""} 
                            error_message={errors.title}
                            onChange={_e=> handleUpdateBook("title", _e.target.value)} 
                    />
                  </div>
                  <div className="mx-3 border-y border-gray-500"></div>
                  <div>
                    <Field id={"author"} 
                            hide_label
                            label={"Autore"} 
                            input_class={`p-2 rounded italic ${isEditMode ?'bg-white text-black outline' :'text-gray-300'}`}
                            asterisk
                            type={"text"} 
                            placeholder={"Autore"} 
                            disabled={!isEditMode}
                            value={book?.author || ""} 
                            error_message={errors.author}
                            onChange={_e=> handleUpdateBook("author", _e.target.value)} 
                    />
                  </div>
                </div>
                <div>
                  <Field id={"description"} 
                          hide_label
                          label={"Descrizione"} 
                          input_class={`p-4 rounded ${isEditMode ?'bg-white text-black outline' :'text-gray-300'}`}
                          asterisk
                          type={"textarea"} 
                          placeholder={"Descrizione"} 
                          disabled={!isEditMode}
                          value={book?.description || ""} 
                          error_message={errors.description}
                          onChange={_e=> handleUpdateBook("description", _e.target.value)} 
                  />
                </div>
              </div>
            </div>
            <div className="mx-3 border-y border-gray-500"></div>


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
                        <h3 className="hidden">{part.title}</h3>
                        <Field  id={part_i.toString()} 
                                hide_label label={"Titolo della parte"} 
                                input_class={`py-2 px-5 font-bold ${isEditMode ? "bg-white text-black outline rounded" : ""}`}
                                type={"text"} 
                                disabled={!isEditMode}
                                placeholder={"Modifica il titolo della parte"} 
                                value={part.title || ""} 
                                error_message={errors[`part_title_${part_i}`]}
                                onChange={(e) => PART.updateTitle(part_i, e.target.value)}
                        />
                      </Frag>


                      {/* SEZIONI */}
                      <div>
                        {part.sections?.map((section, section_i, section_array) => 
                          <div key={section.title + section_i}>

                            {/* MODIFICA SEZIONE */}
                            <div className={`border-b border-gray-600`}>
                              <div className="flex">

                                {/* DROPDOWN */}
                                <Frag if={isEditMode} className="relative dropdown">
                                  <button onClick={() => DROPDOWN.toggle(section.title)} 
                                          className="py-3 px-2">
                                    <i className="bi bi-three-dots"></i>
                                  </button>

                                  <Frag if={!!dropdownsState[section.title]} 
                                        className="absolute start-10 right-0 z-10">
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
                                        <i className="inline-block w-[20px] bi bi-arrow-down"></i>
                                        <span>Aggiungi sezione</span>
                                      </button>

                                    </div>
                                  </Frag>
                                </Frag>

                                {/* input */}
                                <Frag if={isEditMode}>
                                  <div className={`py-2 px-1 flex-1`}>
                                    <Field  id={"section-" + section_i} 
                                            hide_label label={"Sezione " + (section_i + 1)} 
                                            input_class={`py-1 px-2 ${isEditMode ?'bg-white text-black outline rounded' : ''}`}
                                            type={"text"} 
                                            placeholder={"Nome della sezione"} 
                                            value={section.title} 
                                            disabled={!isEditMode}
                                            error_message={errors[`section_title_${section.title}`]}
                                            onChange={(e) => SECTION.updateTitle(part_i, section_i, e.target.value)} 
                                    />
                                  </div>
                                  
                                  {/* freccia */}
                                  <Link className={`p-3 flex items-center bg-indigo-800`} 
                                          href={SECTION.writeHref(book?.id!, part.title, section.title)}>
                                    <i className="bi bi-chevron-right"></i>
                                  </Link>
                                </Frag>

                                {/* link */}
                                <Frag if={!isEditMode} className="flex-1">
                                  <Link className={`p-3 flex items-center justify-between bg-indigo-800`} 
                                          href={SECTION.writeHref(book?.id!, part.title, section.title)}>
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
            <Frag if={isEditMode}>
              <button onClick={() => PART.create()}
                      className="py-2 px-3 mx-auto my-3 block bg-green-600 rounded">
                <i className="bi bi-plus-lg"></i>
                <span>Aggiungi parte</span>
              </button>
            </Frag>
            

            {/* AZIONI */}
            <div className="my-10 border-t border-gray-500">
              <h4 className="p-2 text-xl text-gray-400">Azioni</h4>
              <div className="grid sm:grid-cols-3 sm:gap-2">
                {Object.values(BookHook.download).filter(a => typeof a === 'object').map((action, i) => (
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

        <EditModeComponent page={page} />
      </main>
  );
}