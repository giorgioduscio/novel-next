import { useBookContext } from "@/app/data/BookContext";
import { useCommonPagesContext } from "@/app/data/CommonPagesContext";
import { Book, Section, Paragraph, paragraph_schema, section_schema, Part } from "@/app/schemas/book_schema";
import { useAgreeWrapper } from "@/app/shareds/Agree";
import { useDotNotation } from "@/app/tools/reactCustomization";
import { toast, ui_copy } from "@/app/tools/feedbacksUI";
import React, { useEffect, useMemo, useRef } from "react";
import { safeParse } from "valibot";
import { useKeyboardFeatures } from "./keyboardFeatures";
import { useAuthContext } from "@/app/data/AuthContext";
import useSharedText from "@/app/data/sharedText";
import { toPng } from 'html-to-image';
import { join } from "node:path";
import { GROUPS_DATAS, TailwindGroup } from "./TailwindClassGroups";

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
  , [book.get?.id, authContext.allowedReadIds.get])
  
  const canWrite =useMemo(()=> 
    !!book.get 
    && !!authContext.CONTROLS.canWrite(book.get) 
  , [book.get?.id, authContext.allowedWriteIds.get])

  const section_isEditMode =useMemo(()=> 
    canWrite
    && page.isEditMode.get
  , [canWrite, page.isEditMode.get])

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
    if (!bookContext.isBookLoaded.get) return;

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
  }, [book_id, part_id, section_id, bookContext.isBookLoaded.get, bookContext.getBookById, bookContext.setTarget]);


  // 2) SEZIONE
  class SectionFeature {
    mainTitle = useDotNotation("")

    bookSection = useMemo(() :Section |undefined => {
      const result = getSection();
      if (!result) return undefined;
      if (!result.paragraphs) result.paragraphs = [];

      // inizializza isMarcked se non esiste
      for (const paragraph of result.paragraphs){
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

      // Direct API call
      bookContext.updateBook(book_id, clone);
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
  class SharedFeatures {
    constructor() {
      // Bind dei metodi per mantenere il contesto
      this.copy = this.copy.bind(this);
      this.paste = this.paste.bind(this);
      this.downloadAsImage = this.downloadAsImage.bind(this);
    }

    // Copia nel sistema la struttura del libro
    async copy(value?:string) {
      if(value){
        ui_copy(value);
        toast.success("Copiato")
        return;
      }

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

    downloadAsImage = () => {
      const element = document.querySelector("#SectionComponent section") as HTMLDivElement;
      if (!element) {
        console.error("Elemento SectionComponent non trovato");
        return;
      }

      const options = {
        quality: 1,
        backgroundColor: '#ffffff',
        style: {
          'transform': 'none',
        },
        cacheBust: true,
      };

      toPng(element, options)
        .then((dataUrl: string) => {
          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = `${SECTION.mainTitle.get || 'sezione'}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        })
        .catch((err: Error) => {
          console.error("| Errore nella generazione dell'immagine:", err);
        });
    }

    // esegue la stampa del documento
    print(){
      window.print();
    }
  }

  // 4) PARAGRAFI
  class Parag {
    constructor() {
      // Bind dei metodi per mantenere il contesto
      this.update = this.update.bind(this);
      this.handleCreate = this.handleCreate.bind(this);
      this.handleKey = this.handleKey.bind(this);
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

      // se l'input contiene ',,', compila i due attributi
      if (key === "in_style" && String(value).includes(",,")) {
        const [inPart, exPart] = String(value).split(",,");
        
        (sec.paragraphs as any)[index].in_style = inPart || "";
        (sec.paragraphs as any)[index].ex_style = exPart || "";
        
      // se l'input non contiene ',,' ma ex_style è truty, azzera ex_style
      } else if (key === "in_style" && !String(value).includes(",,") && sec.paragraphs[index].ex_style.length) {
        (sec.paragraphs as any)[index][key] = value;
        (sec.paragraphs as any)[index].ex_style ='';

      } else {
        (sec.paragraphs as any)[index][key] = value;
      }

      book.set(clone);

      // Direct API call
      if (!safe) return;
      bookContext.updateBook(book_id, clone);
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
        ex_style: "",
        scripted_style: "text-center margini-standard",
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
    handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>, index:number, key: keyof Paragraph, paragraph?: Paragraph) {
      if (!book.get || !paragraph) return console.error("Libro non disponibile");

      return handleKeyboardFeature(e, index, key, paragraph);
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
      if (!authContext.CONTROLS.canRead(book.get!))
        return console.error("Permesso negato");
      if (page.isEditMode.get) return;

      
      // Seleziona textarea del testo del paragrafo
      const target = e.target as HTMLElement
      const container = target.closest("[data-external-style]");
      if(!container) return console.error("Elemento non trovato");
      
      const isSelected = target.tagName === "TEXTAREA";
      const textarea = isSelected
          ? (target as HTMLTextAreaElement)
          : (container.querySelector('textarea') as HTMLTextAreaElement)
      if (!textarea) return console.error("Textarea non trovata");
      
      // Fa tornare editmode
      if (!page.isEditMode.get) page.isEditMode.set(true);

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
    if(!page.isEditMode.get) return {};

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

  // 5) GROUPS_DATAS 
  class GroupsFeature {
    // Bind dei metodi per mantenere il contesto
    constructor() {
      this.toggleGroup = this.toggleGroup.bind(this);
      this.setStyleInput = this.setStyleInput.bind(this);
      this.closeTemplateInputStyle = this.closeTemplateInputStyle.bind(this);
    }

    // Input di stile
    styleInput = useDotNotation<{
      index:number,
      isVisible:boolean,
      target?: Paragraph,
    }>({ index: -1, isVisible: false });

    // Imposta l'input di stile
    setStyleInput(paragraph_i?: number) {
      if (!page.isEditMode.get) return;

      // RESET
      if (paragraph_i === undefined) {
        this.styleInput.set({
          isVisible: false,
          index: -1,
        });
        return;
      }

      // Cerca paragrafo direttamente da book.get per avere sempre i dati più recenti
      const section = getSection(book.get);
      const target = section?.paragraphs?.[paragraph_i];
      if (!target) return console.error("Paragrafo non trovato");

      this.styleInput.set({
        isVisible: true,
        index: paragraph_i,
        target
      });
    }

    // Chiude l'input di stile attraverso <main>
    closeTemplateInputStyle(e: React.MouseEvent) {
      e.stopPropagation();
      const textarea = (e.target as HTMLElement).closest("textarea");
      const dropdown = (e.target as HTMLElement).closest("[data-dropdown]");
      if (!dropdown && !textarea) this.setStyleInput();
    }

    actualGroups = useMemo(()=>{
      const input = this.styleInput.get;
      if(!input.isVisible) return null;

      const section = getSection(book.get);
      const paragraph = section?.paragraphs?.[input.index];
      const style = paragraph?.scripted_style || '';

      const matches :(TailwindGroup & {key:string})[] =[]
      for(const groupKey in GROUPS_DATAS){
        const matchIndex = GROUPS_DATAS[groupKey].findIndex(_g=> {
          // Se il valore è vuoto, matcha solo se nessun altro valore del gruppo è presente
          if (_g.value === '') {
            return !GROUPS_DATAS[groupKey].some(g =>
              g.value !== '' && style.includes(g.value)
            );
          }
          // Altrimenti controlla se il valore è incluso nello style
          return style.includes(_g.value);
        });
        if(matchIndex<0) return console.warn(`${groupKey}: nessun elemento`);

        matches.push({...GROUPS_DATAS[groupKey][matchIndex], key: groupKey});
      }
      return matches
    }, [book.get, this.styleInput.get.index, SECTION.bookSection])

    // Verifica se uno stile è selezionato nel paragrafo corrente
    isSelected(group: TailwindGroup): boolean {
      const input = this.styleInput.get;
      if (!input.isVisible) return false;

      const section = getSection(book.get);
      const paragraph = section?.paragraphs?.[input.index];
      const style = paragraph?.scripted_style || '';

      // Se il valore è vuoto, controlla se nessun altro valore del gruppo è presente
      if (group.value === '') {
        return !GROUPS_DATAS[Object.keys(GROUPS_DATAS).find(key => 
          GROUPS_DATAS[key].includes(group)
        ) || ''].some(g => g.value !== '' && style.includes(g.value));
      }
      // Altrimenti controlla se il valore è incluso nello style
      return style.includes(group.value);
    }

    // dati della finestra dei pulsanti
    windodButtons = useDotNotation<TailwindGroup[]>([]);
    currentGroupKey = useDotNotation<string>("");

    // Apre la finestra popup con i pulsanti del gruppo selezionato
    openWindowButtons(groupKey: string) {
      const groupData = GROUPS_DATAS[groupKey];
      if (!groupData) return console.error(`Gruppo ${groupKey} non trovato`);
      this.windodButtons.set(groupData);
      this.currentGroupKey.set(groupKey);
    }

    // Chiude la finestra popup
    closeWindowButtons() {
      this.windodButtons.set([]);
      this.currentGroupKey.set("");
    }

    toggleGroup(group: TailwindGroup, groupKey?: string){
      // Usa currentGroupKey se groupKey non è fornito
      const actualGroupKey = groupKey || this.currentGroupKey.get;
      if (!actualGroupKey) return console.error("Nessun gruppo attivo");

      // input col focus
      const input = this.styleInput.get;

      // Legge direttamente dal libro per avere dati freschi
      const section = getSection(book.get);
      const paragraph = section?.paragraphs?.[input.index];
      let resultStyle = paragraph?.scripted_style || '';

      // Rimuove tutte le classi che appartengono al gruppo
      const groupValues = GROUPS_DATAS[actualGroupKey].map(g => g.value).filter(v => v !== '');
      groupValues.forEach(groupValue => {
        const classesToRemove = groupValue.split(' ');
        resultStyle = resultStyle.split(' ')
          .filter((cls: string) => !classesToRemove.includes(cls))
          .join(' ')
          .trim();
      });

      // Aggiunge il nuovo valore
      resultStyle = `${resultStyle} ${group.value}`.trim();

      // Aggiorna il target per renderlo reattivo
      PARAG.update(this.styleInput.get.index, "scripted_style", resultStyle.trim())
      this.setStyleInput(this.styleInput.get.index);
      
      // Chiude la finestra popup dopo la selezione
      this.closeWindowButtons();
    }
    
  }
  const GROUPS = new GroupsFeature()

  // 5.5) KEYBOARD FEATURES
  const handleKeyboardFeature = useKeyboardFeatures(getSection, { book, SECTION, PARAG });

  // 7) CERCA E SOSTITUISCI 
  // Tipo per le occorrenze trovate
  type FoundOccurrence = { type: 'text' | 'style', index: number } | { type: 'section-title' };
  class FIND_REPLACE {
    constructor() {
      this.next = this.next.bind(this);
      this.previous = this.previous.bind(this);
    };

    // CERCA
    isVisible = useDotNotation(false); // mostra / nascondi sezione
    previousQuery = useDotNotation({ value: "", caseSensitive: false, wholeWord: false });
    search = useDotNotation({ value: "", caseSensitive: false, wholeWord: false });
    currentIndex = useDotNotation(0);

    // Resetta lo stato
    reset() {
      this.search.set(p => ({ ...p, value: "" }));
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
      function matchesQuery(text: string): boolean {
        const searchText = query.caseSensitive ? text : text.toLowerCase();
        if (query.wholeWord) {
          // Usa la query originale per la regex, ma gestisce caseSensitive
          const escapedQuery = query.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`\\b${escapedQuery}\\b`, query.caseSensitive ? "" : "i");
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

    // Metodo unificato per gestire il focus
    _makeFocus(direction: "next" | "previous") {
      const currentIndex = this.currentIndex.get;
      if (this.foundIndices.length === 0) return;

      // Calcola il nuovo indice in base alla direzione
      let newIndex: number;
      if (direction === "next") {
        newIndex = currentIndex < this.foundIndices.length - 1 ? currentIndex + 1 : 0;
      } else {
        newIndex = currentIndex > 0 ? currentIndex - 1 : this.foundIndices.length - 1;
      }
      this.currentIndex.set(newIndex);

      setTimeout(() => {
        const occurrence = this.foundIndices[newIndex];
        // Titolo sezione
        if (occurrence.type === 'section-title') {
          const titleInput = document.getElementById("section-title") as HTMLInputElement;
          if (titleInput) {
            titleInput.focus();
          }
        } else {
          // Testo
          if (occurrence.type === 'text') {
            const textInput = document.getElementById(`${occurrence.index}>text`);
            if (!textInput) return console.error("Input testuale non trovato");
            setTimeout(() => {
            }, 100);
          }

          // Stile
          if (occurrence.type === 'style') {
            GROUPS.setStyleInput(occurrence.index); // Apri il dropdown
            setTimeout(() => {
              const styleInput = document.getElementById(`${occurrence.index}>in_style`);
              if (!styleInput) return console.error("Input stile non trovato", occurrence);
              setTimeout(() => {
              }, 100);
            }, 100);
          }
        }
      }, 100);
    }

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
      if (isSameQuery) {
        this._makeFocus("next");
        return;
      }

      // Nuova query: resetta e scrolla al primo elemento
      this.currentIndex.set(0);
      this.previousQuery.set(p => ({ ...p, value: query.value, caseSensitive: query.caseSensitive, wholeWord: query.wholeWord }));

      // Sposta il focus sul primo input trovato
      if (this.foundIndices.length > 0) {
        this._makeFocus("next");
      }
    };

    // Vai all'occorrenza precedente
    previous() {
      if (this.foundIndices.length === 0) return;
      this._makeFocus("previous");
    };

    // Vai all'occorrenza successiva
    next() {
      if (this.foundIndices.length === 0) return;
      this._makeFocus("next");
    };

    // SOSTITUZIONE
    replaceQuery = useDotNotation("");

    replaceAll(targets: FoundOccurrence[] = this.foundIndices) {
      if (targets.length === 0) 
        return console.error("[replaceAll] Nessuna occorrenza da sostituire.");
      
      const replaceText = this.replaceQuery.get;
      const search = this.search.get;

      if (!book.get) return console.error("Libro non disponibile.");
      

      // Funzione per sfuggire i caratteri speciali in una stringa per RegExp
      function escapeRegExp(string: string): string {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      }

      // Clona il libro una volta sola
      const bookClone = structuredClone(book.get);
      const sec = getSection(bookClone);

      if (!sec?.paragraphs) {
        console.error("[replaceAll] Sezione senza paragrafi.");
        return;
      }

      // Itera su tutte le occorrenze target
      targets.forEach((occurrence, targetIndex) => {
        // Costruisci la regex usando la query originale
        const escapedSearchValue = escapeRegExp(search.value);
        const regexFlags = search.caseSensitive ? "g" : "gi";
        const regex = search.wholeWord
          ? new RegExp(`\\b${escapedSearchValue}\\b`, regexFlags)
          : new RegExp(escapedSearchValue, regexFlags);


        // Sostituisci nel titolo della sezione
        if (occurrence.type === 'section-title') {
          let title = sec.title;
          const newTitle = title.replace(regex, replaceText);
          sec.title = newTitle;

        // Sostituisci nei paragrafi
        } else {
          const paragraph = sec.paragraphs?.[occurrence.index];
          if (!paragraph) {
            console.error(`[replaceAll] Paragrafo non trovato all'indice ${occurrence.index}.`);
            return;
          }

          if (occurrence.type === 'text') {
            let text = paragraph.text;
            const newText = text.replace(regex, replaceText);
            paragraph.text = newText;

            // Aggiorna l'interfaccia
            PARAG.update(occurrence.index, "text", newText, true);

          } else if (occurrence.type === 'style') {
            let style = paragraph.in_style || "";
            const newStyle = style.replace(regex, replaceText);
            paragraph.in_style = newStyle;

            // Aggiorna l'interfaccia
            PARAG.update(occurrence.index, "in_style", newStyle, false);
          }
        }
      });

      // Salva una volta sola su database
      bookContext.updateBook(book_id, bookClone);
      toast.success("Sostituite tutte le occorrenze");

      // Reimposta la ricerca per aggiornare gli indici
      this.currentIndex.set(0); 
      this.executeSearch();
    };

    // Sostituisce la prima occorrenza
    replace() {
      const currentIndex = this.currentIndex.get;
      const replaceText = this.replaceQuery.get;
      const search = this.search.get;

      if (this.foundIndices.length === 0 || currentIndex >= this.foundIndices.length) {
        console.error("[replace] Nessuna occorrenza valida da sostituire.");
        return;
      }

      // Chiama replaceAll con un array contenente solo l'occorrenza corrente
      this.replaceAll([this.foundIndices[currentIndex]]);

      // Vai alla prossima occorrenza
      const updatedIndex = this.currentIndex.get;
      if (this.foundIndices.length > 0 && updatedIndex < this.foundIndices.length) {
        const nextOccurrence = this.foundIndices[updatedIndex];
        setTimeout(() => {
          if (nextOccurrence.type === 'section-title') {
            const titleInput = document.getElementById("section-title") as HTMLInputElement;
            if (titleInput) {
              titleInput.focus();
            }
          } else {
            const inputId = nextOccurrence.type === 'text'
              ? `${nextOccurrence.index}>text`
              : `${nextOccurrence.index}>in_style`;
            const nextInput = document.getElementById(inputId) as HTMLTextAreaElement;
            if (!nextInput) return;
            if (nextOccurrence.type === 'style') {
              GROUPS.setStyleInput(nextOccurrence.index);
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
        if(section_isEditMode) input?.focus();
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
    SHARED: new SharedFeatures(),
    PARAG,
    GROUPS,
    FIND_REPLACE: new FIND_REPLACE(),
    canRead, canWrite, section_isEditMode,

    HISTORY: new HISTORY(),
    MARCKERS: new MARCKERS(),
    NAVIGATION: new NAVIGATION()
  };
}