import { Book, Part, Section, Paragraph } from "../schemas/_book_schema";
import { BOOKS_DATA_INPUT, InputBook } from "./_books_datas";


function isTailwindClass(str: string): boolean {
  const patterns = ["p-", "px-", "py-", "pl-", "pr-", "pt-", "pb-", 
                    "m-", "mx-", "my-", "ml-", "mr-", "mt-", "mb-", 
                    "b-", "bg-", "text-"];
  return patterns.some((pattern) => str.trim().includes(pattern));
}

/**
 * Trasforma un array di libri nel formato di input (`InputBook[]`)
 * in un array di libri nel formato di output (`Book[]`).
 * Ogni libro viene scomposto in parti, sezioni e paragrafi,
 * applicando le regole di trasformazione specifiche.
 */

function transformBooksData(input: InputBook[]): Book[] {
  return input.map((book) => {
    const transformedParts: Part[] = book.parts.map((part) => {
      const partTitle = Object.keys(part as object)[0];
      const sectionsInput = (part as any)[partTitle] as Array<{ [key: string]: string[][] }>;

      const transformedSections: Section[] = sectionsInput.map((section) => {
        const sectionTitle = Object.keys(section as object)[0];
        const paragraphsInput = (section as any)[sectionTitle] as string[][];
        const transformedParagraphs: Paragraph[] = paragraphsInput.map(transformParagraph);
        return { title: sectionTitle, paragraphs: transformedParagraphs };
      });

      return { title: partTitle, sections: transformedSections };
    });

    return {
      id: book.id,
      title: book.title,
      description: book.description,
      author: book.author,
      parts: transformedParts,
    };
  });
}

/**
 * Trasforma un paragrafo dal formato di input al formato di output.
 * 
 * Il formato di input è un array di stringhe dove:
 * - Il primo elemento può essere una classe Tailwind (style)
 * - Gli elementi successivi sono stringhe
 * - Le stringhe che terminano con ':' vanno in pre_text
 * - Le stringhe che iniziano con ':' vanno in post_text
 * - Le altre stringhe vanno in text
 * 
 * @param paragraphInput - Array di stringhe che rappresenta il paragrafo
 * @returns Paragraph - Oggetto con style, pre_text, text, post_text
 */
function transformParagraph(paragraphInput: string[]): Paragraph {
  // Verifica che l'input sia un array valido
  if (!Array.isArray(paragraphInput)) {
    throw new Error("Invalid paragraph input type");
  }

  // Separa il primo elemento dal resto
  const [firstElement, ...restElements] = paragraphInput;

  // Verifica se il primo elemento è una classe Tailwind
  const isStyle = typeof firstElement === "string" && isTailwindClass(firstElement);
  const style = isStyle ? firstElement : undefined;

  // Se il primo elemento è uno stile, usa il resto come contenuto
  // Altrimenti, usa tutto l'array come contenuto
  const contentElements = isStyle 
    ? restElements.filter(el => el !== undefined && el !== null && el !== "")
    : paragraphInput.filter(el => el !== undefined && el !== null && el !== "");

  // Caso semplice: se c'è solo una stringa, trattala come text del paragrafo
  if (contentElements.length === 1 && typeof contentElements[0] === "string") {
    return { style, text: contentElements[0] };
  }

  // Caso complesso: processa gli elementi per separare pre_text, text, post_text a livello di paragrafo
  let pre_text: string | undefined;  // Testo prima del paragrafo (es. nome personaggio)
  let post_text: string | undefined; // Testo dopo il paragrafo (es. azione narrativa)
  const textParts: string[] = [];     // Parti del testo principale del paragrafo

  // Itera su tutti gli elementi del contenuto (sono tutti stringhe)
  contentElements.forEach((element) => {
    if (typeof element === "string") {
      if (element.endsWith(":")) {
        // Stringa che termina con ':' → assegna a pre_text (rimuovendo il ':')
        pre_text = element.slice(0, -1);
      } else if (element.startsWith(":")) {
        // Stringa che inizia con ':' → assegna a post_text (rimuovendo il ':')
        post_text = element.slice(1);
      } else {
        // Stringa normale → aggiungi alle parti del testo
        textParts.push(element);
      }
    }
  });

  // Combina tutte le parti del testo in una singola stringa separata da spazi
  const text = textParts.join(" ");

  // Restituisci il paragrafo trasformato con tutte le proprietà
  return { style, text, pre_text, post_text };
}

export const BOOKS_DATA = transformBooksData(BOOKS_DATA_INPUT);

