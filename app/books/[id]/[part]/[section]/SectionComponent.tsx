"use client";

import "./Section.sass";
import Field from "@/app/shareds/Field";
import Frag from "@/app/shareds/Frag";
import { LoadingComponent } from "@/app/shareds/LoadingComponent";
import { Breadcrumb } from "@/app/shareds/Breadcrumb";
import Navigation from "@/app/shareds/Navigation";
import { useSectionComponent, UseSectionComponentProps } from "./useSectionComponent";
import Link from "next/link";
import UnathorizeComponent from "@/app/shareds/UnathorizeComponent";

interface AddParagraphButtonProps { handleCreate: Function; if: boolean; className?: string }
function AddParagraphButton({ if: show, handleCreate, className = "" }: AddParagraphButtonProps) {
  return <Frag if={show} className={`absolute start-0 w-full ${className}`}>
    <div className="pe-3 flex gap-2 items-center">
      <button
        onClick={() => handleCreate()}
        className="absolute start-0 -top-3 z-1 block px-1 rounded-full bg-blue-900 text-blue-300 border"
        aria-label="Aggiungi paragrafo"
      >
        <i className="bi bi-plus-lg"></i>
      </button>
      <div className="absolute w-full pointer-events-none border-y border-dashed border-blue-700"></div>
    </div>
  </Frag>
}


export default function SectionComponent(props: UseSectionComponentProps) {
  const {
    book, part,
    book_id,  section_id,  page,  SECTION_title,
    SECTION,
    SHARED,  
    PARAG, showParagraphs,
    errors,
    AUTOCOMPLETE,
    HISTORY,
    FIND_REPLACE,
    foundIndices,
    canRead, canWrite,
    olRef,
    olHeight,
    MARCKERS
  } = useSectionComponent(props); 

  if (!page.isPageLoaded) return <LoadingComponent />;
  if (!canRead) return <UnathorizeComponent />

  return (<>
    {/* NAVBAR */}
    <Navigation back_btn={{ href: `/books/${book_id}` }} page_title={SECTION_title}>
      <button onClick={SHARED.copy}
              className="p-2 bg-blue-900 text-sm truncate">
        <i className="bi bi-copy"></i>
        <span className="pl-2">Copia</span>
      </button>
      <Frag if={canWrite}>
        <button onClick={SHARED.paste}
                className="p-2 bg-green-900 text-sm truncate">
          <i className="bi bi-clipboard"></i>
          <span className="pl-2">Incolla</span>
        </button>
      </Frag>
    </Navigation>



    {/* BREADCRUMB */}
    <Breadcrumb routes={["Catalogo:/books", `${book?.title}:/${book?.id}`, `${part?.title}:/structure`, SECTION_title]} />

    {/* STRUMENTI */}
    <div className={`sticky top-[calc(45px+env(safe-area-inset-top))] z-20 mx-auto w-fit max-w-[800px] ${canWrite ?"" :"pointer-events-none invisible"}`}>
      <div className="bg-indigo-900 rounded-b-lg overflow-hidden">
        {/* UNDO / REDO */} 
        <Frag if={canWrite && !FIND_REPLACE.isVisible.get()}>
          <div className="flex items-center">
            <button onClick={HISTORY.undo} 
                    className="px-3 py-2 bg-indigo-900" 
                    title="Annulla">
              <i className="bi bi-arrow-90deg-left" style={{transform:"rotate(-90) !important"}}></i> 
            </button>
            <button onClick={()=> MARCKERS.isVisible.set(true)} 
                    className="px-3 py-2 bg-green-900" 
                    title="Segnalibri">
              <i className="bi bi-bookmarks-fill"></i> 
              <span className="ms-1 hidden sm:inline">Segnalibri</span>
            </button>
            <button onClick={FIND_REPLACE.toggle} 
                    className={`px-3 py-2 ${FIND_REPLACE.isVisible.get() ?"bg-blue-800" :"bg-gray-800"}`}>
              <i className="bi bi-search"></i> 
              <span className="ms-1 hidden sm:inline">Trova</span>
            </button>
            <button onClick={HISTORY.redo} 
                    className="px-3 py-2 bg-indigo-900" 
                    title="Ripeti">
              <i className="bi bi-arrow-90deg-right rotate-90"></i> 
            </button>
          </div>
        </Frag>

        {/* TROVA E SOSTITUISCI */}
        <Frag if={canWrite && FIND_REPLACE.isVisible.get()} className="p-1">
          {/* generali */}
          <div className="grid grid-cols-[1fr_auto] items-center">
            <h4 className="p-3 font-bold text-sm">
              {foundIndices.length > 0 ?(
                <span>
                  {FIND_REPLACE.currentIndex.get() + 1} / {foundIndices.length} occorrenze trovate
                </span>
              ):(
                <span>Cerca e sostituisci</span>
              )}
            </h4>
            <button type="button" onClick={FIND_REPLACE.toggle} 
                    className="py-2 px-3 bg-indigo-900"
                    title="Chiudi">
              <i className="bi bi-x-lg"></i>
            </button>
          </div>


          {/* cerca */}
          <div className="flex flex-safe bg-blue-100 text-black items-center">
            <div className="flex-1">
              <Field
                input_class="w-[100px] py-2 px-3"
                hide_label
                label="Trova"
                value={FIND_REPLACE.search.get().value}
                disabled={!canWrite}
                onInput={(e) => FIND_REPLACE.search.set(p=> ({ ...p, value: e.target.value }))}
                error_message={""}
                id={"find-search"}
                type={"text"}
                placeholder={"Testo da trovare"}
                onKeyUp={(_e:any)=> _e.key==="Enter" ?FIND_REPLACE.executeSearch() :null} 
              />
            </div>
              
            <button onClick={(e) => FIND_REPLACE.search.set(prev => ({ ...prev, caseSensitive: !prev.caseSensitive }))}
                    className={`p-2 ${FIND_REPLACE.search.get().caseSensitive ? 'bg-blue-200/80' : ''}`}
                    title="Maiuscole/minuscole">
              <i className="bi bi-alphabet-uppercase"></i>
            </button>
            <button onClick={(e) => FIND_REPLACE.search.set(prev => ({ ...prev, wholeWord: !prev.wholeWord }))}
                    className={`p-2 ${FIND_REPLACE.search.get().wholeWord ? 'bg-blue-200/80' : ''}`}
                    title="Parola intera">
              <i className="bi bi-fonts"></i>
            </button>
            <button type="button" onClick={FIND_REPLACE.previous} 
                    className="py-2 px-3 bg-indigo-900 text-white"
                    title="Precedente">
              <i className="bi bi-arrow-up"></i>
            </button>
          </div>


          {/* rinomina */}
          <div className="grid grid-cols-[1fr_auto_auto]">
            <div className="bg-green-100 text-black">
              <Field
                input_class="py-2 px-3"
                hide_label
                label="Sostituisci"
                value={FIND_REPLACE.replaceQuery.get()}
                disabled={!canWrite}
                onInput={(e) => FIND_REPLACE.replaceQuery.set(e.target.value)}
                error_message={""}
                id={"find-replace"}
                type={"text"}
                placeholder={"Sostituisci con..."}
                onKeyUp={(_e:any)=> _e.key==="Enter" ?FIND_REPLACE.replace() :null} 
              />
            </div>

            <button onClick={_=> FIND_REPLACE.replaceAll()} 
                    className="p-2 bg-green-200 text-black relative"
                    title="Sostituisci tutto">
              <i className="bi bi-alphabet absolute -top-1"></i>
              <i className="bi bi-back absolute top-2"></i>
              <i className="bi bi-back invisible"></i>
            </button>
            <button type="button" onClick={FIND_REPLACE.next} 
                    className="py-2 px-3 bg-indigo-900"
                    title="Prossimo">
              <i className="bi bi-arrow-down"></i>
            </button>

          </div>
        </Frag>
      </div>
    </div>

    {/* SEGNALIBRI */}
    <Frag if={canRead && MARCKERS.isVisible.get()}>
      <div className="fixed inset-0 z-50 flex">
        {/* BACKDROP */}
        <div onClick={()=> MARCKERS.isVisible.set(false)}
             className="absolute inset-0 bg-black/50">
        </div>
        
        {/* OFFCANVAS */}
        <div className="relative ml-auto w-80 max-w-full h-full bg-indigo-900 shadow-xl overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">
                <i className="bi bi-bookmarks-fill me-2"></i>
                Segnalibri
              </h3>
              <button onClick={()=> MARCKERS.isVisible.set(false)}
                      className="p-2 text-white hover:bg-indigo-800 rounded"
                      title="Chiudi">
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            
            <ol className="space-y-2">
              {MARCKERS.markers.length === 0 ? (
                <li className="text-gray-400 text-center py-4">
                  Nessun segnalibro impostato
                </li>
              ) : (
                MARCKERS.markers.map((p, index) => (  
                  <li key={index}>
                    <button onClick={()=> MARCKERS.scrollToMarker(index.toString())}
                            className="w-full py-2 px-3 bg-indigo-800 text-sm text-left rounded truncate"
                            title={`Vai al paragrafo: ${p.text}`}>
                      <i className="me-2 bi bi-bookmark"></i>
                      <span className="truncate">{p.text || 'Paragrafo senza testo'}</span>
                    </button>
                  </li>
                ))
              )}
            </ol>
          </div>
        </div>
      </div>
    </Frag>

    <main id="SectionComponent" onClick={PARAG.closeTemplateInputStyle}>
      <div className="mx-auto container max-w-[400px]">

        <section className="pb-50 min-h-dvh flex-1">
          {/* SEZIONE NON TROVATA */}
          <Frag if={!SECTION.bookSection}>
            <div className="py-10 text-center text-red-500">
              <i className="me-1 bi bi-exclamation-triangle"></i>
              Sezione non trovata
            </div>
          </Frag>



          {/* SEZIONE TROVATA */}
          <Frag if={!!SECTION.bookSection}>
            {/* TITOLO SEZIONE */}
            <form onSubmit={SECTION.handleSubmit} className="p-3 pb-60 text-center">
              <Field
                input_class="text-3xl font-bold text-center text-orange-500"
                hide_label
                label="Titolo della sezione"
                value={SECTION_title}
                disabled={!canWrite}
                asterisk
                onInput={(_e) => SECTION.handleChange(_e.target.value)}
                error_message={errors["section>section-title"]}
                id={"section-title"}
                type={"text"}
                placeholder={"Titolo della sezione"}
                onKeyDown={SECTION.titleKeyDown}
              />
              <div className="mt-5 border-t border-gray-500 relative">
                <Frag if={canWrite} className="absolute z-2">
                  <div className="py-1 flex flex-wrap gap-1 justify-around">
                    <b className="px-2 bg-blue-300 text-sm text-black outline rounded-full">Paragrafi: {SECTION.bookSection?.paragraphs?.length}</b>
                    <b className="px-2 bg-green-300 text-sm text-black outline rounded-full">Lettere: {SECTION.words}</b>
                    <b className="px-2 bg-indigo-300 text-sm text-black outline rounded-full">Lunghezza pagina: {Math.floor(olHeight)}px</b>
                  </div>
                  <div className="p-1 bg-white text-black outline rounded">
                    <Field
                      input_class={`p-2 text-sm`}
                      label_class="px-2 text-sm font-bold italic"
                      id={"section-note"}
                      label="Nota della sezione"
                      value={SECTION.bookSection?.note || ""}
                      disabled={!canWrite}
                      type={"textarea"}
                      rows={4}
                      placeholder={"Visualizzato solo dagli scrittori. Inserire sintesi o modifiche da implementare"}
                      onInput={(_e) => SECTION.updateNote(_e.target.value)}
                    />
                  </div>
                </Frag>
              </div>
            </form>

            {/* WRAPPER PARAGRAFI */}
            <Frag if={showParagraphs} className="pb-10">
              <Frag.Else>
                <div className="py-10 text-center">
                  <i className="me-1 bi bi-file-text"></i>
                  Nessun paragrafo
                </div>
                <Frag if={!!canWrite} className="flex justify-center">
                  <button
                    onClick={() => PARAG.handleCreate()}
                    className="py-2 px-3 border rounded bg-blue-500/30 text-blue-300"
                  >
                    <i className="bi bi-plus-lg"></i>
                    Aggiungi paragrafo
                  </button>
                </Frag>
              </Frag.Else>

              <ol ref={olRef}>
                {SECTION.bookSection?.paragraphs?.map((p, paragraph_i) => (
                  <li key={paragraph_i} className="relative">
                    {/* PULSANTE INSERIMENTO */}
                    <AddParagraphButton
                      if={canWrite && paragraph_i === 0}
                      className="top-0 -translate-y-1"
                      handleCreate={() => PARAG.handleCreate("top")}
                    />

                    {/* TESTO PARAGRAFO */}
                    <div onClick={PARAG.handleFocusText}
                          >
                      <div onClick={PARAG.handleFocusText} className={`block py-3 ${(p as any).ex_style}`}>
                        <div  className={canWrite && PARAG.styleInput.get().index === paragraph_i ? 'outline-3 outline-dashed outline-black' : ''}>
                          <div  onClick={PARAG.handleFocusText} className={`${canWrite && PARAG.styleInput.get().index === paragraph_i ? 'outline-3 outline-white' : ''}`}>
                            <Field
                              input_class={`text-center ${PARAG.parseStyle(p) || ""}`}
                              placeholder="Testo del paragrafo"
                              value={p.text}
                              readOnly={!canWrite}
                              hide_label
                              label="Descrivi la scena"
                              asterisk
                              type="textarea"
                              id={paragraph_i + ">text"}
                              onInput={(_e) => PARAG.update(paragraph_i, "text", _e.target.value)}
                              onKeyDown={(_e: any) => PARAG.handleKey(_e)}
                              error_message={errors[`${paragraph_i}>text`]}
                              onFocus={() => PARAG.setStyleInput(paragraph_i)}
                              onClick={PARAG.handleFocusText} data-focus-text
                            />
                          </div>
                        </div>
                      </div>

                      {/* STILE PARAGRAFO */}
                      <Frag if={canWrite && PARAG.styleInput.get().index === paragraph_i} className="mx-8 relative">
                        <div className='absolute top-0 z-2 w-full' data-dropdown>
                          <div className="p-1 bg-white text-black outline rounded">
                            {/* CONSIGLIATI */}
                            <div className="flex flex-wrap items-center gap-1">
                              {AUTOCOMPLETE.suggestions.get().map((className, _i) => (
                                <button key={_i}
                                        onClick={_e=> AUTOCOMPLETE.handleClick(_e, p, paragraph_i)}
                                        className={`px-2 rounded-full text-sm outline font-bold ${_i ?"bg-blue-300" :"bg-red-300"}`}
                                        aria-label={`Applica stile: ${className}`}>

                                  <Frag if={!_i}>
                                    <i className="px-1 me-1 bi bi-arrow-return-left bg-black/60 text-white rounded"></i>
                                  </Frag>
                                  
                                  {className}
                                </button>
                              ))}
                            </div>

                            <div className="pt-2 grid gap-1 grid-cols-[auto_1fr] items-start">
                              {/* ICONA PALETTE */}
                              {p.in_style
                                ?<button onClick={_=> PARAG.update(paragraph_i, "in_style", "")}
                                        className="p-1 text-red-700 rounded-lg relative outline"
                                        aria-label="Resetta stile">
                                  <i className="bi bi-x-lg absolute top-1 start-1"></i>
                                  <i className="bi bi-palette"></i>
                                </button>
                                :<label htmlFor={paragraph_i + ">in_style"}
                                        className="p-1 bi bi-palette-fill"
                                        aria-label="Seleziona stile"></label>
                              }
                              {/* INPUT STILE */}
                              <div>
                                <Field
                                  input_class="p-1"
                                  placeholder="Stile tailwind del paragrafo"
                                  value={p.in_style || ''}
                                  disabled={!canWrite}
                                  hide_label
                                  label="Stile tailwind del paragrafo"
                                  asterisk
                                  type="textarea"
                                  id={paragraph_i + ">in_style"}
                                  onChange={(_e) => PARAG.update(paragraph_i, "in_style", _e.target.value.toLowerCase())}
                                  onKeyDown={(_e: any) => PARAG.handleKey(_e)}
                                  onKeyUp={(_e: any) => AUTOCOMPLETE.setSuggestions(_e)}
                                  error_message={errors[`${paragraph_i}>in_style`]}
                                  onFocus={(_e:any) => PARAG.setStyleInput(paragraph_i) }
                                />
                              </div>

                            </div>
                          </div>
                        </div>
                      </Frag>
                    </div>

                    {/* RIMUOVI PARAGRAFO */}
                    <Frag if={canWrite} className="pr-1 pt-3 absolute top-0 end-0 z-1">
                      <div className="flex flex-col">
                        <button type="button" title="rimuovi paragrafo"
                                onClick={() => PARAG.handleRemove(paragraph_i)}
                                className="px-2 py-1 bg-gray-600 text-red-300 rounded-full">
                          <i className="bi bi-trash-fill"></i>
                        </button>
                        <button type="button" title={`${p.isMarcked ?"Rimuovi" :"Imposta"} segnalibro`}
                                onClick={() => PARAG.update(paragraph_i,"isMarcked", !p.isMarcked)}
                                className="px-2 py-1 bg-gray-600 text-green-300 rounded-full">
                          {p.isMarcked 
                            ?<i className="bi bi-bookmark-fill"></i>
                            :<i className="bi bi-bookmark"></i>
                          }
                        </button>
                      </div>
                    </Frag>

                    {/* PULSANTE INSERIMENTO */}
                    <AddParagraphButton
                      if={canWrite}
                      className="bottom-0"
                      handleCreate={() => PARAG.handleCreate(paragraph_i)}
                    />
                  </li>
                ))}
              </ol>
            </Frag>
          </Frag>
        </section>

      </div>
    </main>
  </>);
}