"use client";

import "./Section.sass";
import Field from "@/app/shareds/Field";
import Frag from "@/app/shareds/Frag";
import { LoadingComponent } from "@/app/shareds/LoadingComponent";
import { Breadcrumb } from "@/app/shareds/Breadcrumb";
import { useSectionComponent } from "./SectionComponent";
import { useMemo } from "react";
import EditModeComponent from "@/app/shareds/EditModeComponent";
import Navigation from "@/app/shareds/Navigation";

interface AddProps { handleCreate: Function; if: boolean; className?: string }
function AddParagraphButton({ if: show, handleCreate, className = "" }: AddProps) {
  return <Frag if={show} className={`absolute start-0 w-full ${className}`}>
    <div className="pe-3 flex gap-2 items-center">
      <button
        onClick={() => handleCreate()}
        className="absolute start-0 -top-3 z-1 block px-1 rounded-full bg-blue-900 text-blue-300 border"
        aria-label="Aggiungi paragrafo"
      >
        <i className="bi bi-plus-lg"></i>
      </button>
      <div className="absolute w-full pointer-events-none border-y border-dashed border-blue-300"></div>
    </div>
  </Frag>
}


type SectionTemplateProps = ReturnType<typeof useSectionComponent>;
export default function SectionTemplate({
  book_id,  section_title,  page,  SECTION_title,
  errors,  SECTION,  PARAG,
}: SectionTemplateProps) {

  const showParagraphs = useMemo(() => 
    !!SECTION.bookSection?.paragraphs?.length
  , [SECTION.bookSection]);

  if (!page.isPageLoaded) return <LoadingComponent />;

  const {isEditMode} = page;
  return (
    <main id="SectionComponent" onClick={PARAG.closeTemplateInputStyle}>
      <Navigation back_btn={{ href: `/books/${book_id}` }} page_title={section_title}>
        <button onClick={SECTION.copy} 
                className="p-2 bg-blue-900 truncate">
          <i className="bi bi-copy"></i> 
          <span className="pl-2 hidden sm:inline">Copia</span>
        </button>
        <Frag if={isEditMode}>
          <button onClick={SECTION.paste} 
                  className="p-2 bg-green-900 truncate">
            <i className="bi bi-clipboard"></i> 
            <span className="pl-2 hidden sm:inline">Incolla</span>
          </button>
        </Frag>
      </Navigation>
      <Breadcrumb />

      {/* Contenitore principale scrollabile */}
      <section className="min-h-screen flex-1 overflow-y-auto mx-auto container max-w-[400px]">
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
          <form onSubmit={SECTION.handleSubmit} className="p-3 py-50 text-center">
            <Field
              input_class="text-3xl font-bold text-center text-orange-500"
              hide_label
              label="Titolo della sezione"
              value={SECTION_title}
              disabled={!isEditMode}
              asterisk
              onChange={(_e) => SECTION.handleChange(_e.target.value)}
              error_message={errors["section>title"]}
              id={"title"}
              type={"text"}
              placeholder={"Titolo della sezione"}
              onKeyDown={SECTION.titleKeyDown}
            />
            <div className="mt-5 border-y border-gray-500"></div>
          </form>

          {/* WRAPPER PARAGRAFI */}
          <Frag if={showParagraphs} className="pb-10">
            <Frag.Else>
              <div className="py-10 text-center">
                <i className="me-1 bi bi-file-text"></i>
                Nessun paragrafo
              </div>
              <Frag if={!!isEditMode} className="flex justify-center">
                <button
                  onClick={() => PARAG.handleCreate()}
                  className="py-2 px-3 border rounded bg-blue-500/30 text-blue-300"
                >
                  <i className="bi bi-plus-lg"></i>
                  Aggiungi paragrafo
                </button>
              </Frag>
            </Frag.Else>

            <ol>
              {SECTION.bookSection?.paragraphs?.map((p, paragraph_i) => (
                <li key={paragraph_i} className="relative">
                  {/* PULSANTE INSERIMENTO */}
                  <AddParagraphButton
                    if={isEditMode && paragraph_i === 0}
                    className="top-0 -translate-y-1"
                    handleCreate={() => PARAG.handleCreate("top")}
                  />

                  {/* PARAGRAFO */}
                  <div className={`py-3 ${PARAG.getExternalStyle(p)}`}>
                    <div className={`p-1 ${p.in_style || ""}`}>
                      <div className={isEditMode && PARAG.styleInput.index === paragraph_i ? 'outline-3 outline-dashed outline-black' : ''}>
                        <Field
                          input_class={`p-1 text-center ${isEditMode && PARAG.styleInput.index === paragraph_i ? 'outline-3 outline-white' : ''}`}
                          placeholder="Testo del paragrafo"
                          value={p.text}
                          disabled={!isEditMode}
                          hide_label
                          label="Testo del paragrafo"
                          asterisk
                          type="textarea"
                          id={paragraph_i + ">text"}
                          onChange={(_e) => PARAG.handleChange(_e)}
                          onKeyDown={(_e: any) => PARAG.handleKey(_e)}
                          error_message={errors[`${paragraph_i}>text`]}
                          onFocus={() => PARAG.setStyleInput(paragraph_i)}
                        />
                      </div>

                      {/* STILE PARAGRAFO */}
                      <Frag if={isEditMode && PARAG.styleInput.index === paragraph_i} className="relative">
                        <div className='absolute top-0 z-2 w-full' data-dropdown>
                          <div className="bg-white text-black outline rounded">
                            <div className="p-1 grid gap-1 grid-cols-[auto_1fr] items-center">
                              {/* ICONA PALETTE */}
                              {p.in_style 
                                ?<button onClick={_=> PARAG.set(paragraph_i, {in_style:""})}
                                        className="bi bi-x-lg px-1 bg-red-700 text-white rounded-lg"></button>
                                :<label htmlFor={paragraph_i + ">in_style"} 
                                        className="bi bi-palette"></label>
                              }
                              {/* INPUT STILE */}
                              <div>
                                <Field
                                  input_class="p-1"
                                  placeholder="Stile tailwind del paragrafo"
                                  value={p.in_style || ''}
                                  disabled={!isEditMode}
                                  hide_label
                                  label="Stile tailwind del paragrafo"
                                  asterisk
                                  type="textarea"
                                  id={paragraph_i + ">in_style"}
                                  onChange={(_e) => PARAG.handleChange(_e)}
                                  onKeyDown={(_e: any) => PARAG.handleKey(_e)}
                                  error_message={errors[`${paragraph_i}>in_style`]}
                                  onFocus={() => PARAG.setStyleInput(paragraph_i)}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </Frag>
                    </div>
                  </div>

                  {/* RIMUOVI PARAGRAFO */}
                  <Frag if={isEditMode} className="pr-1 pt-3 absolute top-0 end-0 z-1">
                    <button
                      type="button"
                      onClick={() => PARAG.handleRemove(paragraph_i, p)}
                      className="px-2 py-1 bg-red-700 text-white outline rounded-full"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </Frag>

                  {/* PULSANTE INSERIMENTO */}
                  <AddParagraphButton
                    if={isEditMode}
                    className="bottom-0"
                    handleCreate={() => PARAG.handleCreate(paragraph_i)}
                  />
                </li>
              ))}
            </ol>
          </Frag>
        </Frag>
      </section>

      <EditModeComponent page={page} />
      {/* STILE PARAGRAFO */}
      {/* <Frag if={PARAG.styleInput.isVisible && isEditMode}>
        <div className="p-2 sticky bottom-0 z-2 mx-auto max-w-[400px]">
          <div className="grid grid-cols-[1fr_auto] items-end">

            <div className="grid gap-1 grid-cols-[1fr_auto] items-end bg-white text-black outline rounded">
              <label htmlFor={PARAG.styleInput.index + ">in_style"} 
                      className="pl-1 bi bi-palette" 
                      title="Stile del paragrafo"></label>

              <Field
                input_class={`px-1`}
                placeholder="Stile del paragrafo"
                value={SECTION.bookSection?.paragraphs?.[PARAG.styleInput.index]?.in_style || ""}
                disabled={!isEditMode}
                hide_label
                label="Stile del paragrafo"
                type="textarea"
                id={PARAG.styleInput.index + ">in_style"}
                onChange={(_e) => PARAG.handleChange(_e)}
                onKeyDown={(_e: any) => PARAG.handleKey(_e)}
                error_message={errors[`${PARAG.styleInput.index}>in_style`]}
              />
            </div>

            <div className="ml-2">
              <EditModeComponent buttonOnly page={page} />
            </div>
          </div>
        </div>
      </Frag> */}
      {/* STILE PARAGRAFO */}

    </main>
  );
}