import "./Section.sass";
import Field from "@/app/shareds/Field";
import Frag from "@/app/shareds/Frag";
import { LoadingComponent } from "@/app/shareds/LoadingComponent";
import Navbar from "@/app/shareds/Navbar";
import { Breadcrumb } from "@/app/shareds/Breadcrumb";
import { useSectionComponent } from "./SectionComponent";
import React, { useMemo } from "react";
import EditModeComponent from "@/app/shareds/EditModeComponent";

interface AddProps { handleCreate: Function }
function AddParagraphButton({ handleCreate }: AddProps) {
  return <div className="pe-3 flex gap-2 items-center">
    <button
      onClick={() => handleCreate()}
      className="block px-1 rounded-full bg-blue-900 text-blue-300 border"
      aria-label="Aggiungi paragrafo"
    >
      <i className="bi bi-plus-lg"></i>
    </button>
    <div className="flex-1 border-y border-dashed border-blue-300"></div>
  </div>
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
      <Navbar back_btn={{ href: `/books/${book_id}` }} page_title={section_title} />
      <Breadcrumb />

      <section className="mx-auto container max-w-[400px]">
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
          <Frag if={showParagraphs} className="pb-30">
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
                  <Frag if={isEditMode && paragraph_i === 0} 
                        className="absolute top-0 start-0 z-1 w-full -translate-y-1">
                    <AddParagraphButton handleCreate={() => PARAG.handleCreate("top")} />
                  </Frag>

                  {/* PARAGRAFO */}
                  <div className={`py-3 ${PARAG.getExternalStyle(p)}`}>
                    <div className={`p-1 ${p.in_style || ""}`}>

                      {/* TESTO */}
                      <div className="flex-1">
                        <Field
                          input_class="p-1 text-center"
                          placeholder="Testo del paragrafo"
                          value={p.text}
                          disabled={!isEditMode}
                          hide_label
                          label="Testo del paragrafo"
                          asterisk
                          type="textarea"
                          id={"text>" + paragraph_i}
                          onChange={(_e) => PARAG.handleChange(paragraph_i,"text",_e.target.value)}
                          error_message={errors[`${paragraph_i}>text`]}
                          onClick={() => PARAG.setBottomInput(paragraph_i)}
                        />
                      </div>

                      {/* RIMUOVI PARAGRAFO */}
                      <Frag if={isEditMode} className="pr-1 pt-3 absolute top-0 end-0">
                        <button
                          type="button"
                          onClick={() =>PARAG.handleRemove(paragraph_i,p)}
                          className="px-2 py-1 bg-red-700 text-white border rounded-full">
                          <i className="bi bi-trash"></i>
                        </button>
                      </Frag>

                    </div>
                  </div>
                  {/* PARAGRAFO */}

                  {/* PULSANTE INSERIMENTO */}
                  <Frag if={isEditMode} 
                        className="absolute bottom-0 start-0 z-1 w-full translate-y-1">
                    <AddParagraphButton handleCreate={() => PARAG.handleCreate(paragraph_i)} />
                  </Frag>

                </div>
              )
            )}
          </Frag>
          {/* WRAPPER PARAGRAFI */}
        </Frag>

        {/* INPUT STYLE */}
        <Frag if={!!(isEditMode && PARAG.bottomInput.isVisible)}>
          <div className="fixed bottom-0 left-0 z-2 w-full">
            <div className="p-2 flex gap-2 items-end bg-gray-900 relative">

              <div className="absolute bottom-15 right-2 z-1">
                {/* pusante chiusura */}
                <button className="px-2 py-1 bg-red-700 border rounded-full text-xl" 
                        onClick={() => PARAG.setBottomInput(null)}
                        role="button">
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
              
              <i className="py-2 bi bi-palette"></i>
              <div className="flex-1">
                <Field
                  type="textarea"
                  input_class="px-3 py-2 max-h-[100px]"
                  placeholder="Stile Tailwind"
                  value={PARAG.bottomInput.value}
                  disabled={!isEditMode}
                  hide_label
                  label="Aggiungi classi Tailwind"
                  asterisk
                  id="style"
                  onChange={(_e) =>PARAG.handleChange(PARAG.bottomInput.index, "in_style", _e.target.value)}
                  error_message={errors[`${PARAG.bottomInput.index}>style`]}
                />
              </div>
              <button className="py-2 px-3 bg-green-700 text-white rounded-full" role="button">
                <i className="bi bi-send"></i>
              </button>
            </div>
          </div>
        </Frag>
        {/* INPUT STYLE */}
      </section>

      <Frag if={!(isEditMode && PARAG.bottomInput.isVisible)}>
        <EditModeComponent page={page}/>
      </Frag>
    </main>
  );
}