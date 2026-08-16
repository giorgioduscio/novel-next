"use client";

import { useState, useEffect } from "react";

export default function useCommonPagesHook() {
  // Modalità editing o view
  const [isEditMode, setIsEditMode] = useState(false);

  function toggleEditMode() {
    const newEditMode = !isEditMode;
    setIsEditMode(newEditMode);

    // Aggiorna l'URL senza ricaricare la pagina
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (newEditMode) {
        url.searchParams.set("edit", "true");
      } else {
        url.searchParams.delete("edit");
      }
      window.history.pushState({}, "", url.toString());
    }
  }

  // Stato di caricamento della pagina
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  // Larghezza schermo
  const [screenWidth, setScreenWidth] = useState(400);
  const [screenHeight, setScreenHeight] = useState(400);

  useEffect(() => {
    if (typeof window == "undefined") return;

    // Leggi lo stato iniziale dall'URL
    const hasEditQuery = window.location.search.includes("edit");
    setIsEditMode(hasEditQuery);
    setIsPageLoaded(true);

    // Larghezza schermo
    const setWidth = () => setScreenWidth(window.innerWidth);
    const setHeight = () => setScreenHeight(Math.floor(window.visualViewport?.height || window.innerHeight));
    setWidth();
    setHeight();
    window.addEventListener("resize", setWidth);
    window.addEventListener("resize", setHeight);
    return () => {
      window.removeEventListener("resize", setWidth);
      window.removeEventListener("resize", setHeight);
    };
  }, []);

  return {
    isEditMode,
    toggleEditMode,
    setIsEditMode,
    isPageLoaded,
    screenWidth,
    screenHeight,
  };
}