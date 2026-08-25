"use client";

import React, { useState, useEffect, useMemo, createContext, useContext } from "react";

export interface CommonPagesContextType {
  isEditMode: boolean;
  toggleEditMode: () => void;
  setIsEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  isPageLoaded: boolean;
  screenWidth: number;
  screenHeight: number;
}

export const CommonPagesContext = createContext<CommonPagesContextType | null>(null);

export const CommonPagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Modalità editing o view - letta da localStorage
  const [isEditMode, setIsEditMode] = useState(false);
  // Stato di caricamento della pagina
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  // Larghezza e altezza schermo
  const [screenWidth, setScreenWidth] = useState(400);
  const [screenHeight, setScreenHeight] = useState(400);

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

  const value = useMemo(
    () => ({
      isEditMode,
      toggleEditMode,
      setIsEditMode,
      isPageLoaded,
      screenWidth,
      screenHeight,
    }),
    [isEditMode, isPageLoaded, screenWidth, screenHeight]
  );

  return (
    <CommonPagesContext.Provider value={value}>
      {children}
    </CommonPagesContext.Provider>
  );
};

export const useCommonPagesContext = (): CommonPagesContextType => {
  const context = useContext(CommonPagesContext);
  if (!context) {
    throw new Error("useCommonPagesContext must be used within CommonPagesProvider");
  }
  return context;
};
