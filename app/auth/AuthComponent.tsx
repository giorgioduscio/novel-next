"use client"

import { Breadcrumb } from "../shareds/Breadcrumb"
import Navigation from "../shareds/Navigation"
import Field from "../shareds/Field"
import Frag from "../shareds/Frag"
import useAuthComponent from "./useAuthComponent"
import { useAuthContext } from "../data/AuthContext"
import Link from "next/link"


export default function AuthComponent() {
  const { FORM, CRUD, errors, checkedTargets } = useAuthComponent()
  const { permissions } = useAuthContext()

  return <>
    <Frag if={checkedTargets.get().length === 0}>
      <Navigation page_title="Permessi" back_btn={{ href:'/' }}>
        <Link href={"/books"} className="py-1 px-2 bg-orange-700 rounded">Catalogo</Link>
      </Navigation>
    </Frag>

    {/* AZIONI MULTIPLE */}
    <Frag if={checkedTargets.get().length > 0}>
      <div className="sticky top-0 z-1 bg-red-900">
        <div className="mx-auto max-w-[800px] flex items-center">

          <button onClick={() => checkedTargets.set([])} className="p-2 bg-red-900 truncate">
            <i className="bi bi-x-lg"></i>
            <span className="hidden">Deseleziona</span>
          </button>

          <strong className="py-2 px-3 flex-1 text-white">{checkedTargets.get().length}</strong>

          <button onClick={CRUD.handleDeleteMany} className="p-2 px-3 bg-red-900 text-red-300 truncate relative">
            <i className="bi bi-trash3-fill absolute top-1 left-2"></i>
            <i className="bi bi-trash3"></i>
            <i className="bi bi-trash3 absolute bottom-1 right-2"></i>
            <span className="hidden">Elimina selezionati</span>
          </button>

        </div>
      </div>
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
            {FORM.isVisible.get()
              ? <><i className="bi bi-x-lg"></i> Chiudi</>
              : <><i className="bi bi-plus-lg"></i> Aggiungi</>
            }
          </button>
        </div>


        {/* NUOVO PERMESSO */}
        <Frag if={FORM.isVisible.get()} className="mx-auto max-w-max">
          <div className="outline outline-indigo-600 rounded">
            <div className="p-2 bg-indigo-600 flex gap-2">
              <h3>Aggiungi codice</h3>
            </div>
            <form onSubmit={FORM.handleSubmit} className="p-2 grid sm:grid-cols-2 gap-2 items-center bg-indigo-200">
              {FORM.state.get().map((item) => (
                <div key={item.key} className="flex-auto bg-white text-black outline rounded">
                  <Field 
                    type="text" 
                    label_class="pt-1 px-3 text-xs font-bold italic"
                    input_class="pb-2 px-3"
                    id={item.key}
                    label={item.label}
                    placeholder={item.placeholder} 
                    value={item.value} 
                    onChange={(e) => FORM.state.set(prev => prev.map(i => i.key === item.key ? { ...i, value: e.target.value } : i))} 
                    error_message={errors['form>'+item.key] || ""}
                  />
                </div>
              ))}

              <div className="w-full">
                <button className="py-1 px-2 bg-orange-600 rounded" 
                        type="submit"
                        disabled={Object.keys(errors).length>0}
                        >Aggiungi</button>
              </div>
            </form>
          </div>
        </Frag>


        {/* LISTA PERMESSI */}
        <h3 className="mt-5 mb-3">Lista codici</h3>

        <ol className="flex gap-2 flex-wrap">
          <Frag if={!permissions.get.length} className="p-3 w-full bg-sky-700 rounded flex gap-2">
            <i className="bi bi-info-circle"></i>
            <span>Nessun permesso trovato</span>
          </Frag>

          {permissions.get.map((permession, i)=>
            <li key={i + permession.title} className={`flex-1 min-w-[200px] p-1 rounded ${checkedTargets.get().includes(i) ? 'bg-red-200 outline' : 'bg-indigo-200'}`}>
              <div className="grid grid-cols-[auto_1fr] gap-1">
                <div className="flex flex-col justify-between">
                  <input
                    type="checkbox"
                    checked={checkedTargets.get().includes(i)}
                    onChange={() => CRUD.toggleTarget(i)}
                    className="block my-2 scale-150"
                  />

                  <button onClick={() => CRUD.handleDelete(i)} className="px-1 text-red-700 outline rounded">
                    <i className="bi bi-trash"></i>
                  </button>
                </div>

                <div className="bg-white text-black outline rounded">
                  <Field
                    input_class="pt-1 px-2  italic font-bold text-sm"
                    id={permession.title}
                    hide_label label={permession.title}
                    type="text"
                    placeholder={permession.title}
                    value={permession.title}
                    onChange={(e) => CRUD.handleUpdate(i, 'title', e.target.value)}
                    error_message={errors[`${i}>title`]}
                  />
                  <div className="relative">
                    <Field
                      input_class="pb-2 px-3"
                      id={permession.auth_code}
                      hide_label label={permession.auth_code}
                      type="copy"
                      placeholder={permession.auth_code}
                      value={permession.auth_code}
                      onChange={(e) => CRUD.handleUpdate(i, 'auth_code', e.target.value)}
                      error_message={errors[`${i}>auth_code`]}
                    />
                  </div>
                </div>

              </div>
            </li>
          )}
        </ol>
      </section>
    </main>
  </>
}