"use client"

import { Breadcrumb } from "../shareds/Breadcrumb"
import Navigation from "../shareds/Navigation"
import Field from "../shareds/Field"
import Frag from "../shareds/Frag"
import useAuthComponent from "./useAuthComponent"
import { useAuthContext } from "../data/AuthContext"
import Link from "next/link"
import { ui_copy } from "../tools/feedbacksUI"
import ManySelect from "../shareds/ManySelect"
import Bottombar from "../shareds/Bottombar"


export default function AuthComponent() {
  const { FORM, CRUD, errors, checkedTargets } = useAuthComponent();
  const { codes } = useAuthContext();

  const hasFormErrors = Object.keys(errors).some((key) => key.startsWith("form>"));

  return <>
    <Frag if={checkedTargets.get.length === 0}>
      <Navigation page_title="Permessi"/>
    </Frag>

    {/* AZIONI MULTIPLE */}
    <Frag if={checkedTargets.get.length > 0}>
      <ManySelect 
        targets={checkedTargets}
        allItems={codes.get.map((p) => p.id)}
        onDeleteMany={() => CRUD.handleDeleteMany()}
      />
    </Frag>

    <Breadcrumb routes={["Codici"]} />


    <main className="mx-auto container max-w-[800px]">
      <section className="p-3 min-h-dvh">
        {/* header */}
        <div className="mx-auto max-w-[400px]">
          <p className="py-2 px-3 bg-sky-200 text-black text-sm italic outline rounded">
            <i className="me-1 bi bi-info-circle"></i> 
            Questi codici vengono memorizzati sul browser. Potrai visualizzare o modificare tutti i contenuti associati a questi codici.
          </p>
        </div>

        <div className="flex justify-between items-center">
          <h2 className="my-3 text-2xl font-bold">Permessi</h2>
          <button onClick={() => FORM.isVisible.set(prev=> !prev)} className="py-1 px-2 bg-indigo-600 text-white rounded">
            {FORM.isVisible.get
              ? <><i className="bi bi-x-lg"></i> Chiudi</>
              : <><i className="bi bi-plus-lg"></i> Aggiungi</>
            }
          </button>
        </div>


        {/* NUOVO PERMESSO */}
        <Frag if={FORM.isVisible.get} className="mx-auto max-w-max">
          <div className="outline outline-indigo-600 rounded">
            <div className="p-2 bg-indigo-600 flex gap-2">
              <h3>Aggiungi codice</h3>
            </div>
            <form onSubmit={FORM.handleSubmit} className="p-2 grid sm:grid-cols-2 gap-2 items-center bg-indigo-200">
              {FORM.state.get.map((item) => (
                <div key={item.key} className="relative">
                  <div className="flex-auto bg-white text-black outline rounded">
                    <Field 
                      type={item.key ==="auth_code" ?"password" :"text"} 
                      label_class="pt-1 px-3 text-xs font-bold italic"
                      input_class="pb-2 px-3"
                      id={`form-${item.key}`}
                      label={item.label}
                      placeholder={item.placeholder} 
                      value={item.value} 
                      onChange={(e) => FORM.state.set(prev => prev.map(i => i.key === item.key ? { ...i, value: e.target.value } : i))} 
                      onInput={(e) => FORM.state.set(prev => prev.map(i => i.key === item.key ? { ...i, value: e.target.value } : i))} 
                      error_message={errors['form>'+item.key] || ""}
                    />
                  </div>
                </div>
              ))}

              <div className="w-full">
                <button className="py-1 px-2 bg-orange-600 rounded disabled:opacity-50" 
                        type="submit"
                        disabled={hasFormErrors}
                        >Aggiungi</button>
              </div>
            </form>
          </div>
        </Frag>


        {/* LISTA PERMESSI */}
        <h3 className="mt-5 mb-3">Lista codici</h3>

        <ol className="flex gap-2 flex-wrap">
          <Frag if={!codes.get.length} className="p-3 w-full bg-sky-700 rounded flex gap-2">
            <i className="bi bi-info-circle"></i>
            <span>Nessun permesso trovato</span>
          </Frag>

          {codes.get.map((code)=>
            <li key={code.id} className={`flex-1 min-w-[200px] max-w-[400px] p-1 rounded ${checkedTargets.get.includes(code.id) ? 'bg-indigo-800' : ''}`}>
              <div className="grid grid-cols-[auto_1fr_auto] gap-1">
                <div className="flex flex-col justify-between">
                  <input
                    type="checkbox"
                    checked={checkedTargets.get.includes(code.id)}
                    onChange={() => CRUD.toggleTarget(code.id)}
                    className="block my-2 scale-150"
                  />

                  <button onClick={() => CRUD.handleDelete(code.id)} 
                          className="px-1 text-red-400 outline rounded"
                          title="Rimuovi codice">
                    <i className="bi bi-trash"></i>
                  </button>
                </div>

                <div className="bg-white text-black outline rounded">
                  <div>
                    <Field
                      input_class="pt-1 px-2 italic font-bold text-sm"
                      id={`${code.id}-title`}
                      hide_label label={code.title || "Titolo"}
                      type="text"
                      placeholder="Titolo"
                      value={code.title}
                      onChange={(e) => CRUD.handleUpdate(code.id, 'title', e.target.value)}
                      error_message={errors[`${code.id}>title`]}
                    />
                  </div>
                  <div className="relative">
                    <Field
                      input_class="pb-2 px-3"
                      id={`${code.id}-auth_code`}
                      hide_label label={code.auth_code || "Codice"}
                      type="password"
                      placeholder="Codice"
                      value={code.auth_code}
                      onChange={(e) => CRUD.handleUpdate(code.id, 'auth_code', e.target.value)}
                      error_message={errors[`${code.id}>auth_code`]}
                    />
                  </div>
                </div>

                <div className="text-black">
                  <button onClick={()=> ui_copy(code.auth_code)} 
                          className="px-1 bg-gray-200 outline rounded"
                          title="Copia codice" data-feedback>
                    <i className="bi bi-copy"></i>
                  </button>
                </div>
              </div>
            </li>
          )}
        </ol>
      </section>
    </main>

    <Bottombar>
      <Link href={"/books"} className="circle bg-orange-700">
        <i className="bi bi-book-fill"></i>
      </Link>
    </Bottombar>
  </>
}