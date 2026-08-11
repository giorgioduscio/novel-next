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
  book_id,  section_title,  page,  sectionFeat_title,
  errors,  sectionFeat,  paragraphFeat,
}: SectionTemplateProps) {

  const showParagraphs = useMemo(() => 
    !!sectionFeat.bookSection?.paragraphs?.length
  , [sectionFeat.bookSection]);
  

  if (!page.isPageLoaded) return <LoadingComponent />;

  const {isEditMode} = page;
  return (
    <main id="SectionComponent">
      <Navbar back_btn={{ href: `/books/${book_id}` }} page_title={section_title} />
      <Breadcrumb />

      <section className="mx-auto container max-w-[400px]">
        {/* SEZIONE NON TROVATA */}
        <Frag if={!sectionFeat.bookSection}>
          <div className="py-10 text-center text-red-500">
            <i className="me-1 bi bi-exclamation-triangle"></i>
            Sezione non trovata
          </div>
        </Frag>

        {/* SEZIONE TROVATA */}
        <Frag if={!!sectionFeat.bookSection}>

          {/* TITOLO SEZIONE */}
          <form onSubmit={sectionFeat.handleSubmit} className="p-3 py-10 text-center">
            <Field
              input_class="text-3xl font-bold text-center"
              hide_label 
              label="Titolo della sezione"
              value={sectionFeat_title}
              disabled={!isEditMode}
              asterisk
              onChange={(_e) =>sectionFeat.handleChange(_e.target.value)}
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
                <button onClick={() =>paragraphFeat.handleCreate()}
                        className="py-2 px-3 border rounded bg-blue-500/30 text-blue-300">
                  <i className="bi bi-plus-lg"></i>
                  Aggiungi paragrafo
                </button>
              </Frag>
            </Frag.Else>

            {sectionFeat.bookSection?.paragraphs?.map(
              (p, paragraph_i) => (
                <div key={paragraph_i} className="relative">
                  
                  {/* PULSANTE INSERIMENTO */}
                  <Frag if={isEditMode && paragraph_i === 0} 
                        className="absolute top-0 start-0 z-1 w-full -translate-y-1">
                    <AddParagraphButton handleCreate={() => paragraphFeat.handleCreate("top")} />
                  </Frag>

                  {/* PARAGRAFO */}
                  <div className={`py-3 ${paragraphFeat.getExternalStyle(p)}`}>
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
                          onChange={(_e) => paragraphFeat.handleChange(paragraph_i,"text",_e.target.value)}
                          error_message={errors[`${paragraph_i}>text`]}
                          onClick={() => paragraphFeat.setBottomInput(paragraph_i)}
                        />
                      </div>

                      {/* RIMUOVI PARAGRAFO */}
                      <Frag if={isEditMode} className="pr-1 pt-3 absolute top-0 end-0">
                        <button
                          type="button"
                          onClick={() =>paragraphFeat.handleRemove(paragraph_i,p)}
                          className="px-2 py-1 bg-red-600 text-white rounded-full">
                          <i className="bi bi-trash"></i>
                        </button>
                      </Frag>

                    </div>
                  </div>
                  {/* PARAGRAFO */}

                  {/* PULSANTE INSERIMENTO */}
                  <Frag if={isEditMode} 
                        className="absolute bottom-0 start-0 z-1 w-full translate-y-1">
                    <AddParagraphButton handleCreate={() => paragraphFeat.handleCreate(paragraph_i)} />
                  </Frag>

                </div>
              )
            )}
          </Frag>
          {/* WRAPPER PARAGRAFI */}
        </Frag>

        {/* INPUT STYLE */}
        <Frag if={!!(isEditMode && paragraphFeat.bottomInput.isVisible)}>
          <div className="fixed bottom-0 left-0 z-2 w-full">
            <div className="p-2 flex gap-2 items-center bg-gray-900">
              <i className="bi bi-palette"></i>
              <div className="flex-1">
                <Field
                  type="textarea"
                  input_class="px-3 py-2 max-h-[100px]"
                  placeholder="Stile Tailwind"
                  value={paragraphFeat.bottomInput.value}
                  disabled={!isEditMode}
                  hide_label
                  label="Stile Tailwind"
                  asterisk
                  id="style"
                  onChange={(_e) =>paragraphFeat.handleChange(paragraphFeat.bottomInput.index, "in_style", _e.target.value)}
                  error_message={errors[`${paragraphFeat.bottomInput.index}>style`]}
                />
              </div>
              <button className="px-2 py-1 bg-red-600 text-white rounded" 
                      onClick={() => paragraphFeat.setBottomInput(null)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          </div>
        </Frag>
        {/* INPUT STYLE */}
      </section>

      <Frag if={!(isEditMode && paragraphFeat.bottomInput.isVisible)}>
        <EditModeComponent page={page}/>
      </Frag>
    </main>
  );
}