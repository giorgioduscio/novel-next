import React, { useMemo } from "react"
import { useBookContext } from "../data/BookContext"
import { useCommonPagesContext } from "../data/CommonPagesContext"
import { useAuthContext } from "../data/AuthContext"

export function LoadingComponent() {
  const {isBookLoaded} = useBookContext()
  const {isPageLoaded} = useCommonPagesContext()
  const {isAuthLoaded} = useAuthContext()

  const loadings =useMemo<[string, boolean][]>(()=>[
    ["Caricamento pagina", isPageLoaded.get],
    ["Caricamento dati",   isBookLoaded.get],
    ["Verifica permessi",  isAuthLoaded.get],
  ], [isPageLoaded.get, isBookLoaded.get, isAuthLoaded.get])

  return <>
    <main className="mx-auto container w-fit py-8 text-center text-gray-400">
      <div className="grid grid-cols-[auto_1fr] gap-2 justify-items-start">

      {loadings.map(([label, value])=>
        <React.Fragment key={label}>
          {!value && <>
            <i className="bi bi-hourglass-split animate-spin"></i>
            <span>{label}...</span>
          </>}
        </React.Fragment>
      )}

      </div>
    </main>
  </>
}
