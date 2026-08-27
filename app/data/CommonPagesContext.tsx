"use client";

import { useState, useEffect, useMemo } from "react";
import { generateContext } from "../tools/generateContext";

export const {
  provider: CommonPagesProvider,
  context: useCommonPagesContext,
} = generateContext(useCommonPagesContextLogic);

function useCommonPagesContextLogic() {
  // Stato di caricamento della pagina
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  // Larghezza e altezza schermo
  const [screenWidth, setScreenWidth] = useState(400);
  const [screenHeight, setScreenHeight] = useState(400);
  
  // Modalità editing o view - letta da localStorage
  const [isEditMode, setIsEditMode] = useState(false);
  function toggleEditMode() {
    setIsEditMode((prev) => {
      const newEditMode = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("isEditMode", newEditMode ? "true" : "false");
      }
      return newEditMode;
    });
  }

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Leggi lo stato iniziale da localStorage
    const storedEditMode = localStorage.getItem("isEditMode") === "true";
    setIsEditMode(storedEditMode);
    setIsPageLoaded(true);

    // Dimensioni schermo
    const setWidth = () => setScreenWidth(window.innerWidth);
    const setHeight = () =>
      setScreenHeight(Math.floor(window.visualViewport?.height || window.innerHeight));

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
