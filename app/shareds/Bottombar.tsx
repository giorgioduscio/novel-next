"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

interface BottombarProps {
  page?: {
    isEditMode: boolean;
    toggleEditMode: () => void;
  }
}

export default function Bottombar({ page }: BottombarProps) {
  const pathname = usePathname();

  const isVisible = useMemo(()=>{
    return pathname !== "/auth";
  }, [pathname])

  if(!isVisible) return null
  return (
    <div className="mx-auto container max-w-[800px]">
      <div className="ms-3 mb-3 fixed bottom-0 z-30 flex gap-2 items-center">
        <Link href="/auth" className="py-1 px-2 bg-orange-400 rounded-full">
          <i className="bi bi-person-vcard-fill text-2xl"></i>
        </Link>

        {page && (
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