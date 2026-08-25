
  /**
   * Sposta il focus all'input/textarea sopra o sotto quello attualmente focalizzato.
   * @param {KeyboardEvent} e - Evento tastiera (keydown).
   */
export default function handleArrowKeyFocus(e: any) {    
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) {
      return; // Non è un input o textarea
    }
  
    // 1) Controlla se il tasto premuto è freccia su o giù
    // freccia a sinistra all'inizio del testo
    const nextCondition = ["ArrowUp","ArrowLeft"].includes(e.key) && target.selectionStart == 0;
    // freccia a destra alla fine del testo
    const prevCondition = ["ArrowDown","ArrowRight"].includes(e.key) && target.selectionStart == target.value.length;
    if (!nextCondition && !prevCondition ) return;
  
    // e.preventDefault(); // Evita il comportamento predefinito (es. scroll)
  
    // 2) cerca il prossimo input valido
    const allInputs = Array.from(
      document.querySelectorAll<HTMLElement>(
        "input:not([type='checkbox']):not([type='radio']):not([disabled]), textarea:not([disabled])"
      )
    );
  
    // 3) Trova l'indice dell'elemento corrente nella lista di tutti gli input/textarea
    const currentIndex = allInputs.findIndex((el) => el === target);
    if (currentIndex === -1) return;
  
    // 4) Calcola l'indice del prossimo elemento (sopra o sotto)
    const nextIndex = ["ArrowUp","ArrowLeft"].includes(e.key)
      ? currentIndex - 1 
      : currentIndex + 1;
  
    // 5) Verifica che l'indice sia valido
    if (nextIndex >= 0 && nextIndex < allInputs.length) {
      const nextElement = allInputs[nextIndex] as HTMLInputElement | HTMLTextAreaElement;
      const {type} = nextElement;

      if(nextElement?.tagName === "INPUT" && (["checkbox","radio"].includes(type))) 
        return console.error("Non funziona con le checkbox o radio button");
       
      setTimeout(() => {
        nextElement.focus();
        nextElement.click();
    
        // 6) sposta il cursore all'inizio o alla fine (come nel tuo esempio)
        if (nextElement instanceof HTMLInputElement || nextElement instanceof HTMLTextAreaElement) {
          // Inizio se freccia in basso o a destra
          if (["ArrowDown","ArrowRight"].includes(e.key)) {
            nextElement.setSelectionRange(0, 0); 
          } else {
            nextElement.setSelectionRange(nextElement.value.length, nextElement.value.length); // Fine
          }
        }
      }, 100);
    }
  }
