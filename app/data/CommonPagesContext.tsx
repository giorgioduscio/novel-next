"use client";

import { useEffect } from "react";
import { generateContext, useDotNotation } from "../tools/reactCustomization";
import { ui_addCopyFeedback } from "../tools/feedbacksUI";

export const {
  provider: CommonPagesProvider,
  context: useCommonPagesContext,
} = generateContext(useCommonPagesContextLogic);

function useCommonPagesContextLogic() {
  class Common {
    constructor() {
      this.toggleEditMode = this.toggleEditMode.bind(this);
      this.addCopyFeedback = this.addCopyFeedback.bind(this);
      
      useEffect(() => {
        if (typeof window === "undefined") return;
        // feedback per pulsanti copia
        document.addEventListener("click",(e)=> this.addCopyFeedback(e))
    
        // Leggi lo stato iniziale da localStorage
        const storedEditMode = localStorage.getItem("isEditMode") === "true";
        this.isEditMode.set(storedEditMode);
        this.isPageLoaded.set(true);
    
        // Dimensioni schermo
        const setWidth = () => this.screenWidth.set(window.innerWidth);
        const setHeight = () =>
          this.screenHeight.set(Math.floor(window.visualViewport?.height || window.innerHeight));
    
        setWidth();
        setHeight();
        window.addEventListener("resize", setWidth);
        window.addEventListener("resize", setHeight);
        return () => {
          window.removeEventListener("resize", setWidth);
          window.removeEventListener("resize", setHeight);
        };
      }, []);
    }

    // Stato di caricamento della pagina
    isPageLoaded = useDotNotation(false);
    // Larghezza e altezza schermo
    screenWidth = useDotNotation(400);
    screenHeight = useDotNotation(400);
    
    // Modalità editing o view - letta da localStorage
    isEditMode = useDotNotation(false);
    
    toggleEditMode() {
      this.isEditMode.set((prev) => {
        const newEditMode = !prev;
        if (typeof window !== "undefined") {
          localStorage.setItem("isEditMode", newEditMode ? "true" : "false");
        }
        return newEditMode;
      });
    }

    // aggiunge un feedback a tutti i pulsanti di copia
    addCopyFeedback(e: Event){
      return ui_addCopyFeedback(e)
    }
  }

  return new Common()
}

export function EditModeToggleButton() {
  const page = useCommonPagesContext();
  const iem = page.isEditMode.get
  return <>
    <button onClick={page.toggleEditMode} 
            className={`circle ${page.isEditMode.get ?"bg-orange-500":"bg-gray-700"}`}
            title={iem ?"Abilita lettura" :"Abilita editing"}>
      {page.isEditMode.get
        ?<i className="bi bi-pen"></i>
        :<i className="bi bi-eye-fill"></i>
      }
    </button>
  </>
}