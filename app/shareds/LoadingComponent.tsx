import React, { useMemo } from "react"
import { useBookContext } from "../data/BookContext"
import { useCommonPagesContext } from "../data/CommonPagesContext"
import { useAuthContext } from "../data/AuthContext"
import { La_Belle_Aurore } from "next/font/google"

interface LoadingComponentProps {
  label?: string;
}

export function LoadingComponent({ label }: LoadingComponentProps) {
  const {isBookLoaded} = useBookContext()
  const {isPageLoaded} = useCommonPagesContext()
  const {isAuthLoaded} = useAuthContext()

  const loadings =useMemo<[string, boolean][]>(()=>[
    ["Caricamento pagina", isPageLoaded],
    ["Caricamento dati",   isBookLoaded],
    ["Verifica permessi",  isAuthLoaded.get],
  ], [isPageLoaded, isBookLoaded, isAuthLoaded.get])

  return <>
    <main className="mx-auto container w-fit py-8 text-center text-gray-400">
      <div className="grid grid-cols-[auto_1fr] gap-2">

      {label && <>
        <i className="bi bi-hourglass-split"></i>
        <span>{label}</span>
      </>}

      {!label && loadings.map(([label, value])=>
        <React.Fragment key={label}>
          {!value && <>
            <i className="bi bi-hourglass-split"></i>
            <span>{label}...</span>
          </>}
        </React.Fragment>
      )}

      </div>
    </main>
  </>
}
