"use client";

import "./Section.sass";
import Field from "@/app/shareds/Field";
import Frag from "@/app/shareds/Frag";
import Navbar from "@/app/shareds/Navbar";
import { useSectionComponent, UseSectionComponentProps } from "./useSectionComponent";
import Link from "next/link";
import InsertAuthCodesComponent from "@/app/shareds/InsertAuthCodesComponent";
import React from "react";
import { EditModeToggleButton } from "@/app/data/CommonPagesContext";
import Bottombar from "@/app/shareds/Bottombar";
import { Dropdown, DropdownContent, DropdownSummary } from "@/app/shareds/Dropdown";
import { GROUPS_DATAS } from "./TailwindClassGroups";

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
    book_id,  section_id,  page,
    SECTION,
    SHARED,
    PARAG,
    errors,
    GROUPS,
    HISTORY,
    FIND_REPLACE,
    canRead, canWrite, section_isEditMode,
    MARCKERS,
    NAVIGATION
  } = useSectionComponent(props); 
    
  const styleInput = GROUPS.styleInput.get

  if (!!book.get && !canRead) return <InsertAuthCodesComponent targetId={book_id} />

  return (<>
    {/* NAVBAR */}
    <Navbar back_btn={{ href: `/books/${book_id}` }} page_title={SECTION.mainTitle.get}>
      {/* SEGNALIBRI */}
      <button onClick={()=> MARCKERS.isVisible.set(true)} 
              className="mx-2 px-3 py-2 bg-green-900 rounded" 
              title="Segnalibri">
        <i className="bi bi-bookmarks-fill"></i> 
        <span className="ms-1 hidden sm:inline">Segnalibri</span>
      </button> 

      {/* visibile all'editore */}
      <Frag if={section_isEditMode}>
        <Dropdown className="relative">
          <DropdownSummary>
            <button className="p-3 bg-indigo-900 rounded-full"
                    title="Impostazioni sezione">
              <i className="bi bi-three-dots-vertical"></i>
            </button>
          </DropdownSummary>
          <DropdownContent className="absolute right-0 z-1 bg-gray-700 grid min-w-[100px]">
            {/* copia */}
            <button onClick={()=> SHARED.copy()}
                    className="p-2 bg-blue-900" data-feedback>
              <i className="bi bi-copy"></i>
              <span className="pl-2">Copia</span>
            </button>
            {/* incolla */}
            <button onClick={SHARED.paste}
                    className="p-2 bg-green-900">
              <i className="bi bi-clipboard"></i>
              <span className="pl-2">Incolla</span>
            </button>
            {/* impostazioni */}
            <Link href={`/books/${book_id}/settings`}
                  className="p-2 bg-indigo-900 truncate">
              <i className="bi bi-gear"></i>
              <span className="pl-2">Impostazioni libro</span>
            </Link>
          </DropdownContent>
        </Dropdown>
      </Frag>
    </Navbar>



    {/* STRUMENTI */}
    <div className="fixed top-[50px] left-0 right-0 z-20 mx-auto print:hidden" data-toptools>
      <div className="mx-auto w-max bg-indigo-900 rounded-b-lg overflow-hidden">

        <Frag if={!FIND_REPLACE.isVisible.get}>
          <div className="flex items-center">
            <Frag if={section_isEditMode}>
              {/* UNDO */}
              <button onClick={HISTORY.undo} 
                      className="px-3 py-2 bg-indigo-900" 
                      title="Annulla">
                <i className="bi bi-arrow-90deg-left" style={{transform:"rotate(-90) !important"}}></i> 
              </button>
              {/* CERCA */}
              <button onClick={()=> FIND_REPLACE.isVisible.set(p=> !p)} 
                      className={`px-3 py-2 ${FIND_REPLACE.isVisible.get ?"bg-blue-800" :"bg-gray-800"}`}>
                <i className="bi bi-search"></i> 
                <span className="ms-1">Cerca</span>
              </button>
              {/* REDO */}
              <button onClick={HISTORY.redo} 
                      className="px-3 py-2 bg-indigo-900" 
                      title="Ripeti">
                <i className="bi bi-arrow-90deg-right rotate-90"></i> 
              </button>
            </Frag>
          </div>
        </Frag>

        {/* CERCA E SOSTITUISCI */}
        <Frag if={section_isEditMode && FIND_REPLACE.isVisible.get} className="p-1">
          {/* generali */}
          <div className="grid grid-cols-[1fr_auto] items-center">
            <h4 className="p-3 font-bold text-sm">
              {FIND_REPLACE.foundIndices.length > 0 ?(
                <span>
                  {FIND_REPLACE.currentIndex.get + 1} / {FIND_REPLACE.foundIndices.length} occorrenze trovate
                </span>
              ):(
                <span>Cerca e sostituisci</span>
              )}
            </h4>
            <button type="button" onClick={()=> FIND_REPLACE.isVisible.set(p=> !p)} 
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
                label="Cerca"
                value={FIND_REPLACE.search.get.value}
                disabled={!section_isEditMode}
                onInput={(e) => FIND_REPLACE.search.set(p=> ({ ...p, value: e.target.value }))}
                error_message={""}
                id={"find-search"}
                type={"text"}
                placeholder={"Testo da trovare"}
                onKeyUp={(_e:any)=> _e.key==="Enter" ?FIND_REPLACE.executeSearch() :null} 
              />
            </div>
              
            <button onClick={() => FIND_REPLACE.search.set(prev => ({ ...prev, caseSensitive: !prev.caseSensitive }))}
                    className={`p-2 ${FIND_REPLACE.search.get.caseSensitive ? 'bg-blue-200/80' : ''}`}
                    title="Maiuscole/minuscole">
              <i className="bi bi-alphabet-uppercase"></i>
            </button>
            <button onClick={() => FIND_REPLACE.search.set(prev => ({ ...prev, wholeWord: !prev.wholeWord }))}
                    className={`p-2 ${FIND_REPLACE.search.get.wholeWord ? 'bg-blue-200/80' : ''}`}
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
                value={FIND_REPLACE.replaceQuery.get}
                disabled={!section_isEditMode}
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
    {/* STRUMENTI */}


    {/* SEGNALIBRI */}
    <Frag if={canRead && MARCKERS.isVisible.get}>
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
                MARCKERS.markers.map((item, index) => (  
                  <li key={index}>
                    <button onClick={()=> {
                              MARCKERS.scrollToMarker(item.index.toString());
                              MARCKERS.isVisible.set(false);
                            }}
                            className="w-full py-2 px-3 bg-indigo-800 text-sm text-left rounded truncate"
                            title={`Vai al paragrafo: ${item.paragraph.text}`}>
                      <b>{index +1})</b>
                      <span className="ms-2 truncate">{item.paragraph.text || 'Paragrafo senza testo'}</span>
                    </button>
                  </li>
                ))
              )}
            </ol>
          </div>
        </div>
      </div>
    </Frag>
    {/* SEGNALIBRI */}


    <main id="SectionComponent" onClick={GROUPS.closeTemplateInputStyle}>
      <div className="mx-auto container max-w-[400px]">

        <section className="min-h-dvh flex-1">
          {/* SEZIONE NON TROVATA */}
          <Frag if={!SECTION.bookSection}>
            <div className="py-10 text-center text-red-500">
              <i className="me-1 bi bi-exclamation-triangle"></i>
              Sezione non trovata
            </div>
          </Frag>


          {/* SEZIONE TROVATA */}
          <Frag if={!!SECTION.bookSection} className=" bg-gray-600">
            {/* TITOLO SEZIONE */}
            <div className="p-3 py-60 text-center">
              <div>
                <Field
                  input_class="text-3xl font-bold text-center text-orange-500"
                  hide_label
                  label="Titolo della sezione"
                  value={SECTION.mainTitle.get}
                  disabled={!section_isEditMode}
                  asterisk
                  onChange={(_e) => SECTION.update("title", _e.target.value.trim())}
                  error_message={errors["section>section-title"]}
                  id={"section-title"}
                  type={"text"}
                  placeholder={"Titolo della sezione"}
                  onKeyDown={SECTION.titleKeyDown}
                  onFocus={(_e: any) => _e.target.scrollIntoView({ behavior: "smooth", block: "start" })}
                />
              </div>

              <div className="mt-5 border-t border-gray-500 relative">
                <Frag if={section_isEditMode} className="absolute z-2">
                  <div className="py-1 flex flex-wrap gap-1 justify-around">
                    <b className="px-2 bg-blue-300 text-sm text-black outline rounded-full">Paragrafi: {SECTION.bookSection?.paragraphs?.length}</b>
                    <b className="px-2 bg-green-300 text-sm text-black outline rounded-full">Lettere: {SECTION.words}</b>
                    <b className="px-2 bg-indigo-300 text-sm text-black outline rounded-full">Lunghezza pagina: {Math.floor(PARAG.listHeight.get)}px</b>
                  </div>
                  <div className="p-1 bg-white text-black outline rounded">
                    <Field
                      input_class={`p-2 text-sm`}
                      label_class="px-2 text-sm font-bold italic"
                      id={"section-note"}
                      label="Nota della sezione"
                      value={SECTION.bookSection?.note || ""}
                      disabled={!section_isEditMode}
                      type={"textarea"}
                      rows={4}
                      placeholder={"Visualizzato solo dagli scrittori. Inserire sintesi o modifiche da implementare"}
                      onChange={(_e) => SECTION.update("note", _e.target.value)}
                      onFocus={(_e: any) => _e.target.scrollIntoView({ behavior: "smooth", block: "start" })}
                    />
                  </div>
                </Frag>
              </div>
            </div>
            

            {/* WRAPPER PARAGRAFI */}
            <Frag if={PARAG.showParagraphs} className="pb-10">
              {/* NESSUN PARAGRAFO */}
              <Frag.Else>
                <div className="py-10 text-center">
                  <i className="me-1 bi bi-file-text"></i>
                  Nessun paragrafo
                </div>
                <Frag if={!!section_isEditMode} className="flex justify-center">
                  <button onClick={() => PARAG.handleCreate()}
                          className="py-2 px-3 border rounded bg-blue-500/30 text-blue-300">
                    <i className="bi bi-plus-lg"></i>
                    Aggiungi paragrafo
                  </button>
                </Frag>
              </Frag.Else>


              {/* LISTA PARAGRAFI */}
              <ol ref={PARAG.listReference}>
                {SECTION.bookSection?.paragraphs?.map((p, paragraph_i) => (
                  <li key={paragraph_i} className="relative">

                    {/* PULSANTE INSERIMENTO */}
                    <AddParagraphButton
                      if={section_isEditMode && paragraph_i === 0}
                      className="top-0 -translate-y-1"
                      handleCreate={() => PARAG.handleCreate("top")}
                    />

                    {/* TESTO PARAGRAFO */}
                    <div>
                      <div onClick={PARAG.handleFocusText} data-external-style className={`${p.ex_style}`}>
                        <div className={section_isEditMode && GROUPS.styleInput.get.index === paragraph_i ? 'outline-3 outline-dashed outline-black' : ''}>
                          <div className={`${section_isEditMode && GROUPS.styleInput.get.index === paragraph_i ? 'outline-3 outline-white' : ''}`}>
                            <Field
                              input_class={`text ${p.scripted_style || ""} ${p.in_style || ""}`}
                              placeholder="Testo del paragrafo"
                              value={p.text}
                              readOnly={!section_isEditMode}
                              hide_label
                              label="Descrivi la scena"
                              asterisk
                              type="textarea"
                              id={paragraph_i + ">text"}
                              onChange={(_e) => PARAG.update(paragraph_i, "text", _e.target.value)}
                              onKeyDown={(_e: any) => PARAG.handleKey(_e, paragraph_i, "text", p)}
                              error_message={errors[`${paragraph_i}>text`]}
                              onFocus={(_e:any) =>{ 
                                GROUPS.setStyleInput(paragraph_i);
                                _e.target.scrollIntoView({ behavior: "smooth", block: "start" });
                              }}
                            />
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* RIMUOVI PARAGRAFO / SEGNALIBRO */}
                    <div className="absolute top-0 end-0 z-2">
                      <div className="rounded overflow-hidden shadow-lg hover:bg-gray-600">
                        <Frag if={section_isEditMode}>
                          {/* rimuovi */}
                          <button type="button" 
                                  title="rimuovi paragrafo"
                                  onClick={() => PARAG.handleRemove(paragraph_i)}
                                  className="px-2 py-1 bg-gray-600/50 text-red-300">
                            <i className="bi bi-trash"></i>
                          </button>
                        </Frag>

                        {/* pulsante segnalibro */}
                        <Frag if={section_isEditMode==true || p.isMarcked===true }>
                          <button type="button" 
                                  title={`${p.isMarcked ?"Rimuovi" :"Imposta"} segnalibro`}
                                  onClick={() => PARAG.update(paragraph_i,"isMarcked", !p.isMarcked)}
                                  disabled={!section_isEditMode}
                                  className={`px-2 py-1 text-green-300 ${section_isEditMode ?'bg-gray-600/50' :''}`}>
                            
                            <Frag if={p.isMarcked===true}>
                              <i className="bi bi-bookmark-fill" />
                            </Frag>
                            <Frag if={section_isEditMode && p.isMarcked===false}>
                              <i className="bi bi-bookmark" />
                            </Frag>
                          </button>
                        </Frag>

                      </div>
                    </div>

                    {/* PULSANTE INSERIMENTO */}
                    <AddParagraphButton
                      if={section_isEditMode}
                      className="bottom-0"
                      handleCreate={() => PARAG.handleCreate(paragraph_i)}
                    />
                  </li>
                ))}
              </ol>
            </Frag>

            {/* NAVIGAZIONE SEZIONI (PRECEDENTE / SUCCESSIVA) */}
            <Frag if={!!NAVIGATION.prevSection || !!NAVIGATION.nextSection} className="mt-8 p-3 grid grid-cols-2 gap-3 text-sm print:hidden">
              {[NAVIGATION.prevSection, NAVIGATION.nextSection].map((_sec,i)=><React.Fragment key={i}>
                {_sec ?(
                  <Link href={`/books/${book_id}/${_sec.part_id}/${_sec.section_id}`}
                        className="p-2 flex items-center gap-2 bg-indigo-600 rounded-lg shadow-lg"
                        title={`Sezione ${!i ?"precedente" :"successiva"}: ${_sec.section_title}${_sec.part_title !== part?.title ? ` (${_sec.part_title})` : ''}`}>

                    <Frag if={i===0}>
                      <i className="bi bi-chevron-left text-lg "></i>
                    </Frag>
                    <div className="flex flex-col text-left flex-1">
                      <span className="text-xs text-gray-300">{!i ?"Precedente" :"Successiva"}</span>
                      <span className="font-semibold truncate">{_sec.section_title}</span>
                    </div>
                    <Frag if={i===1}>
                      <i className="bi bi-chevron-right text-lg "></i>
                    </Frag>
                  </Link>

                ) : <div /> }
              </React.Fragment> )}
            </Frag>

          </Frag>
        </section>

      </div>
    </main>


    {/* INPUT STILE NELLA BOTTOMBAR */}
    <Bottombar className={(section_isEditMode && styleInput.isVisible && !!styleInput.target) 
      ?"w-[100vw] max-w-[400px] bg-indigo-900 rounded-t outline outline-black/50" :''
    }>
      <Frag if={section_isEditMode && styleInput.isVisible && !!styleInput.target}>
        <div className="flex-1">
          
          {/* input */}
          <div className="m-1 text bg-black outline outline-white/20 rounded-xl overflow-hidden">
            <div className="grid gap-1 grid-cols-[auto_auto_1fr]">
              {/* ICONA PALETTE */}
              {styleInput.target?.in_style.length
                ?<button onClick={_=> PARAG.update(styleInput.index, "in_style", "")}
                        className="p-2 text-red-700 relative"
                        title="Resetta stile">
                  <i className="bi bi-palette-fill"></i>
                </button>
                :<label htmlFor={styleInput.index + ">in_style"}
                        className="p-2 bi bi-palette-fill"
                        title="Seleziona stile"></label>
              }
              
              {/* COPIA IN_STYLE */}
              <button onClick={()=> SHARED.copy(styleInput.target?.in_style || '')}
                      title="Copia in_style"
                      data-feedback
                      className="p-2 text-blue-300">
                <i className="bi bi-copy"></i>
              </button>
              
              {/* STILE PARAGRAFO */}
              <div>
                <Field
                  input_class="p-2"
                  placeholder="Stile tailwind del paragrafo"
                  value={styleInput.target?.ex_style 
                    ? `${styleInput.target.in_style} ,, ${styleInput.target.ex_style}` 
                    : (styleInput.target?.in_style || '')
                  }
                  disabled={!section_isEditMode}
                  hide_label
                  label="Stile tailwind del paragrafo"
                  asterisk
                  type="textarea"
                  id={styleInput.index + ">in_style"}
                  error_message={errors[`${styleInput.index}>in_style`]}
                  onChange={(_e) => PARAG.update(styleInput.index, "in_style", _e.target.value.toLowerCase())}
                  onFocus={(_e:any) => GROUPS.setStyleInput(styleInput.index)}
                  onKeyDown={(_e: any) => PARAG.handleKey(_e, styleInput.index, "in_style", styleInput.target)}
                />
              </div>
            </div>
          </div>

          {/* PULSANTI STATO STILE */}
          <div className="flex justify-around align-center">
            {GROUPS.actualGroups?.map((_group,i)=><React.Fragment key={_group.title}>
              <div className={`${i ?'my-2 border-l border-white/30' :''}`}></div>

              <Dropdown>
                <DropdownSummary>
                  <button className={`px-3 py-2 text bg-indigo-900`} title={_group?.title}>
                    <i className={`text-xl bi ${_group?.icon}`} />
                  </button>
                </DropdownSummary>

                <DropdownContent className="absolute z-10 bottom-full mb-2 start-0 w-full">
                  <div className="bg-indigo-700 shadow-lg rounded-xl overflow-hidden">
                    <div className="max-w-[250px] flex flex-wrap">
                      {GROUPS_DATAS[_group.key].map(_class=><React.Fragment key={_class.title}>
                        <button onClick={()=> GROUPS.toggleGroup(_class, _group.key)} 
                                className={`px-3 py-2 text-xl ${GROUPS.isSelected(_class) ? 'text bg-indigo-200' : 'bg-indigo-700'}`}
                                title={_class.title}>
                          <i className={`bi ${_class.icon}`}></i>
                        </button>
                      </React.Fragment>)}
                    </div>
                  </div>
                </DropdownContent>
              </Dropdown>
            </React.Fragment>)}
          </div>
          {/* PULSANTI STATO STILE */}

        </div>
      </Frag>

      {/* editmode */}
      <Frag if={canWrite}>
        <EditModeToggleButton />
      </Frag>
    </Bottombar>       
  </>);
}