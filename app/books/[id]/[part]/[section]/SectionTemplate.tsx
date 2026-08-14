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
    <main id="SectionComponent">
      <Navigation back_btn={{ href: `/books/${book_id}` }} page_title={section_title} />

      <Breadcrumb />

      <section className="min-h-screen mx-auto container max-w-[400px]">
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
          <form onSubmit={SECTION.handleSubmit} className="p-3 py-10 text-center">
            <Field
              input_class="text-3xl font-bold text-center"
              hide_label 
              label="Titolo della sezione"
              value={SECTION_title}
              disabled={!isEditMode}
              asterisk
              onChange={(_e) =>SECTION.handleChange(_e.target.value)}
              error_message={errors["section>title"]}
              id={"title"}
              type={"text"}
              placeholder={"Titolo della sezione"}
            />

            <div className="mt-5 border-y border-gray-500"></div>
          </form>


          {/* WRAPPER PARAGRAFI */}
          <Frag if={showParagraphs} className="pb-10">
            {/* nessun paragrafo */}
            <Frag.Else>
              <div className="py-10 text-center">
                <i className="me-1 bi bi-file-text"></i>
                Nessun paragrafo 
              </div>

              <Frag if={!!isEditMode} className="flex justify-center">
                <button onClick={() =>PARAG.handleCreate()}
                        className="py-2 px-3 border rounded bg-blue-500/30 text-blue-300">
                  <i className="bi bi-plus-lg"></i>
                  Aggiungi paragrafo
                </button>
              </Frag>
            </Frag.Else>

            {SECTION.bookSection?.paragraphs?.map(
              (p, paragraph_i) => (
                <div key={paragraph_i} className="relative">
                  
                  {/* PULSANTE INSERIMENTO */}
                  <AddParagraphButton 
                    if={isEditMode && paragraph_i === 0} 
                    className="top-0 -translate-y-1"
                    handleCreate={() => PARAG.handleCreate("top")} 
                  />

                  {/* PARAGRAFO */}
                  <div className={`py-3 ${PARAG.getExternalStyle(p)}`}>
                    <div className={`p-1 ${p.in_style || ""}`}>

                      {/* TESTO */}
                      <div className={`${isEditMode && PARAG.styleInput.index===paragraph_i ? 'outline-3 outline-dashed outline-black' : ''}`}>
                        <Field
                          input_class={`p-1 text-center ${isEditMode && PARAG.styleInput.index===paragraph_i ? 'outline-3 outline-white' : ''}`}
                          placeholder="Testo del paragrafo"
                          value={p.text}
                          disabled={!isEditMode}
                          hide_label
                          label="Testo del paragrafo"
                          asterisk
                          type="textarea"
                          id={paragraph_i+">text"}
                          onChange={(_e) => PARAG.handleChange(_e)}
                          onKeyDown={(_e:any) => PARAG.handleKey(_e)}
                          error_message={errors[`${paragraph_i}>text`]}
                          onFocus={() => PARAG.setStyleInput(paragraph_i)}
                        />
                      </div>

                    </div>
                  </div>
                  {/* PARAGRAFO */}

                  {/* RIMUOVI PARAGRAFO */}
                  <Frag if={isEditMode} className="pr-1 pt-3 absolute top-0 end-0 z-1">
                    <button
                      type="button"
                      onClick={() =>PARAG.handleRemove(paragraph_i,p)}
                      className="px-2 py-1 bg-red-700 text-white outline rounded-full">
                      <i className="bi bi-trash"></i>
                    </button>
                  </Frag>

                  
                  {/* STILE */}
                  <Frag if={PARAG.styleInput.index===paragraph_i && isEditMode} 
                        className="absolute z-2 w-full">
                    <div className="px-5">
                      <div className="grid grid-cols-[auto_1fr] gap-1 py-1 px-2 bg-white/90 text-black outline rounded">
                        <label htmlFor={paragraph_i+">in_style"} className="bi bi-palette" title="Stile del paragrafo"></label>
                        <Field
                          input_class={`px-1`}
                          placeholder="Stile del paragrafo"
                          value={p.in_style || ""}
                          disabled={!isEditMode}
                          hide_label
                          label="Stile del paragrafo"
                          type="textarea"
                          id={paragraph_i+">in_style"}
                          onChange={(_e) => PARAG.handleChange(_e)}
                          onKeyDown={(_e:any) => PARAG.handleKey(_e)}
                          error_message={errors[`${paragraph_i}>in_style`]}
                        />
                      </div>
                    </div>
                  </Frag>

                  {/* PULSANTE INSERIMENTO */}
                  <AddParagraphButton 
                    if={isEditMode} 
                    className="bottom-0"
                    handleCreate={() => PARAG.handleCreate(paragraph_i)} 
                  />

                </div>
              )
            )}
          </Frag>
          {/* WRAPPER PARAGRAFI */}
        </Frag>
      </section>
      <EditModeComponent page={page} />
    </main>
  );
}