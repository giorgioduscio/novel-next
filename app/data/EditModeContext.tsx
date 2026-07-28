"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface EditModeContextType {
  editMode: boolean;
  toggleEditMode: () => void;
  setEditMode: (value: boolean) => void;
}

const EditModeContext = createContext<EditModeContextType | undefined>(undefined);

export function EditModeProvider({ children }: { children: ReactNode }) {
  const [editMode, setEditMode] = useState(false);

  // Leggi lo stato iniziale dall'URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasEditQuery = window.location.search.includes('edit');
      setEditMode(hasEditQuery);
    }
  }, []);

  const toggleEditMode = () => {
    const newEditMode = !editMode;
    setEditMode(newEditMode);

    // Aggiorna l'URL senza ricaricare la pagina
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (newEditMode) {
        url.searchParams.set('edit', 'true');
      } else {
        url.searchParams.delete('edit');
      }
      window.history.pushState({}, '', url.toString());
    }
  };

  return (
    <EditModeContext.Provider value={{ editMode, toggleEditMode, setEditMode }}>
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  const context = useContext(EditModeContext);
  if (context === undefined) {
    throw new Error('useEditMode must be used within an EditModeProvider');
  }
  return context;
}
