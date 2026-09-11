"use client";

import { Breadcrumb } from "@/app/shareds/Breadcrumb";
import Frag from "@/app/shareds/Frag";
import { LoadingComponent } from "@/app/shareds/LoadingComponent";
import React, { useMemo } from "react";
import { Book } from "@/app/schemas/book_schema";
import { useBookComponent } from "../useBookComponent";
import Field from "@/app/shareds/Field";
import { useAuthContext } from "@/app/data/AuthContext";
import { useCommonPagesContext } from "@/app/data/CommonPagesContext";
import handleArrowKeyFocus from "@/app/tools/handleArrowKeyFocus";
import SettingsCodesFormComponent from "./SettingsCodesFormComponent";
import { useBookContext } from "@/app/data/BookContext";
import { useRouter } from "next/navigation";
import { useAgreeWrapper } from "@/app/shareds/Agree";
import Navigation from "@/app/shareds/Navigation";
import UnathorizeComponent from "@/app/shareds/UnathorizeComponent";
import { generateSecureKey } from "@/app/data/BookContext";
import { toast } from "@/app/tools/feedbacksUI";
import { useDotNotation } from "@/app/tools/reactCustomization";

export const settings_component_label_class="px-3 text-black text-sm font-bold italic"
export const settings_component_input_class="pb-2 px-3 text-black w-full"
const input_group = "my-3 shadow-lg rounded overflow-hidden outline"

interface UseBookComponentProps { id: string }
export default function SettingsComponent(props: UseBookComponentProps) {
  const { book, errors, handleUpdateBook } = useBookComponent(props);
  const bookContext = useBookContext()
  const authContext = useAuthContext();
  const page = useCommonPagesContext();
  const route = useRouter();
  const agree = useAgreeWrapper();  

  const canRead = useMemo(() => !!book && !!authContext.CONTROLS.canRead(book), [book, authContext]);
  const canWrite = useMemo(() => !!book && !!authContext.CONTROLS.canWrite(book), [book, authContext]);

  type fieldType = {
    key: keyof Book;
    label: string;
    value: any;
    placeholder: string;
    asterisk?: boolean;
    preLabel?: string;
    type?: string;
    className?: string;
  };

  const generalFields = useMemo((): fieldType[] => {
    if (!book) return [];
    return [
      {
        preLabel: "Generali",
        key: "title",
        value: book.title,
        label: "Titolo",
        placeholder: "Inserire il titolo del libro",
        asterisk: true,
      },
      {
        key: "author_name",
        value: book.author_name,
        label: "Autore",
        placeholder: "Inserire il nome dell'autore",
        asterisk: true,
      },
      {
        key: "description",
        value: book.description,
        label: "Descrizione",
        placeholder: "Descrivi brevemente di cosa parla il libro",
        asterisk: true,
        type:"textarea",
        className: "w-full",
      },
    ];
  }, [book]);

  // eliminazione
  const verifyDeleteBook = useDotNotation("")
  async function handleDelete() {    
    if(!book) return console.error("Libro non disponibile");
    
    // Verifica il codice prima di rimuoverlo
    if(book.auth_write!==""){
      const isCorrect = await authContext.CONTROLS.verify(verifyDeleteBook.get, book.auth_write);
      if(!isCorrect) {
        toast.danger("Credenziali errate");
        return;
      }
    }
    
    if(!(await agree.danger(`Rimuovere l'intero libro '${book?.author_name}'?`, "Rimuovi"))) return;
    const res = bookContext.deleteBook(book.id)

    if(!res) return console.error("Eliminazione fallita");
    route.push("/books")
    verifyDeleteBook.set("");
  }

  // CONDIVISIONE
  const verifyReadCode = useDotNotation("");
  async function handleSetReadPublic() {
    if(!book) return console.error("Libro non disponibile");
    if(book.auth_read === "") return console.error("Il libro è già pubblico");
    
    // Verifica il codice prima di rimuoverlo
    const isCorrect = await authContext.CONTROLS.verify(verifyReadCode.get, book.auth_read);
    if(!isCorrect) {
      toast.danger("Credenziali errate");
      return;
    }
    
    if(!(await agree.warning("Rendere pubblico il libro?", "Pubblico"))) return;
    handleUpdateBook("auth_read", "");
    toast.success("Libro reso pubblico");
    verifyReadCode.set("")
  }

  async function handleSetReadPrivate() {
    if(!book) return console.error("Libro non disponibile");
    if(book.auth_read !== "") return console.error("Esiste già un codice di lettura");
    if(!(await agree.warning("Rendere privato il libro? Il sistema genererà automaticamente un codice e lo salverà sul browser", "Privato"))) return;
    const newKey = generateSecureKey();
    
    // Hasha il codice con Argon2 prima di salvarlo nel database
    await authContext.CONTROLS.updateCode("auth_read", book, newKey);
    
    // Salva il nuovo codice in chiaro nei codici locali usando il nuovo metodo
    authContext.createOrUpdateBookCode(book, newKey, 'read');
    
    toast.success("Libro reso privato");
  }

  const verifyWriteCode = useDotNotation("");
  async function handleSetWritePublic() {
    if(!book) return console.error("Libro non disponibile");
    if(book.auth_write === "") return console.error("Visualizzazione è già pubblica");
    
    // Verifica il codice prima di rimuoverlo
    const isCorrect = await authContext.CONTROLS.verify(verifyWriteCode.get, book.auth_write);
    if(!isCorrect) {
      toast.danger("Credenziali errate");
      return;
    }
    
    if(!(await agree.warning("Rendere pubblica la scrittura?", "Pubblico"))) return;
    handleUpdateBook("auth_write", "");
    toast.success("Scrittura resa pubblica");
    verifyWriteCode.set("")
  }

  async function handleSetWritePrivate() {
    if(!book) return console.error("Libro non disponibile");
    if(book.auth_write !== "") return console.error("Esiste già un codice di scrittura");
    if(!(await agree.warning("Rendere privata la scrittura? Il sistema genererà automaticamente un codice e lo salverà sul browser", "Privato"))) return;
    const newKey = generateSecureKey();
    
    // Hasha il codice con Argon2 prima di salvarlo nel database
    await authContext.CONTROLS.updateCode("auth_write", book, newKey);
    
    // Salva il nuovo codice in chiaro nei codici locali usando il nuovo metodo
    authContext.createOrUpdateBookCode(book, newKey, 'write');
    
    toast.success("Scrittura resa privata");
  }

  async function handleCopyLink() {
    if(!book) return console.error("Libro non disponibile");
    const link = `${window.location.origin}/books/${book.id}/structure`;
    toast.success("Link copiato");
    await navigator.clipboard.writeText(link);
  }

  // feedback caricamento
  if (!page.isPageLoaded.get || !bookContext.isBookLoaded.get || !authContext.isAuthLoaded.get) 
    return <LoadingComponent />;

  if (!canRead || !canWrite) return <UnathorizeComponent />

  return (
    <>
      <Navigation page_title={book?.title ||""} back_btn={{ href:"/books" }} />    

      <Breadcrumb routes={["Catalogo:/books", `${book?.title}:/${book?.id}/structure`, "Impostazioni"]} />

      <main id="StructureComponent" 
            className="mx-auto container max-w-[500px]"
            onKeyDown={handleArrowKeyFocus}>
        <Frag if={!canRead}>
          <div className="p-3 py-8 text-center text-red-500">
            <i className="bi bi-exclamation-triangle text-2xl"></i>
            <span>Libro non trovato</span>
          </div>
        </Frag>

        <Frag if={!!canRead}>
          <section className="px-3 pb-10 min-h-dvh">
            <h2 className="text-xl font-bold my-4">Opzioni</h2>
            
            <ol className="flex flex-wrap gap-2 items-start">
              {generalFields.map((field) => <React.Fragment key={field.key}>
                {field.preLabel && (
                  <li className="w-full pt-3 font-bolder italic">{field.preLabel}</li>
                )}
                <li className={`bg-white outline rounded ${field.className || "flex-1 min-w-[200px]"}`}>
                  <Field
                    id={field.key}
                    label={field.label}
                    label_class={settings_component_label_class}
                    input_class={settings_component_input_class}
                    asterisk={field.asterisk}
                    type={field.type || "text"}
                    placeholder={field.placeholder}
                    value={field.value || ""}
                    error_message={errors[field.key]}
                    onChange={(_e) => handleUpdateBook(field.key, _e.target.value)}
                  />
                </li>
              </React.Fragment>)}
            </ol>



            <h3 className="my-3 text-red-400 text-xl font-bold">
              <i className="bi bi-exclamation-triangle"></i> Danger zone
            </h3>

            {/* lettura */}
            <h4 className="pt-5 pb-2 text-red-400">Codice per la lettura</h4>
            <p className="m-2 p-3 bg-blue-700 outline rounded">
              <i className="bi bi-info-circle"></i> Chiunque abbia questo codice sarà autorizzato a leggere questo libro. Se non impostato alcun codice, il libro sarà leggibile da tutti.
            </p>

            <div className={input_group}>
              <div className="flex flex-wrap">
                {/* publico */}
                <Frag if={book?.auth_read!==""}>
                  <div className="flex-auto relative bg-white">
                    <Field 
                      id="verifyReadCode" 
                      label="Codice attuale" 
                      type="password"
                      placeholder="Inserisci il codice attuale"
                      value={verifyReadCode.get}
                      onChange={(e) => verifyReadCode.set(e.target.value)}
                      label_class={settings_component_label_class}
                      input_class={settings_component_input_class}
                    />
                  </div>

                  <button onClick={handleSetReadPublic}
                          disabled={verifyReadCode.get.length<3}
                          className="flex-auto px-3 py-2 bg-green-600"
                          title="Rendi il libro visibile a chiunque abbia il link">
                    <i className="bi bi-globe"></i>
                    <span className="ml-2">Publica</span>
                  </button>
                </Frag>
                {/* privato */}
                <Frag if={book?.auth_read===""}>
                  <button onClick={handleSetReadPrivate}
                          disabled={book?.auth_read !== ""}
                          className="flex-auto px-3 py-2 bg-orange-600"
                          title="Rendi il libro visibile solo a chi ha il codice">
                    <i className="bi bi-lock"></i>
                    <span className="ml-2">Privato</span>
                  </button>
                </Frag>
                {/* copia */}
                <button onClick={handleCopyLink}
                        className="flex-auto px-3 py-2 bg-blue-600"
                        data-feedback>
                  <i className="bi bi-copy"></i>
                  <span className="ml-2">Copia link</span>
                </button>
              </div>
            </div>

            <SettingsCodesFormComponent labelParam={"Codice lettura"} attributeKey="auth_read" book={book!} />
            

            {/* scrittura */}
            <h4 className="pt-5 pb-2 text-red-400">Codice per la scrittura</h4>
            <p className="m-2 p-3 bg-blue-700 outline rounded">
              <i className="bi bi-info-circle"></i> Chiunque abbia questo codice sarà autorizzato a modificare e rimuovere questo libro. Se non impostato alcun codice, sarà modificabile da chiunque.
            </p>
            <div className={input_group}>
              <div className="flex flex-wrap">
                {/* publica */}
                <Frag if={book?.auth_write!==""}>
                  <div className="flex-auto relative bg-white">
                    <Field 
                      id="verifyWriteCode" 
                      label="Codice attuale" 
                      type="password"
                      placeholder="Inserisci il codice attuale"
                      value={verifyWriteCode.get}
                      onChange={(e) => verifyWriteCode.set(e.target.value)}
                      label_class={settings_component_label_class}
                      input_class={settings_component_input_class}
                    />
                  </div>
                  <button onClick={handleSetWritePublic}
                          disabled={verifyWriteCode.get.length<2}
                          className="flex-auto px-3 py-2 bg-green-600"
                          title="Rendi editabile il libro a chiunque">
                    <i className="bi bi-globe"></i>
                    <span className="ml-2">Publica</span>
                  </button>
                </Frag>
                {/* privata */}
                <Frag if={book?.auth_write===""}>
                  <button onClick={handleSetWritePrivate}
                          disabled={book?.auth_write !== ""}
                          className="flex-auto px-3 py-2 bg-orange-600"
                          title="Rendi la scrittura visibile solo a chi ha il codice">
                    <i className="bi bi-lock"></i>
                    <span className="ml-2">Scrittura autorizzata</span>
                  </button>
                </Frag>
              </div>
            </div>
            
            <SettingsCodesFormComponent labelParam={"Codice scrittura"} attributeKey="auth_write" book={book!} />


            {/* elimina */}
            <div className="p-2 my-5 outline outline-red-400 rounded">
              <div className="text-red-400">Rimuovi questo libro</div>

              <div className={input_group}>
                <div className="flex flex-wrap">
                  <Frag if={book?.auth_write!==""}>
                    <div className="flex-auto relative bg-white">
                      <Field 
                        id="verifyDeleteBook" 
                        label="Codice di scrittura attuale" 
                        type="password"
                        placeholder="Inserisci il codice attuale"
                        value={verifyDeleteBook.get}
                        onChange={(e) => verifyDeleteBook.set(e.target.value)}
                        label_class={settings_component_label_class}
                        input_class={settings_component_input_class}
                      />
                    </div>
                  </Frag>
                  <button onClick={handleDelete} 
                          className="flex-auto px-3 py-2 bg-red-600"
                          disabled={book?.auth_write!=="" && verifyDeleteBook.get.length<2}>
                    <i className="me-2 bi bi-trash-fill"></i>
                    Elimina  
                  </button>
                </div>
              </div>
            </div>

          </section>
        </Frag>
      </main>
    </>
  );
}