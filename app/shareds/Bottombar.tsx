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
  ,[book]) 

  
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
    <Frag if={pathname!=="/auth"} className="sticky bottom-0 z-30 shadow-lg outline bg-indigo-900">
      <div className="mx-auto max-w-[400px] text-white text-2xl">
        <div className="py-1 px-3 flex gap-2 justify-between items-center">

          {/* codici */}
          <div>
            <Link href="/auth" className="py-1 px-2 bg-indigo-900 rounded-full">
              <i className="bi bi-person-vcard-fill"></i>
            </Link>
          </div>            

          {/* visualizzazione nel libro */}
          <Frag if={pathname.includes("structure") && canRead && canWrite}>
            <Link href={`/books/${book?.id || ''}/settings`} 
                  className="py-1 px-2 bg-indigo-900 rounded-full"> 
              <i className="bi bi-gear-fill"></i> 
            </Link>
          </Frag>

          {/* impostazioni del libro */}
          <Frag if={pathname.includes("settings")}>
            <Link href={`/books/${book?.id || ''}/structure`} 
                  className="py-1 px-2 bg-indigo-900 rounded-full"> 
              <i className="bi bi-bar-chart-steps"></i> 
            </Link>
          </Frag>

          {/* editmode */}
          <Frag if={(showEditmode)}>
            <button onClick={page.toggleEditMode}
                    title={page.isEditMode ? "Modalità editing" : "Modalità lettura"}
                    className={`py-1 px-2 rounded-full ${page.isEditMode ? "bg-orange-700" : ""}`}>
              <i className={`bi ${page.isEditMode ? "bi-pencil" : "bi-eye"}`}></i>
            </button>
          </Frag>

        </div>
      </div>
    </Frag>
  </>)
}