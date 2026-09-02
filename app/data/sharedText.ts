import { Book, Part, Section, Paragraph } from "../schemas/book_schema";
import { useBookContext } from "./BookContext";
import { toast } from "../tools/feedbacksUI";

export default function useSharedText() {
  const bookContext = useBookContext();

  // Helper: Copy text to clipboard with fallback for browser compatibility
  async function copyToClipboard(text: string): Promise<boolean> {
    // Try modern Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.warn("Clipboard API failed, trying fallback:", err);
      }
    }

    // Fallback for browsers that don't support Clipboard API
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-999999px';
      textarea.style.top = '-999999px';
      document.body.appendChild(textarea);
      textarea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      return successful;
    } catch (err) {
      console.error("Fallback copy failed:", err);
      return false;
    }
  }

  // Helper: Read text from clipboard with fallback for browser compatibility
  async function readFromClipboard(): Promise<string | null> {
    // Try modern Clipboard API first
    if (navigator.clipboard && navigator.clipboard.readText) {
      try {
        return await navigator.clipboard.readText();
      } catch (err) {
        console.warn("Clipboard API read failed, trying fallback:", err);
      }
    }

    // Fallback for browsers that don't support Clipboard API
    try {
      const textarea = document.createElement('textarea');
      textarea.style.position = 'fixed';
      textarea.style.left = '-999999px';
      textarea.style.top = '-999999px';
      document.body.appendChild(textarea);
      textarea.select();
      const successful = document.execCommand('paste');
      document.body.removeChild(textarea);

      if (successful) {
        return textarea.value;
      }
      return null;
    } catch (err) {
      console.error("Fallback paste failed:", err);
      return null;
    }
  }

  // Helper: Detect content type (JSON or Markdown)
  function detectContentType(input: string): 'json' | 'markdown' | 'unknown' {
    const isJson = ["{", "}", "[", "]"].every(char => input.includes(char));
    const isMarkdown = ["###"].some(markdown => input.includes(markdown));

    if (isJson) return 'json';
    if (isMarkdown) return 'markdown';
    return 'unknown';
  }

  // Funzione per convertire un libro in testo (Markdown o normale)
  function book_to_text(data: Book, isMarkdownFormat = false) {
    let result = `${isMarkdownFormat ? "# " : ""}${data.title}\n\n`;
    if (data.description) {
      result += `(${data.description})\n\n`;
    }
    for (const part of data.parts || []) {
      result += `${isMarkdownFormat ? "## " : ""}${part.title}\n\n`;
      if (part.note) {
        result += `(${part.note})\n\n`;
      }
      for (const section of part.sections || []) {
        result += `${isMarkdownFormat ? "### " : ""}${section.title}\n\n`;
        if (section.note) {
          result += `(${section.note})\n\n`;
        }
        for (const paragraph of section.paragraphs || []) {
          result += `${paragraph.text}\n\n`;
        }
      }
    }
    return result;
  }


  // Funzione per convertire Markdown in una Sezione (già fornita)
  function md_to_section(inputSection: string): Section {
    const newSection: Section = {
      id: bookContext.createId(),
      title: "",
      note: "",
      paragraphs: [],
    };

    inputSection.split("\n").forEach((_p) => {
      const p = _p.trim();
      if (!p) return;

      // Titolo della sezione (###)
      if (p.startsWith("### ")) {
        newSection.title = p.replace("### ", "");
      }
      // Note della sezione ((...))
      else if (p.startsWith("(") && p.endsWith(")")) {
        newSection.note = p.slice(1, -1);
      }
      // Paragrafo
      else {
        newSection?.paragraphs?.push({
          id: bookContext.createId(),
          in_style: p.startsWith("* ") ? "dialogo sinistra" : "",
          text: p.replace("* ", ""),
          isMarcked: false,
        });
      }
    });
    return newSection;
  }

  // Funzione per convertire Markdown in una Parte
  function md_to_part(inputPart: string): Part | null {
    const newPart: Part = {
      id: bookContext.createId(),
      title: "",
      note: "",
      sections: [],
    };

    console.log("[MD_TO_PART] Input:", inputPart);

    // Divide l'input per "###" per separare le sezioni
    const sections = inputPart.split("###").slice(1); // Ignora la prima parte (titolo/note della parte)
    console.log("[MD_TO_PART] Sezioni trovate:", sections.length);

    // Estrae titolo e note della parte (prima del primo "###")
    const partHeader = inputPart.split("###")[0].trim();
    console.log("[MD_TO_PART] Header parte:", partHeader);
    
    partHeader.split("\n").forEach((line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      // Titolo della parte (##)
      if (trimmedLine.startsWith("## ")) {
        newPart.title = trimmedLine.replace("## ", "");
      }
      // Note della parte ((...))
      else if (trimmedLine.startsWith("(") && trimmedLine.endsWith(")")) {
        newPart.note = trimmedLine.slice(1, -1);
      }
    });

    console.log("[MD_TO_PART] Titolo parte:", newPart.title);

    // Se la parte non ha un titolo valido, ritorna null
    if (!newPart.title || newPart.title.trim().length === 0) {
      console.log("[MD_TO_PART] Parte senza titolo, ritorna null");
      return null;
    }

    // Elabora ogni sezione
    sections.forEach((sectionText) => {
      console.log("[MD_TO_PART] Elaborazione sezione:", sectionText.substring(0, 50));
      // Ricostruisci il testo della sezione aggiungendo "###" all'inizio
      const fullSectionText = `###${sectionText}`;
      const section = md_to_section(fullSectionText);
      console.log("[MD_TO_PART] Sezione creata:", section);
      newPart.sections.push(section);
    });

    console.log("[MD_TO_PART] Parte finale:", newPart);
    return newPart;
  }

  // Funzione per convertire Markdown in un Libro
  function md_to_book(input: string): Book {
    const newBook: Book = {
      id: bookContext.createId(),
      title: "",
      description: "",
      author_name: "Autore sconosciuto", // Valore di default per soddisfare lo schema
      parts: [],
      auth_read: "",
      auth_write: "",
    };

    console.log("[MD_TO_BOOK] Input completo:", input);

    // Trova tutte le posizioni di "## " (all'inizio di una riga) per separare le parti correttamente
    const partMatches = [];
    let match;
    const regex = /(?:^|\n)## /g;
    while ((match = regex.exec(input)) !== null) {
      // Aggiungi 1 se è all'inizio della riga (dopo \n) per saltare il \n
      partMatches.push(match.index + (match[0].startsWith('\n') ? 1 : 0));
    }
    console.log("[MD_TO_BOOK] Posizioni delle parti ##:", partMatches);

    // Estrai l'header del libro (prima della prima "##")
    const firstPartIndex = partMatches.length > 0 ? partMatches[0] : input.length;
    const bookHeader = input.substring(0, firstPartIndex).trim();
    console.log("[MD_TO_BOOK] Header libro:", bookHeader);

    bookHeader.split("\n").forEach((line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      // Titolo del libro (#)
      if (trimmedLine.startsWith("# ")) {
        newBook.title = trimmedLine.replace("# ", "");
      }
      // Descrizione del libro ((...))
      else if (trimmedLine.startsWith("(") && trimmedLine.endsWith(")")) {
        newBook.description = trimmedLine.slice(1, -1);
      }
    });

    // Se il titolo è troppo corto, usa un default
    if (newBook.title.length < 2) {
      newBook.title = "Senza titolo";
    }

    // Estrai ogni parte con tutto il suo contenuto (incluse le sezioni ###)
    for (let i = 0; i < partMatches.length; i++) {
      const startIndex = partMatches[i];
      const endIndex = i < partMatches.length - 1 ? partMatches[i + 1] : input.length;
      const partText = input.substring(startIndex, endIndex).trim();
      console.log("[MD_TO_BOOK] Parte estratta:", partText.substring(0, 100));

      const part = md_to_part(partText);
      if (part) {
        newBook.parts?.push(part);
      }
    }

    console.log("[MD_TO_BOOK] Libro finale:", newBook);
    return newBook;
  }

  // Funzione unificata per upload che rileva automaticamente se è JSON o Markdown
  async function upload(): Promise<void> {
    try {
      // Crea un input file che accetta entrambi i formati
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json,.md,application/json,text/markdown";

      input.onchange = async () => {
        const files = Array.from(input.files ?? []);
        if (files.length === 0) return;

        const file = files[0];
        console.log("[UPLOAD] File selezionato:", file.name, file.type);

        const text = await file.text();
        console.log("[UPLOAD] Contenuto del file (prime 200 caratteri):", text.substring(0, 200));

        // Rileva il tipo di file dall'estensione o dal contenuto
        const isJson = file.name.endsWith('.json') || file.name.endsWith('.json') ||
                       (file.type === 'application/json') ||
                       (text.trim().startsWith('{') && text.trim().endsWith('}'));

        console.log("[UPLOAD] Rilevato come JSON:", isJson);

        let book: Book;

        if (isJson) {
          // Parse JSON
          try {
            const jsonData = JSON.parse(text);
            book = jsonData as Book;
            console.log("[UPLOAD] Book da JSON:", book);
          } catch (err) {
            console.error("[UPLOAD] Errore parsing JSON:", err);
            toast.danger("Errore nel parsing del file JSON");
            return;
          }
        } else {
          // Parse Markdown
          console.log("[UPLOAD] Parsing Markdown...");
          book = md_to_book(text);
          console.log("[UPLOAD] Book da Markdown:", book);
        }

        // Valida il libro
        console.log("[UPLOAD] Validazione del libro...");
        const validatedBook = bookContext.validateBook(book);
        console.log("[UPLOAD] Libro validato:", validatedBook);

        if (!validatedBook) {
          console.error("[UPLOAD] Validazione fallita per il book:", book);
          toast.danger("Formato del libro non valido");
          return;
        }

        // Genera nuovo ID se esiste già
        const existingBook = bookContext.readAll().find((b) => b.id === validatedBook.id);
        if (existingBook) {
          console.log("[UPLOAD] ID esistente, generazione nuovo ID");
          validatedBook.id = bookContext.createId();
        }

        // Aggiungi il libro
        console.log("[UPLOAD] Aggiunta del libro alla lista...");
        const result = bookContext.addBook(validatedBook);
        console.log("[UPLOAD] Risultato addBook:", result);

        if (!result) {
          console.error("[UPLOAD] Errore durante addBook");
          toast.danger("Errore durante il caricamento del libro");
          return;
        }

        toast.success("Libro caricato con successo");
      };

      input.click();
    } catch (err) {
      console.error("Errore durante l'upload:", err);
      toast.danger("Errore durante l'upload");
    }
  }

  // Copy a part to clipboard
  async function copy_part(part: Part): Promise<boolean> {
    try {
      const json = JSON.stringify(part, null, 4);
      const successful = await copyToClipboard(json);
      if (successful) {
        toast.success("Parte copiata con successo!");
      } else {
        toast.danger("Impossibile copiare. Il browser potrebbe non supportare questa funzione.");
      }
      return successful;
    } catch (err) {
      console.error("Errore nella copia della parte:", err);
      toast.danger("Errore nella copia della parte");
      return false;
    }
  }

  // Copy a section to clipboard
  async function copy_section(section: Section): Promise<boolean> {
    try {
      const json = JSON.stringify(section, null, 4);
      const successful = await copyToClipboard(json);
      if (successful) {
        toast.success("Sezione copiata con successo!");
      } else {
        toast.danger("Impossibile copiare. Il browser potrebbe non supportare questa funzione.");
      }
      return successful;
    } catch (err) {
      console.error("Errore nella copia della sezione:", err);
      toast.danger("Errore nella copia della sezione");
      return false;
    }
  }

  // Paste content and convert to Part
  async function paste_part(): Promise<Part | null> {
    const input = await readFromClipboard();
    if (!input) {
      toast.danger("Impossibile incollare. Il browser potrebbe non supportare questa funzione.");
      return null;
    }

    const contentType = detectContentType(input);

    if (contentType === 'json') {
      try {
        const newPart: Part = JSON.parse(input);
        if (!newPart || !newPart.sections) {
          console.error("Parte non valida");
          toast.danger("Parte non valida");
          return null;
        }
        // Assicura che tutti i paragrafi abbiano isMarcked
        newPart.sections.forEach(section => {
          section.paragraphs?.forEach(p => {
            if (p.isMarcked === undefined) {
              p.isMarcked = false;
            }
          });
        });
        toast.success("Parte incollata con successo!");
        return newPart;
      } catch (err) {
        console.error("Errore nell'incollaggio JSON:", err);
        toast.danger("Errore nell'incollaggio");
        return null;
      }
    } else if (contentType === 'markdown') {
      const newPart = md_to_part(input);
      if (!newPart || !newPart.sections) {
        console.error("Parte non valida");
        toast.danger("Parte non valida");
        return null;
      }
      toast.success("Parte incollata con successo!");
      return newPart;
    } else {
      toast.danger("Formato non riconosciuto. Usa JSON o Markdown.");
      return null;
    }
  }

  // Paste content and convert to Section
  async function paste_section(): Promise<Section | null> {
    const input = await readFromClipboard();
    if (!input) {
      toast.danger("Impossibile incollare. Il browser potrebbe non supportare questa funzione.");
      return null;
    }

    const contentType = detectContentType(input);

    if (contentType === 'json') {
      try {
        const newSection: Section = JSON.parse(input);
        if (!newSection || !newSection.paragraphs) {
          console.error("Sezione non valida");
          toast.danger("Sezione non valida");
          return null;
        }
        // Assicura che tutti i paragrafi abbiano isMarcked
        newSection.paragraphs.forEach(p => {
          if (p.isMarcked === undefined) {
            p.isMarcked = false;
          }
        });
        toast.success("Sezione incollata con successo!");
        return newSection;
      } catch (err) {
        console.error("Errore nell'incollaggio JSON:", err);
        toast.danger("Errore nell'incollaggio");
        return null;
      }
    } else if (contentType === 'markdown') {
      const newSection = md_to_section(input);
      if (!newSection) {
        console.error("Sezione non valida");
        toast.danger("Sezione non valida");
        return null;
      }
      toast.success("Sezione incollata con successo!");
      return newSection;
    } else {
      toast.danger("Formato non riconosciuto. Usa JSON o Markdown.");
      return null;
    }
  }

  return {
    book_to_text,
    md_to_book,
    md_to_part,
    md_to_section,
    upload,
    copy_part,
    copy_section,
    paste_part,
    paste_section,
  };
}