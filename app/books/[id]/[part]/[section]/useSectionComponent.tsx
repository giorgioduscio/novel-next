import { useBookContext } from "@/app/data/BookContext";
import { useCommonPagesContext } from "@/app/data/CommonPagesContext";
import { Book, Section, Paragraph, paragraph_schema, section_schema, Part } from "@/app/schemas/book_schema";
import { useAgreeWrapper } from "@/app/shareds/Agree";
import { useDotNotation } from "@/app/tools/reactCustomization";
import { toast } from "@/app/tools/feedbacksUI";
import { useState, useEffect, useMemo, useRef } from "react";
import { safeParse } from "valibot";
import { useKeyboardFeatures } from "./keyboardFeatures";
import { useAuthContext } from "@/app/data/AuthContext";
import useSharedText from "@/app/data/sharedText";

export interface UseSectionComponentProps {
  book_id: string;
  part_id: string;
  section_id: string;
}

export function useSectionComponent({ book_id, part_id, section_id }: UseSectionComponentProps) {
  const sharedText = useSharedText();
  const bookContext = useBookContext();
  const agree = useAgreeWrapper();
  const page = useCommonPagesContext();
  const authContext = useAuthContext()
  
  // 1) DATI PRINCIPALI
  const book = useDotNotation<Book | undefined>(undefined);
  const part = useMemo(()=> 
    getPart()
  , [book.get, part_id])
  // autorizzazioni
  const canRead =useMemo(()=> 
    !!book.get && 
    !!authContext.CONTROLS.canRead(book.get)
  , [book.get, authContext])
  
  const canWrite =useMemo(()=> 
    !!book.get 
    && !!authContext.CONTROLS.canWrite(book.get) 
    && page.isEditMode
  , [book.get, authContext, page])

  // restituisce la sezione corrente in base al libro
  function getPart(bookObj = book.get) :Part | undefined {
    return bookObj?.parts
      ?.find((p) => p.id === part_id)
  };

  function getSection(bookObj = book.get) :Section | undefined {
    return getPart(bookObj)
      ?.sections.find((s) => s.id === section_id);
  };
  
  
  useEffect(() => {
    // Wait for books to load before attempting to find the book.get
    if (bookContext.loading) return;

    // libro
    const foundBook = bookContext.getBookById(book_id);
    if(!foundBook) return console.error("Libro non trovato");
    book.set(foundBook);
    // sezione
    const sec = getSection(foundBook)
    if(!sec) return console.error("Sezione non trovata");
    SECTION.mainTitle.set(sec.title || "");
    // condivide il target ad altri componenti
    bookContext.setTarget(foundBook);
  }, [book_id, part_id, section_id, bookContext.loading, bookContext.getBookById, bookContext.setTarget]);


  // 2) SEZIONE
  class SectionFeature {
    mainTitle = useDotNotation("")

    bookSection = useMemo(() :Section |undefined => {
      const result = getSection();
      if (!result) return undefined;
      if (!result.paragraphs) result.paragraphs = [];
      
      // recupera solo le classi che cominciano per 'ex:'
      for (const paragraph of result.paragraphs){
        const [in_, ex_] = paragraph.in_style.split(",,");
        (paragraph as any).ex_style = ex_ || "";
        // inizializza isMarcked se non esiste
        if (paragraph.isMarcked === undefined) {
          paragraph.isMarcked = false;
        }
      }
      
      return result;
    }, [book.get, part_id, section_id, this.mainTitle]);

    // Numero di parole nella sezione
    words :number = useMemo(() => {
      const section = getSection();
      return section?.paragraphs?.reduce((acc, p) => acc + p.text.length, 0) || 0;
    }, [book.get, part_id, section_id, this.mainTitle]);

    // Aggiorna la nota della sezione
    update(sectionKey: keyof Section, value: string) {
      if (!book.get) throw new Error("Libro non trovato");
      const clone = structuredClone(book.get);
      const sec = getSection(clone);
      if (!sec) throw new Error("Sezione non trovata");

      (sec as any)[sectionKey] = value;
      if(sectionKey=="title") this.mainTitle.set(value.trim())
      book.set(clone);

      const newBook = bookContext.updateBook(book_id, clone);
      if (!newBook) return toast.danger("Errore nell'aggiornamento della nota");
      toast.success("Nota sezione aggiornata");
    };

    // Premendo 'invio' o 'freccia giù' passa al primo paragrafo
    titleKeyDown(e: React.KeyboardEvent) {
      if (e.key === "ArrowDown") {
        const firstParagraph = document.getElementById("0>text");
        if (firstParagraph) firstParagraph.focus();
      }
    };
  };
  const SECTION = new SectionFeature()

  // 3) copia e incolla
  class SHARED {
    constructor() {
      // Bind dei metodi per mantenere il contesto
      this.copy = this.copy.bind(this);
      this.paste = this.paste.bind(this);
    }

    // Copia nel sistema la struttura del libro
    async copy() {
      const section = getSection();
      if (!section) return console.error("Sezione non trovata");

      await sharedText.copy_section(section);
    }

    // Incolla la struttura del libro dal sistema
    async paste() {
      if (
        SECTION.bookSection?.paragraphs?.length &&
        !(await agree.warning(
          "Sei sicuro di voler sostituire i paragrafi precedenti?",
          "Incolla"
        ))
      ) return;

      const newSection = await sharedText.paste_section();
      if (!newSection) return;

      const clone = structuredClone(book.get);
      if (!clone) return console.error("Libro non trovato");

      const section = getSection(clone);
      if (!section) return console.error("Sezione non trovata");

      section.title = newSection.title;
      section.note = newSection.note;
      section.paragraphs = newSection.paragraphs;
      book.set(clone);

      const res = await bookContext.updateBook(book_id, clone);
      if (!res) return toast.danger("Errore nel salvataggio");
    }
  }

  // 4) PARAGRAFI
  class Parag {
    constructor() {
      // Bind dei metodi per mantenere il contesto
      this.update = this.update.bind(this);
      this.handleCreate = this.handleCreate.bind(this);
      this.handleKey = this.handleKey.bind(this);
      this.parseStyle = this.parseStyle.bind(this);
      this.setStyleInput = this.setStyleInput.bind(this);
      this.closeTemplateInputStyle = this.closeTemplateInputStyle.bind(this);
      this.handleRemove = this.handleRemove.bind(this);
      this.handleFocusText = this.handleFocusText.bind(this);
      this.initResizeObserver() 
    }

    // Proprietà per gestire lo stato globale
    showParagraphs = useMemo(() => 
      !!SECTION.bookSection?.paragraphs?.length
    ,[SECTION.bookSection]);

    listReference = useRef<HTMLOListElement>(null);
    listHeight = useDotNotation<number>(0);

    // Inizializza ResizeObserver
    initResizeObserver() {
      useEffect(() => {
        if (!this.listReference.current || !this.showParagraphs) {
          this.listHeight.set(0); 
          return;
        }

        const observer = new ResizeObserver((entries) => {
          for (const entry of entries) {
            this.listHeight.set(entry.contentRect.height);
          }
        });

        observer.observe(this.listReference.current);

        // Misura immediatamente la dimensione corrente
        const { height } = this.listReference.current.getBoundingClientRect();
        this.listHeight.set(height);

        return () => {
          if (this.listReference.current) {
            observer.unobserve(this.listReference.current);
          }
        };
      }, [book.get, this.showParagraphs]);
    }

    // Input di stile
    styleInput = useDotNotation({ index: -1, isVisible: false });


    // Aggiorna un paragrafo e salva
    update(index: number, key: keyof Paragraph, value: string | boolean, safe = true) {
      const clone = structuredClone(book.get!);
      const sec = getSection(clone);
      if (!sec || !sec.paragraphs?.length) return;

      // Controllo del tipo
      if (typeof value !== typeof sec.paragraphs[index][key]) {
        console.error("Tipo non valido");
        return;
      }
      (sec.paragraphs as any)[index][key] = value;

      book.set(clone);

      // Aggiornamento backend e feedback
      if (!safe) return;
      const res = bookContext.updateBook(book_id, clone);
      if (!res) return toast.danger("Errore di validazione");
    }

    // Crea un nuovo paragrafo senza salvarlo
    handleCreate(index?: number | 'top', paragraphText = "") {
      if (!book.get) return console.error("Libro non disponibile");

      const updated = structuredClone(book.get);
      const sec = getSection(updated);
      if (!sec) return console.error("Sezione non trovata");

      const newParagraph: Paragraph = {
        id: bookContext.createId(),
        in_style: "",
        text: paragraphText || "",
        isMarcked: false
      };
      if (!sec.paragraphs) sec.paragraphs = [];

      // Aggiungi in cima
      if (index === "top") {
        sec.paragraphs.unshift(newParagraph);
      }
      // Aggiungi in fondo
      else if (index === undefined) {
        sec.paragraphs.push(newParagraph);
      }
      // Inserisce dopo l'indice
      else {
        sec.paragraphs.splice(index + 1, 0, newParagraph);
      }

      // Aggiorna lo stato
      book.set(updated);
      // Salvataggio condizionale
      if (paragraphText) bookContext.updateBook(book_id, updated, false);
      toast.success("Paragrafo aggiunto");
    }

    // Gestisce funzionalità speciali (es. Enter, Tab)
    handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
      if (!book.get) return console.error("Libro non disponibile");
      return handleKeyboardFeature(e);
    }

    // Imposta il colore appropriato del testo
    parseStyle(paragraph: Paragraph): string {
      // Estrai solo la parte prima di ',,' per lo stile principale
      const [in_style] = paragraph.in_style.split(",,");

      // Sfondo bianco
      if (in_style?.includes("bg-white")) {
        return in_style + " text-black";
      }

      const backgroundPattern = /bg-[a-zA-Z]+-[0-9]+/;
      const match = in_style?.match(backgroundPattern);
      // Non si specifica lo sfondo
      if (!match) {
        return in_style || "";
      }
      const gradiant = parseInt(match[0].split('-')[2] || "0");
      const textColor = gradiant <= 400 ? " text-black" : " text-white";

      return in_style + textColor;
    }

    // Imposta l'input di stile
    setStyleInput(paragraph_i?: number) {
      if (!page.isEditMode) return;

      // RESET
      if (paragraph_i === undefined) {
        this.styleInput.set(prev => ({
          ...prev,
          isVisible: false,
          index: -1,
        }));
        return;
      }

      // Cerca paragrafo
      const target = SECTION.bookSection?.paragraphs?.[paragraph_i];
      if (!target) return console.error("Paragrafo non trovato");

      this.styleInput.set(prev => ({
        ...prev,
        isVisible: true,
        index: paragraph_i,
      }));
    }

    // Chiude l'input di stile attraverso <main>
    closeTemplateInputStyle(e: React.MouseEvent) {
      e.stopPropagation();
      const textarea = (e.target as HTMLElement).closest("textarea");
      const dropdown = (e.target as HTMLElement).closest("[data-dropdown]");
      if (!dropdown && !textarea) this.setStyleInput();
    }

    // Rimuove un paragrafo
    async handleRemove(index: number) {
      if (!book.get) {
        throw new Error("Libro non disponibile");
      }

      const updated = structuredClone(book.get);
      const sec = getSection(updated);

      if (!sec) {
        throw new Error("Sezione non trovata");
      }
      // Stato locale
      if (!sec.paragraphs) sec.paragraphs = [];
      sec.paragraphs.splice(index, 1);
      book.set(updated);

      // Salva su db
      const res = bookContext.updateBook(book_id, updated);
      // Feedback
      if (!res) return toast.danger("Errore nel salvataggio");
      toast.success("Paragrafo rimosso");
    }

    // Applica il focus sul testo del paragrafo
    handleFocusText(e: React.MouseEvent | React.FocusEvent) {
      if (!authContext.CONTROLS.canWrite(book.get!))
        return console.error("Permesso negato");

      // Seleziona textarea del testo del paragrafo
      const element = e.target as HTMLElement;
      const isSelected = element.tagName === "TEXTAREA";
      const textarea = (
        isSelected
          ? (element as HTMLTextAreaElement)
          : (element.querySelector('textarea[name*=">text"], textarea[id*=">text"]') as HTMLTextAreaElement)
            || (element.closest('li')?.querySelector('textarea[name*=">text"], textarea[id*=">text"]') as HTMLTextAreaElement)
            || (e.currentTarget?.querySelector?.('textarea[name*=">text"], textarea[id*=">text"]') as HTMLTextAreaElement)
      );

      if (!textarea) return console.error("Textarea non trovata");

      // Fa tornare editmode
      if (!page.isEditMode) page.toggleEditMode();
      // Applica il focus
      setTimeout(() => {
        const targetTextarea = (document.getElementById(textarea.id) as HTMLTextAreaElement) || textarea;
        targetTextarea?.focus();
      }, 200);
    }
  }  
  const PARAG =new Parag()

  // 4) aggiunge dinamicamente glierrori dei paragrafi non validi
  const errors = useMemo(()=>{
    if(!page.isEditMode) return {};

    // 1) validazione paragrafi
    let result: Record<string, string> = {};
    getSection()?.paragraphs?.forEach((p, index)=>{
      const validatedParagraph = safeParse(paragraph_schema, p);
      if (!validatedParagraph.success) 
        // inserire un campo d'errore
        validatedParagraph.issues.forEach((valibotMessage)=>{
          const [key, message] =valibotMessage.message.split(": ");
          result[index+">"+key] = message;
        }) 
    })

    // 2) sezione
    const validatedSection = safeParse(section_schema, SECTION.bookSection);   
    if (!validatedSection.success) {
      validatedSection.issues.forEach((valibotMessage)=>{
        const [key, message] =valibotMessage.message.split(": ");
        result["section>"+key] = message;
      })
    }
    return result;
  }, [book.get])

  // 5) AUTOCOMPLETE PER STILI RIPETUTI
  class AUTOCOMPLETE {
    // Stili predefiniti
    standardStyles = [
      "sinistra", "destra", "centro",
      "descrizione", "esclamazione", "dialogo", "sussurro",
      // Gradiazioni
      "bg-black-b", "bg-black-t", "bg-fade-10"
    ] as const;

    // Stili usati nei paragrafi
    usedStyles = useMemo(() => {
      const paragraphs = SECTION.bookSection?.paragraphs;
      if (!paragraphs) return [];
      return paragraphs
        .map(p => p.in_style?.trim() || "")
        .filter(Boolean);
    }, [SECTION.bookSection?.paragraphs]);

    // Suggerimenti attuali
    suggestions = useDotNotation<string[]>([]);

    constructor() {
      // Bind dei metodi per mantenere il contesto
      this.setSuggestions = this.setSuggestions.bind(this);
      this.handleClick = this.handleClick.bind(this);
    }

    // Aggiorna i suggerimenti in base all'input
    setSuggestions(e: React.ChangeEvent<HTMLTextAreaElement>) {
      // 1) Risorse
      const target = e.target as HTMLTextAreaElement;
      if (!target.name.includes("style")) return;
      const inputValue = target.value;

      // Classi dell'input
      const paragraphClasses = inputValue.toLowerCase().trim().split(" ");

      // Classi usate nei paragrafi
      const usedStyles: string[] = this.usedStyles
        .map(input => input.split(" "))
        .flat();

      // Unione di classi usate e standard
      const merged = [
        ...usedStyles,
        ...this.standardStyles,
      ];

      // 2) Filtraggio: classi che assomigliano all'input
      const filtered = merged.filter(mergedStyle =>
        paragraphClasses.some(paragraphClass =>
          mergedStyle.includes(paragraphClass) &&
          mergedStyle !== paragraphClass
        )
      );

      // 3) Aggiunge la classe ripetuta più simile
      const similInput = this.usedStyles.find(usedStyle =>
        usedStyle.includes(inputValue) &&
        usedStyle !== inputValue
      ) || "";

      // 4) Mostra 5 suggerimenti senza ripetizioni
      const result = [...new Set([similInput, ...filtered])]
        .filter(Boolean)
        .splice(0, 5);

      this.suggestions.set(result);
    }

    // Gestisce il click su un suggerimento
    handleClick(e: React.MouseEvent<HTMLButtonElement>, p: Paragraph, index: number) {
      const newClass = (e.target as HTMLDivElement).innerText;
      const actualClasses = p.in_style.toLowerCase().split(" ");

      // Aggiornamento delle classi
      const update = actualClasses.map((cls) =>
        newClass.includes(cls) ? newClass : cls
      ).join(" ");

      PARAG.update(index, "in_style", update);
      this.suggestions.set([]);
    }
  }


  // 7) TROVA E SOSTITUISCI 
  // Tipo per le occorrenze trovate
  type FoundOccurrence = { type: 'text' | 'style', index: number } | { type: 'section-title' };
  
  class FIND_REPLACE {
    constructor(){
      this.next = this.next.bind(this);
      this.previous = this.previous.bind(this);
    };
    
    // CERCA
    isVisible = useDotNotation(false); // mostra / nascondi sezione
    previousQuery = useDotNotation({ value:"", caseSensitive:false, wholeWord:false });
    search = useDotNotation({ value:"", caseSensitive:false, wholeWord:false });
    currentIndex = useDotNotation(0);

    // Resetta lo stato
    reset() {
      this.search.set(p=>({ ...p, value: "" }));
      this.replaceQuery.set("");
      this.currentIndex.set(0);
    };


    // Calcola le occorrenze trovate automaticamente con useMemo
    foundIndices = useMemo(() => {
      const query = this.search.get;
      if (!query || !query.value.trim()) return [];

      const occurrences: FoundOccurrence[] = [];
      const searchValue = query.caseSensitive ? query.value : query.value.toLowerCase();

      // Funzione helper per verificare se il testo contiene la query
      function matchesQuery (text: string): boolean {
        const searchText = query.caseSensitive ? text : text.toLowerCase();
        if (query.wholeWord) {
          const regex = new RegExp(`\\b${query.value}\\b`, query.caseSensitive ? "" : "i");
          return regex.test(text);
        } else {
          return searchText.includes(searchValue);
        }
      };

      // Cerca nel titolo della sezione
      const sectionTitle = SECTION.mainTitle.get;
      if (matchesQuery(sectionTitle)) {
        occurrences.push({ type: 'section-title' });
      }

      // Cerca nei paragrafi (testo e stile)
      getSection()?.paragraphs?.forEach((p, index) => {
        // Cerca nel testo
        if (matchesQuery(p.text)) {
          occurrences.push({ type: 'text', index });
        }

        // Cerca nello stile
        const style = p.in_style || "";
        if (matchesQuery(style)) {
          occurrences.push({ type: 'style', index });
        }
      });

      return occurrences;
    }, [this.search, book.get, SECTION.mainTitle.get]);
  
    // Cerca tutte le occorrenze nei paragrafi
    executeSearch() {      
      const query = this.search.get;
      if (!query) {
        this.reset();
        return;
      }

      const previousQuery = this.previousQuery.get;
      const isSameQuery = previousQuery.value === query.value
        && previousQuery.caseSensitive === query.caseSensitive
        && previousQuery.wholeWord === query.wholeWord;

      // Se la query è la stessa, vai semplicemente al prossimo indice
      const FIND_REPLACE = this, foundIndices = this.foundIndices;
      function _makeFocus() {
        const currentIndex = FIND_REPLACE.currentIndex.get;
        
        if (foundIndices.length === 0) return;
        const newIndex = (currentIndex < foundIndices.length - 1) ? currentIndex + 1 : 0;
        FIND_REPLACE.currentIndex.set(newIndex);
    
        setTimeout(() => {
          const occurrence = foundIndices[newIndex];
          // titolo sezione
          if (occurrence.type === 'section-title') {
            const titleInput = document.getElementById("section-title") as HTMLInputElement;
            if (titleInput) {
              titleInput.scrollIntoView({ behavior: "smooth", block: "center" });
              titleInput.focus();
            }
    
          // testo e stile
          } else {
            // testo
            if (occurrence.type === 'text') {
              const textInput =document.getElementById(`${occurrence.index}>text`);
              if (!textInput) return console.error("input testuale non trovato");
              setTimeout(() => {
                textInput.scrollIntoView({ behavior: "smooth", block: "center" });
              }, 100);
            }

            // stile
            if (occurrence.type === 'style') {
              PARAG.setStyleInput(occurrence.index) // apre il dropdown

              setTimeout(() => {
                const styleInput =document.getElementById(`${occurrence.index}>in_style`);
                if (!styleInput) return console.error("input stile non trovato", occurrence);
                
                setTimeout(() => {
                  styleInput.scrollIntoView({ behavior: "smooth", block: "center" });
                }, 100);
              }, 100);
            }
    
          }
        }, 100);
      }

      if (isSameQuery) {
        _makeFocus()
        return;
      }

      // Nuova query: resetta e scrolla al primo elemento
      FIND_REPLACE.currentIndex.set(0);
      FIND_REPLACE.previousQuery.set(p=>({ ...p, value:query.value, caseSensitive:query.caseSensitive, wholeWord:query.wholeWord }));

      // Sposta il focus sul primo input trovato
      if (this.foundIndices.length > 0) {
        _makeFocus()
      }
    };

    // Vai all'occorrenza precedente
    previous() {
      const FIND_REPLACE = this;
      const currentIndex = FIND_REPLACE.currentIndex.get;

      if (this.foundIndices.length === 0) return;
      const newIndex = currentIndex > 0 ? currentIndex - 1 : this.foundIndices.length - 1;
      FIND_REPLACE.currentIndex.set(newIndex);

      setTimeout(() => {
        const occurrence = this.foundIndices[newIndex];
        if (occurrence.type === 'section-title') {
          const titleInput = document.getElementById("section-title") as HTMLInputElement;
          if (titleInput) titleInput.focus();
        } else {
          const inputId = occurrence.type === 'text' 
            ? `${occurrence.index}>text` 
            : `${occurrence.index}>in_style`;
          const input = document.getElementById(inputId) as HTMLTextAreaElement;
          if (!input) return;
          input.scrollIntoView({ behavior: "smooth", block: "center" });
          // Apri l'input dello stile se necessario
          if (occurrence.type === 'style') {
            PARAG.setStyleInput(occurrence.index);
          }
          // Fai focus sull'input
          setTimeout(() => {
            const focusedInput = document.getElementById(inputId) as HTMLTextAreaElement;
            if (focusedInput) focusedInput.focus();
          }, 50);
        }
      }, 100);
    };

    // Vai all'occorrenza successiva
    next() {
      const FIND_REPLACE = this;      
      const currentIndex = FIND_REPLACE.currentIndex.get;

      if (this.foundIndices.length === 0) return;
      const newIndex = currentIndex < this.foundIndices.length - 1 ? currentIndex + 1 : 0;
      FIND_REPLACE.currentIndex.set(newIndex);

      setTimeout(() => {
        const occurrence = this.foundIndices[newIndex];
        if (occurrence.type === 'section-title') {
          const titleInput = document.getElementById("section-title") as HTMLInputElement;
          if (titleInput) titleInput.focus();
        } else {
          const inputId = occurrence.type === 'text' 
            ? `${occurrence.index}>text` 
            : `${occurrence.index}>in_style`;
          const input = document.getElementById(inputId) as HTMLTextAreaElement;
          if (!input) return;
          input.scrollIntoView({ behavior: "smooth", block: "center" });
          // Apri l'input dello stile se necessario
          if (occurrence.type === 'style') {
            PARAG.setStyleInput(occurrence.index);
          }
          // Fai focus sull'input
          setTimeout(() => {
            const focusedInput = document.getElementById(inputId) as HTMLTextAreaElement;
            if (focusedInput) focusedInput.focus();
          }, 50);
        }
      }, 100);
    };

    // SOSTITUZIONE
    replaceQuery = useDotNotation("");
    replaceAll(targets: FoundOccurrence[] = this.foundIndices) {
      const FIND_REPLACE = this;
      if (targets.length === 0) return;
      const replaceText = FIND_REPLACE.replaceQuery.get;
      const search = FIND_REPLACE.search.get;
      if (!book.get) return;

      // Funzione per sfuggire i caratteri speciali in una stringa per RegExp
      function escapeRegExp(string: string): string {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      }

      // Clona il libro una volta sola
      const bookClone = structuredClone(book.get);
      const sec = getSection(bookClone);
      if (!sec?.paragraphs) return;

      // Itera su tutte le occorrenze target
      targets.forEach((occurrence) => {
        if (occurrence.type === 'section-title') {
          // Sostituisci nel titolo della sezione
          let title = sec.title;
          const searchValue = search.caseSensitive ? search.value : search.value.toLowerCase();
          const escapedSearchValue = escapeRegExp(searchValue);

          let regex: RegExp;
          if (search.wholeWord) {
            regex = new RegExp(`\\b${escapedSearchValue}\\b`, search.caseSensitive ? "g" : "gi");
          } else {
            regex = new RegExp(escapedSearchValue, search.caseSensitive ? "g" : "gi");
          }

          const newTitle = title.replace(regex, replaceText);
          sec.title = newTitle;
        } else {
          // Sostituisci nei paragrafi
          const paragraph = sec.paragraphs?.[occurrence.index];
          if (!paragraph) return;

          if (occurrence.type === 'text') {
            let text = paragraph.text;
            const searchValue = search.caseSensitive ? search.value : search.value.toLowerCase();
            const escapedSearchValue = escapeRegExp(searchValue);

            let regex: RegExp;
            if (search.wholeWord) {
              regex = new RegExp(`\\b${escapedSearchValue}\\b`, search.caseSensitive ? "g" : "gi");
            } else {
              regex = new RegExp(escapedSearchValue, search.caseSensitive ? "g" : "gi");
            }

            const newText = text.replace(regex, replaceText);
            paragraph.text = newText;
            PARAG.update(occurrence.index, "text", newText, true );
          } else if (occurrence.type === 'style') {
            let style = paragraph.in_style || "";
            const searchValue = search.caseSensitive ? search.value : search.value.toLowerCase();
            const escapedSearchValue = escapeRegExp(searchValue);

            let regex: RegExp;
            if (search.wholeWord) {
              regex = new RegExp(`\\b${escapedSearchValue}\\b`, search.caseSensitive ? "g" : "gi");
            } else {
              regex = new RegExp(escapedSearchValue, search.caseSensitive ? "g" : "gi");
            }

            const newStyle = style.replace(regex, replaceText);
            paragraph.in_style = newStyle;
            PARAG.update(occurrence.index, "in_style", newStyle, false );
          }
        }
      });

      // Salva una volta sola su database
      bookContext.updateBook(book_id, bookClone);
      toast.success("Sostituite tutte le occorrenze");

      // Reimposta la ricerca per aggiornare gli indici
      FIND_REPLACE.executeSearch();
    };

    // Sostituisce la prima occorrenza
    replace() {
      const FIND_REPLACE = this;
      const currentIndex = FIND_REPLACE.currentIndex.get;
      const replaceText = FIND_REPLACE.replaceQuery.get;
      const search = FIND_REPLACE.search.get;

      if (this.foundIndices.length === 0 || currentIndex >= this.foundIndices.length) return;
      if (!replaceText.trim()) return;

      // Chiama replaceAll con un array contenente solo l'occorrenza corrente
      FIND_REPLACE.replaceAll([this.foundIndices[currentIndex]]);

      // Vai alla prossima occorrenza
      const updatedIndex = FIND_REPLACE.currentIndex.get;
      if (this.foundIndices.length > 0 && updatedIndex < this.foundIndices.length) {
        const nextOccurrence = this.foundIndices[updatedIndex];
        setTimeout(() => {
          if (nextOccurrence.type === 'section-title') {
            const titleInput = document.getElementById("section-title") as HTMLInputElement;
            if (titleInput) {
              titleInput.scrollIntoView({ behavior: "smooth", block: "center" });
              titleInput.focus();
            }
          } else {
            const inputId = nextOccurrence.type === 'text' 
              ? `${nextOccurrence.index}>text` 
              : `${nextOccurrence.index}>in_style`;
            const nextInput = document.getElementById(inputId) as HTMLTextAreaElement;
            if (!nextInput) return;
            nextInput.scrollIntoView({ behavior: "smooth", block: "center" });
            if (nextOccurrence.type === 'style') {
              PARAG.setStyleInput(nextOccurrence.index);
            }
            setTimeout(() => {
              const focusedInput = document.getElementById(inputId) as HTMLTextAreaElement;
              if (focusedInput) focusedInput.focus();
            }, 50);
          }
        }, 100);
      }
    };

  };

  // 5.5) KEYBOARD FEATURES
  const handleKeyboardFeature = useKeyboardFeatures(book_id, getSection, book.get, book.set, SECTION, PARAG);

  
  // 6) STORICO AZIONI
  class HISTORY {
    undoStack = useDotNotation<Paragraph[][]>([]);
    redoStack = useDotNotation<Paragraph[][]>([]);

    constructor(){
      this.onChangeBook(); // aggiorna cronologia locale
      // Bind dei metodi per mantenere il contesto
      this.undo = this.undo.bind(this);
      this.redo = this.redo.bind(this);
      this.saveState = this.saveState.bind(this);
    }

    // Salva lo stato attuale in undoStack e svuota redoStack
    saveState(paragraphs: Paragraph[]) {
      this.undoStack.set(prev => [...prev, structuredClone(paragraphs)]);
      // Svuota redoStack dopo una nuova azione
      this.redoStack.set([]);
    };

    // torna allo stato precedente
    undo() {
      const undoStack = this.undoStack.get;
      if (!undoStack || undoStack.length <= 1) return; // Non c'è nulla da fare undo

      const currentState = undoStack[undoStack.length - 1];
      const previousState = undoStack[undoStack.length - 2];

      // Sposta lo stato attuale in redoStack
      this.redoStack.set(prev => [...prev, currentState]);

      // Rimuovi l'ultimo stato da undoStack
      this.undoStack.set(prev => prev.slice(0, -1));

      // Applica lo stato precedente
      const clone = structuredClone(book.get!);
      const sec = getSection(clone);
      if (!sec) return console.error("Sezione non trovata");

      sec.paragraphs = structuredClone(previousState);
      book.set(clone);
    };

    // torna allo stato successivo
    redo() {
      const redoStack = this.redoStack.get;
      if (redoStack.length === 0) return; // Non c'è nulla da fare redo

      const nextState = redoStack[redoStack.length - 1];

      // Sposta lo stato attuale in undoStack
      this.undoStack.set(prev => [...prev, structuredClone(nextState)]);

      // Rimuovi l'ultimo stato da redoStack
      this.redoStack.set(prev => prev.slice(0, -1));

      // Applica lo stato successivo
      const clone = structuredClone(book.get!);
      const sec = getSection(clone);
      if (!sec) return console.error("Sezione non trovata");

      sec.paragraphs = structuredClone(nextState);
      book.set(clone);
    };
    
    // salva i paragrafi ogni volta che book.get cambia
    onChangeBook() {
      useEffect(() => {
        if (!book.get) return;
        const sec = getSection(structuredClone(book.get));
        if (!sec) return console.error("Sezione non trovata");
    
        const paragraphs = sec.paragraphs;
        if (!paragraphs) return console.error("Paragrafi non trovati");
    
        // Salva solo se lo stato è diverso dall'ultimo in undoStack
        const lastState = this.undoStack.get[this.undoStack.get.length - 1];
        if (!lastState || JSON.stringify(lastState) !== JSON.stringify(paragraphs)) {
          this.saveState(paragraphs);
        }
      }, [book.get])
    }
  };

  // 7) segnalibro
  class MARCKERS {
    isVisible = useDotNotation(false);

    // tutti i paragrafi segnati con indice originale
    markers = useMemo(() => {
      const paragraphs = getSection()?.paragraphs || [];
      return paragraphs
        .map((paragraph, index) => ({ paragraph, index }))
        .filter((item) => item.paragraph.isMarcked);
    }, [book.get, part_id, section_id]);

    // scrolla la pagina fino al segnalibro
    scrollToMarker(id: string | number) {
      const input = document.getElementById(`${id}>text`);

      setTimeout(() => {
        input?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if(canWrite) input?.focus();
      }, 100);
    }
  };
  
  // 8) NAVIGAZIONE TRA SEZIONI
  class NAVIGATION {
    allSections = useMemo(() => {
      if (!book.get?.parts) return [];
      const list: { part_id: string; part_title: string; section_id: string; section_title: string }[] = [];
      for (const p of book.get.parts) {
        if (p.sections) {
          for (const s of p.sections) {
            list.push({
              part_id: p.id,
              part_title: p.title,
              section_id: s.id,
              section_title: s.title,
            });
          }
        }
      }
      return list;
    }, [book.get]);
  
    currentSectionIndex = useMemo(() => {
      return this.allSections.findIndex((s) => s.part_id === part_id && s.section_id === section_id);
    }, [this.allSections, part_id, section_id]);
  
    prevSection = useMemo(() => {
      if (this.currentSectionIndex > 0) {
        return this.allSections[this.currentSectionIndex - 1];
      }
      return undefined;
    }, [this.allSections, this.currentSectionIndex]);
  
    nextSection = useMemo(() => {
      if (this.currentSectionIndex >= 0 && this.currentSectionIndex < this.allSections.length - 1) {
        return this.allSections[this.currentSectionIndex + 1];
      }
      return undefined;
    }, [this.allSections, this.currentSectionIndex]);
  }

  return {
    book,
    part,
    errors,
    page,
    book_id,
    part_id,
    section_id,
    SECTION,
    SHARED: new SHARED(),
    PARAG,
    AUTOCOMPLETE: new AUTOCOMPLETE(),
    FIND_REPLACE: new FIND_REPLACE(),
    canRead, canWrite,

    HISTORY: new HISTORY(),
    MARCKERS: new MARCKERS(),
    NAVIGATION: new NAVIGATION()
  };
}