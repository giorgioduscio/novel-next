"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const EditModeContext = createContext<{
  isEditMode: boolean;
  toggleEditMode: () => void;
  setIsEditMode: (value: boolean) => void;
  isPageLoaded: boolean;
  screenWidth: number;
} | undefined>(undefined);

export function EditModeProvider({ children }: { children: ReactNode }) {
  // imposta modalità editing o view
  const [isEditMode, setIsEditMode] = useState(false);
  function toggleEditMode() {
    const newEditMode = !isEditMode;
    setIsEditMode(newEditMode);

    // aggiorna l'URL senza ricaricare la pagina
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

  // stato di caricamento della pagina
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  // larghezza schermo
  const [screenWidth, setScreenWidth] = useState(400);


  useEffect(() => {
    if (typeof window == 'undefined') return;

    // leggi lo stato iniziale dall'URL
    const hasEditQuery = window.location.search.includes('edit');
    setIsEditMode(hasEditQuery);
    setIsPageLoaded(true);
    
    // larghezza schermo
    const setWidth =()=> setScreenWidth(window.innerWidth);
    setWidth();
    window.addEventListener('resize', setWidth);
    return () => { window.removeEventListener('resize', setWidth) };
    
  }, []);


  return (
    <EditModeContext.Provider value={{ isEditMode, toggleEditMode, setIsEditMode, isPageLoaded, screenWidth }}>
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
