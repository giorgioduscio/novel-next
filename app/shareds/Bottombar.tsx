"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useCommonPagesContext } from "../data/CommonPagesContext";
import { useAuthContext } from "../data/AuthContext";
import { useBookContext } from "../data/BookContext";
import Frag from "./Frag";

export default function Bottombar() {
  const pathname = usePathname();
  const page = useCommonPagesContext();
  const authContext = useAuthContext();
  const bookContext = useBookContext();
  const book = bookContext.target

  // autorizzazioni
  const canRead = useMemo(()=>
    authContext.CONTROLS.canRead(book)
  ,[book]) 
  const canWrite = useMemo(()=>
    authContext.CONTROLS.canWrite(book)
  ,[pathname, authContext, book]) 

  
  const showEditmode = useMemo(()=>{
    // nascondi in queste pagine
    if(["/setting","/auth"].some(p=> pathname.includes(p))
      || pathname==="/"
    ) return false
    // mostra sempre nel catalogo
    if(pathname==="/books") return true
    // altrimenti mosta in base ai permessi
    return authContext.CONTROLS.canWrite(book)
  }, [pathname, authContext, book])

  return (<>
    <Frag if={pathname!=="/auth"} className="sticky bottom-0 z-30 w-fit print:hidden">
      <div className="relative">
        <div className="absolute bottom-0 left-0 text-white text-2xl">
          {/* codici */}
          <div>
            <Link href="/auth" className="ml-2 mb-2 py-1 px-2 bg-indigo-900 rounded-full"
                  title="Mostra codici">
              <i className="bi bi-person-vcard-fill"></i>
            </Link>
          </div>


          <div className="p-1 flex gap-1 justify-between items-center">
            {/* editmode */}
            <Frag if={(showEditmode)}>
              <button onClick={page.toggleEditMode}
                      title={page.isEditMode.get ? "Modalità editing" : "Modalità lettura"}
                      className={`py-2 px-3 rounded-full ${page.isEditMode.get ? "bg-orange-700" : "bg-indigo-900"}`}>
                <i className={`bi ${page.isEditMode.get  ?"bi-eye" :"bi-pencil"}`}></i>
              </button>
            </Frag>

            {/* impostazioni del libro */}
            <Frag if={pathname.includes("structure") && canWrite}>
              <Link href={`/books/${book?.id || ''}/settings`}
                    className="m-1 py-1 px-2 bg-indigo-900 rounded-full"
                    title="Vai alle impostazioni">
                <i className="bi bi-gear-fill"></i>
              </Link>
            </Frag>

            {/* visualizzazione nel libro */}
            <Frag if={pathname.includes("settings")}>
              <Link href={`/books/${book?.id || ''}/structure`}
                    className="m-1 py-1 px-2 bg-indigo-900 rounded-full"
                    title="Vai al libro">
                <i className="bi bi-bar-chart-steps"></i>
              </Link>
            </Frag>

          </div>
        </div>
      </div>
    </Frag>
  </>)
}