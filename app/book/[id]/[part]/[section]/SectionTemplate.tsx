import "./Section.sass";
import Field from "@/app/shareds/Field";
import Frag from "@/app/shareds/Frag";
import { LoadingComponent } from "@/app/shareds/LoadingComponent";
import Navbar from "@/app/shareds/navbar";
import { Breadcrumb } from "@/app/shareds/Breadcrumb";
import { useSectionComponent } from "./SectionComponent";
import { useMemo } from "react";


type SectionTemplateProps = ReturnType<typeof useSectionComponent>;

export default function SectionTemplate({
  book_id,  section_title,  isPageLoaded,
  isEditMode,  sectionFeat_title,
  errors,  sectionFeat,  paragraphFeat,
}: SectionTemplateProps) {

  const showWtapperCondiction = useMemo(() => 
    !!sectionFeat.bookSection?.paragraphs?.length
  , [sectionFeat.bookSection]);
  

  if (!isPageLoaded) return <LoadingComponent />;

  return (
    <main id="SectionComponent">
      <Navbar back_btn={{ href: `/book/${book_id}` }} page_title={section_title} />
      <Breadcrumb />

      <section className="mx-auto container max-w-[400px]">
        {!sectionFeat.bookSection ? (
          <div className="py-10 text-center text-red-500">
            <i className="me-1 bi bi-exclamation-triangle"></i>
            Sezione non trovata
          </div>
        ) : (
          <>
            {/* TITOLO SEZIONE */}
            <form onSubmit={sectionFeat.handleSubmit} className="p-3 py-10 text-center">
              <Field
                input_class="text-3xl font-bold text-center"
                hide_label={!isEditMode}
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
            <Frag if={showWtapperCondiction} className="pb-30">
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
                    <Frag if={isEditMode && paragraph_i === 0} className="py-4 border-t border-blue-400/50">
                      <div className="-translate-y-1">
                        <button
                          onClick={() => paragraphFeat.handleCreate("top")}
                          className="mx-auto block px-1 border rounded-full bg-blue-500/30 text-blue-300"
                          aria-label="Aggiungi paragrafo"
                        >
                          <i className="bi bi-plus-lg"></i>
                        </button>
                      </div>
                    </Frag>

                    {/* PARAGRAFO */}
                    <div className={`pt-3 ${p.ex_style || ""}`}>
                      <div className={`p-1 ${p.in_style || ""}`}>

                        {/* STRUMENTI EDITING */}
                        <Frag if={isEditMode}
                              className="mb-5 text-black bg-white/60 outline rounded overflow-hidden">
                          <div className="grid grid-cols-[1fr_auto]">
                            <div>
                              <Field
                                input_class="p-1 border"
                                type="text"
                                value={p.ex_style || ""}
                                placeholder="Stile esterno (tailwind)"
                                onChange={(_e) => paragraphFeat.handleChange(paragraph_i,"ex_style",_e.target.value.toLowerCase())}
                                id={"ex_style>" +paragraph_i}
                                hide_label
                                label={"Stile esterno (tailwind)"}
                                error_message={errors[`${paragraph_i}>ex_style`]}
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() =>paragraphFeat.handleRemove(paragraph_i,p)}
                              className="px-2 py-1 bg-red-600 text-white">
                              <i className="bi bi-trash"></i>
                            </button>

                            <div>
                              <Field
                                input_class="p-1 border"
                                type="text"
                                value={p.in_style || ""}
                                placeholder="Stile interno (tailwind)"
                                onChange={(_e) => paragraphFeat.handleChange(paragraph_i,"in_style",_e.target.value.toLowerCase())}
                                id={"in_style>" +paragraph_i}
                                hide_label
                                label={"Stile interno (tailwind)"}
                                error_message={errors[`${paragraph_i}>in_style`]}
                              />
                            </div>
                          </div>
                        </Frag>

                        {/* TITOLO */}
                        <Frag if={!!p.pre_text || !!isEditMode}>
                          <Field
                            input_class="mb-3 px-1 max-w-[100px] mx-auto font-bold text-center text-inherit"
                            type="text"
                            id={"pre_text>" +paragraph_i}
                            value={p.pre_text || ""}
                            disabled={!isEditMode}
                            placeholder="Titolo"
                            onChange={(_e) =>paragraphFeat.handleChange(paragraph_i,"pre_text",_e.target.value)}
                            hide_label
                            label={"Titolo"}
                            error_message={errors[`${paragraph_i}>pre_text`]}
                          />
                        </Frag>

                        {/* TESTO */}
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
                        />
                      </div>
                    </div>
                    {/* PARAGRAFO */}

                    {/* PULSANTE INSERIMENTO */}
                    <Frag if={isEditMode} className="mt-5 pt-5 border-t border-blue-400/50">
                      <div className="-translate-y-1">
                        <button
                          onClick={() => paragraphFeat.handleCreate(paragraph_i)}
                          className="mx-auto block px-1 border rounded-full bg-blue-500/30 text-blue-300"
                          aria-label="Aggiungi paragrafo"
                        >
                          <i className="bi bi-plus-lg"></i>
                        </button>
                      </div>
                    </Frag>

                  </div>
                )
              )}
            </Frag>
            {/* WRAPPER PARAGRAFI */}
          </>
        )}
      </section>
    </main>
  );
}