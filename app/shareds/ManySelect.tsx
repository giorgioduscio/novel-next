"use client"

import Frag from "./Frag"

interface ManySelectProps<T> {
  targets: {
    get(): T[]
    set(value: T[]): void
  }
  allItems: T[]
  onDeleteMany: () => void | Promise<void>
}

export default function ManySelect<T>({
  targets,
  allItems,
  onDeleteMany
}: ManySelectProps<T>) {
  
  const selectedCount = targets.get().length
  const totalCount = allItems.length
  const allSelected = selectedCount === totalCount && totalCount > 0

  function handleSelectAll() {
    targets.set([...allItems])
  }

  function handleDeselectAll() {
    targets.set([])
  }

  return (
    <>
      {/* AZIONI MULTIPLE */}
      <Frag if={selectedCount > 0}>
        <div className="sticky top-0 z-1 bg-red-900">
          <div className="mx-auto max-w-[800px] flex items-center gap-1">


            {/* ANNULLA */}
            <button 
              onClick={handleDeselectAll} 
              className="p-2 bg-red-900 truncate"
              title="Deseleziona tutti"
            >
              <i className="bi bi-x-lg"></i>
              <span className="hidden sm:inline">Annulla</span>
            </button>

            {/* CONTATORE */}
            <strong className="py-2 px-3 flex-1 text-white">{selectedCount}</strong>

            {/* SELEZIONA TUTTI */}
            <button 
              onClick={handleSelectAll} 
              className="p-2 bg-red-900 text-white truncate"
              title="Seleziona tutti"
            >
              <i className="bi bi-check2-all"></i>
              <span className="ms-1 hidden sm:inline">Seleziona tutti</span>
            </button>

            {/* ELIMINA SELEZIONATI */}
            <button 
              onClick={onDeleteMany} 
              className="p-2 px-3 bg-red-900 text-red-300 relative"
              title="Elimina selezionati"
            >
              <i className="bi bi-trash3-fill absolute top-1 left-2"></i>
              <i className="bi bi-trash3"></i>
              <i className="bi bi-trash3 absolute bottom-1 right-2"></i>
              <span className="hidden">Elimina selezionati</span>
            </button>



          </div>
        </div>
      </Frag>
    </>
  )
}
