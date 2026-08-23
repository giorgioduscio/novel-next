import * as v from "valibot";

/*
Gerarchie 
* Libro     
* Parte     
* Sezione   
* Capitolo  
* Paragrafo 
* Frase     
*/

const not_allowed_styles = [
  // Display
  "inline",
  "block",
  "inline-block",
  "flex",
  "inline-flex",
  "table",
  "inline-table",
  "table-caption",
  "table-cell",
  "table-column",
  "table-column-group",
  "table-footer-group",
  "table-header-group",
  "table-row-group",
  "table-row",
  "flow-root",
  "grid",
  "inline-grid",
  "contents",
  "list-item",
  "hidden",

  // Position
  "static",
  "fixed",
  "absolute",
  "relative",
  "sticky",

  // Z-index
  "z-",

  // Float / clear
  "float-",
  "clear-",

  // Overflow
  "overflow-",
  "overscroll-",

  // Flexbox
  "flex-",
  "grow",
  "grow-",
  "shrink",
  "shrink-",
  "basis-",
  "order-",
  "justify-",
  "items-",
  "content-",
  "self-",
  "place-",

  // Grid
  "grid-",
  "col-",
  "row-",
  "auto-cols-",
  "auto-rows-",

  // Gap
  "gap-",
  "gap-x-",
  "gap-y-",

  // Typography — behavior/structure
  "font-",
  "leading-",
  "tracking-",
  "align-",
  "whitespace-",
  "break-",
  "hyphens-",
  "truncate",
  "text-ellipsis",
  "text-clip",

  // Visibility / interaction
  "visible",
  "invisible",
  "collapse",
  "pointer-events-",
  "select-",
  "resize",
  "cursor-",

  // Transitions / animation
  "transition",
  "transition-",
  "duration-",
  "ease-",
  "delay-",
  "animate-",

  // Transforms — except translate-
  "scale-",
  "rotate-",
  "skew-",
  "origin-",

  // Accessibility
  "sr-only",
  "not-sr-only",

  // Appearance / interaction
  "appearance-",
  "accent-",
  "caret-",
  "scroll-",
  "snap-",

  // Columns
  "columns-",

  // Aspect / object
  "aspect-",
  "object-",

  // Container
  "container",

  // Misc layout
  "box-",
  "isolate",
  "isolation-",
  "decoration-",
  "break-before-",
  "break-after-",
  "break-inside-",

  // Tables
  "border-collapse",
  "border-separate",
  "border-spacing-",
  "caption-",

  // Accessibility / forced colors
  "forced-color-adjust-",
] as const;

function validateStyle(v:string){
  if(v.trim().length === 0) return true;
  const classes = v.trim().split(" "); // tutte le classi tailwind
  // verifica se c'è almeno una classe che non appartiene a quelle permesse
  return classes.every((classe) => // verificare tutte le classi attuali
    // verificare che nessuna classe non permessa sia presente
    not_allowed_styles.every((style) => 
      // (classe attuale non deve contenere una delle classi non permesse)
      !classe.includes(style)) 
  );
}

export const paragraph_schema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  in_style: v.pipe(v.string(), 
    v.check((v) => validateStyle(v), "in_style: Solo stili standard o ornamentali")
  ),
  text: v.string(),
});

export const section_schema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  title: v.pipe(v.string(), v.minLength(3, "title: Il titolo della sezione deve contenere almeno 3 caratteri")),
  note: v.string(),
  paragraphs: v.optional(v.array(paragraph_schema)),
});

export const parts_schema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  title: v.pipe(v.string(), v.minLength(3, "title: Il titolo della parte deve contenere almeno 3 caratteri")),
  note: v.string(),
  sections: v.array(section_schema),
});

export const book_schema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  title: v.pipe(v.string(), v.minLength(3, "title: Il titolo deve contenere almeno 3 caratteri")),
  description: v.pipe(v.string(), v.minLength(3, "description: La descrizione deve contenere almeno 3 caratteri")),
  author: v.pipe(v.string(), v.minLength(3, "author: L'autore deve contenere almeno 3 caratteri")),
  parts: v.optional(v.array(parts_schema)),
});


// Interfaces
export type Book = v.InferOutput<typeof book_schema>;
export type Part = v.InferOutput<typeof parts_schema>;
export type Section = v.InferOutput<typeof section_schema>;
export type Paragraph = v.InferOutput<typeof paragraph_schema>;

