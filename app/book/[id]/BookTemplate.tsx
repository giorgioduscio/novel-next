import Field from "@/app/shareds/Field";
import Frag from "@/app/shareds/Frag";
import { LoadingComponent } from "@/app/shareds/LoadingComponent";
import Navbar from "@/app/shareds/navbar";
import { Breadcrumb } from "@/app/shareds/Breadcrumb";
import Link from "next/link";
import { useBookComponent } from "./BookComponent";

export default function BookTemplate({
  book,
  isEditMode,
  errors,
  handleUpdateBook,
  partFeat,
  sectionFeat,
  sortFeat,
  dropdownFeat,
  isPageLoaded,
  dropdownsState,
  bookStore,
}: ReturnType<typeof useBookComponent>) {  
  // caricamento
  if (!isPageLoaded) return <LoadingComponent/>

  return (
    <>
      {/* MAIN */}
      <main id="book" onClick={dropdownFeat.autoClose}>
        <Navbar back_btn={{ href:"/", label:"", icon:"bi-chevron-left" }} 
                page_title={book?.title || ""}/>
        <Breadcrumb />

        {!book ? (
          // LIBRO NON TROVATO
          <div className="p-3 py-8 text-center text-red-500">
            <i className="bi bi-exclamation-triangle text-2xl"></i>
            <span>Libro non trovato</span>
          </div>

        ) : (
          // LIBRO TROVATO
          <section className="pb-10 mx-auto container max-w-[400px]">
            {/* HEADER */}
            <div className="p-3 py-8 text-center">
              <div className="grid gap-3 overflow-x-hidden">
                <h2 className="hidden">{book.title}</h2>
                <div>
                  <Field id={"title"} 
                          hide_label={!isEditMode}
                          label={"Titolo"} 
                          input_class={`p-2 text-center rounded text-3xl font-bold ${isEditMode ?'border' :''}`}
                          asterisk
                          type={"text"} 
                          placeholder={"Titolo"} 
                          disabled={!isEditMode}
                          value={book.title} 
                          error_message={errors.title}
                          onChange={_e=> handleUpdateBook("title", _e.target.value)} 
                  />
                </div>
                <div>
                  <Field id={"author"} 
                          hide_label={!isEditMode}
                          label={"Autore"} 
                          input_class={`p-2 text-center rounded ${isEditMode ?'border' :'text-gray-300'}`}
                          asterisk
                          type={"text"} 
                          placeholder={"Autore"} 
                          disabled={!isEditMode}
                          value={book.author} 
                          error_message={errors.author}
                          onChange={_e=> handleUpdateBook("author", _e.target.value)} 
                  />
                </div>
                <div>
                  <Field id={"description"} 
                          hide_label={!isEditMode}
                          label={"Descrizione"} 
                          input_class={`p-2 text-center rounded ${isEditMode ?'border' :'text-gray-300'}`}
                          asterisk
                          type={"textarea"} 
                          placeholder={"Descrizione"} 
                          disabled={!isEditMode}
                          value={book.description} 
                          error_message={errors.description}
                          onChange={_e=> handleUpdateBook("description", _e.target.value)} 
                  />
                </div>
              </div>
            </div>
            <div className="mx-3 border-y border-gray-500"></div>


            {/* PARTI */}
            <Frag if={!!book.parts?.length}>
              <Frag.Else>
                <div className="my-15 text-red-400 text-center">
                  <i className="bi bi-exclamation-triangle me-1"></i>
                  <span>Nessuna sezione trovata</span>
                </div>
              </Frag.Else>
              
              <div className="py-3">
                <h2 className="p-2 text-2xl">Sezioni</h2>
                {book.parts?.map((part, part_i) => (
                  <div className="" key={part.title + part_i}>

                    {/* titolo parte */}
                    {!!part.sections.length && (
                      <Frag if={isEditMode}>
                        <Frag.Else>
                          <h3 className="p-2 italic">{part.title}</h3>
                        </Frag.Else>

                        <div>
                          <Field  id={part_i.toString()} 
                                  hide_label label={"Titolo della parte"} 
                                  input_class="py-1 px-2 border"
                                  type={"text"} 
                                  placeholder={"Modifica il titolo della parte"} 
                                  value={part.title} 
                                  error_message={errors[`part_title_${part_i}`]}
                                  onChange={(e) => partFeat.updateTitle(part_i, e.target.value)}
                          />
                        </div>
                      </Frag>
                    )}


                    {/* SEZIONI */}
                    <div>
                      {part.sections.map((section, section_i) => 
                        <Frag if={isEditMode} key={section.title + section_i}>

                          {/* link sezione */}
                          <Frag.Else>
                            <Link href={sectionFeat.writeHref(book.id!, part.title, section.title)}
                                  className="p-2 block bg-gray-800 hover:bg-gray-700 transition-colors">
                              <div className="flex items-center gap-2">
                                <h4>{section.title}</h4>

                                <i className="ms-auto bi bi-chevron-right text-gray-400"></i>
                              </div>
                            </Link>
                          </Frag.Else>

                          <div className="my-1 border rounded">
                            <div className="grid grid-cols-[auto_1fr_auto]">

                              {/* DROPDOWN */}
                              <div className="relative dropdown bg-gray-600">
                                <button onClick={() => dropdownFeat.toggle(section.title)} 
                                        className="p-1 bg-gray-600 hover:bg-gray-500 transition-colors">
                                  <i className="bi bi-three-dots"></i>
                                </button>

                                <Frag if={!!dropdownsState[section.title]} 
                                      className="absolute start-0 right-0 z-10">
                                  <div className="grid min-w-[100px] bg-gray-800 border rounded">
                                    <button className="p-1 bg-red-500 truncate" 
                                            onClick={() => sectionFeat.delete(part_i, section_i)}>
                                      <i className="bi bi-trash"></i> Rimuovi
                                    </button>
                                    <Frag if={!sortFeat.isFirstOfBook(part_i, section_i)}>
                                      <button className="p-1 bg-gray-600 truncate" 
                                              onClick={() => sortFeat.pushOrder("up", part_i, section_i)}>
                                        <i className="bi bi-caret-up-fill"></i> Sposta su
                                      </button>
                                    </Frag>
                                    <Frag if={!sortFeat.isLastOfBook(part_i, section_i)}>
                                      <button className="p-1 bg-gray-600 truncate" 
                                              onClick={() => sortFeat.pushOrder("down", part_i, section_i)}>
                                        <i className="bi bi-caret-down-fill"></i> Sposta giù
                                      </button>
                                    </Frag>
                                  </div>
                                </Frag>
                              </div>

                              <div>
                                <Field  id={"section-" + section_i} 
                                        hide_label label={"Sezione " + (section_i + 1)} 
                                        input_class="py-1 px-2 bg-gray-800"
                                        type={"text"} 
                                        placeholder={"Nome della sezione"} 
                                        value={section.title} 
                                        error_message={errors[`section_title_${section.title}`]}
                                        onChange={(e) => sectionFeat.updateTitle(part_i, section_i, e.target.value)} 
                                />
                              </div>
                              <Link className="p-1 bg-green-600 flex items-center" 
                                      href={sectionFeat.writeHref(book.id!, part.title, section.title)}>
                                <i className="bi bi-chevron-right"></i>
                              </Link>
                            </div>
                          </div>
                        
                          {/* Pulsante aggiunta sezione */}
                          <Frag if={section_i === (book.parts?.[part_i]?.sections.length || 0) - 1}>
                            <button onClick={() => sectionFeat.create(part_i)}
                                    className="py-1 px-2 mx-auto my-3 block bg-gray-800 rounded text-sm hover:bg-gray-900 transition-colors">
                              <i className="bi bi-arrow-down"></i>
                              <span>Aggiungi sezione</span>
                            </button>
                          </Frag>

                        </Frag>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Frag>

            {/* pulsante aggiunta */}
            <Frag if={isEditMode}>
              <button onClick={() => partFeat.create()}
                      className="py-2 px-3 mx-auto my-3 block bg-green-600 rounded hover:bg-green-700 transition-colors">
                <i className="bi bi-plus-lg"></i>
                <span>Aggiungi parte</span>
              </button>
            </Frag>
            

            {/* AZIONI */}
            <div className="my-10 border border-gray-500"></div>
            <h4 className="p-2 text-xl text-gray-400">Azioni</h4>
            <div className="flex flex-col">
              {Object.values(bookStore.download).map((action, i) => (
                <button key={i}  onClick={() => action.execute(book.id!)}
                        className="py-2 px-3 bg-gray-800 hover:bg-gray-700 transition-colors" >
                  <div className="flex justify-between items-center">
                    <span>{action.label}</span>
                    <i className={`bi ${action.icon}`}></i>
                  </div>
                </button>
              ))}
            </div>

          </section>
        )}
      </main>
    </>
  );
}