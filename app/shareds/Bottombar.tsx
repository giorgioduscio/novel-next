"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useCommonPagesContext } from "../data/CommonPagesContext";
import { useAuthContext } from "../data/AuthContext";
import { useBookContext } from "../data/BookContext";

export default function Bottombar() {
  const pathname = usePathname();
  const page = useCommonPagesContext();
  const authContext = useAuthContext();
  const bookContext = useBookContext();
  
  const isVisible = useMemo(()=>{
    return pathname !== "/auth";
  }, [pathname])
  
  const book = bookContext.target
  const showEditmode = useMemo(()=>{
    if(pathname==="/books") return true
    if(pathname.includes("settings")) return false
    return authContext.CONTROLS.canWrite(book)
  }, [authContext, book])

  if(!isVisible) return null
  return (
    <div className="mx-auto container max-w-[800px]">
      <div className="ms-3 mb-3 fixed bottom-0 z-30 flex gap-2 items-center">
        <Link href="/auth" className="py-1 px-2 bg-orange-400 rounded-full">
          <i className="bi bi-person-vcard-fill text-2xl"></i>
        </Link>

        {(page && showEditmode) && (
          <button
            onClick={page.toggleEditMode}
            title={page.isEditMode ? "Modalità editing" : "Modalità lettura"}
            className={`py-1 px-2 rounded-full shadow-lg border-2  ${page.isEditMode ? "bg-indigo-400 border-gray-600" : "bg-orange-400 border-gray-600"}`}
          >
            <i className={`text-xl bi ${page.isEditMode ? "bi-pencil" : "bi-eye"}`}></i>
          </button>
        )}
      </div>
    </div>
  )
}