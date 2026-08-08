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

const allowed_styles = [
  "w-", "h-",
  "m-", "my-", "mx-", "mt-", "mb-", "ml-", "mr-", 
  "p-", "py-", "px-", "pt-", "pb-", "pl-", "pr-", 
  "text-", "border", "bg-", "outline", "shadow",
  "translate-", "rounded", "slash-",
  "full-", "mini", "comix" // custom classes
] as const;


function validateStyle(v:string){
  if(v.trim().length === 0) return true;
  const classes = v.trim().split(" "); // tutte le classi tailwind
  // verifica se c'è almeno una classe che non appartiene a quelle permesse
  return classes.every((classe) => // verificare tutte le classi attuali
    allowed_styles.some((style) => // verificare almeno una classe permessa
      // verifica corrispondenza 
      classe.includes(style)) // (classe attuale deve contenere una delle classi permesse)
  );
}

export const paragraph_schema = v.object({
  ex_style: v.optional(v.pipe(v.string(), 
    v.check((v) => validateStyle(v), "Solo stili ornamentali (m-, p-, text-, border-, bg-, outline-, shadow-, translate-)")
  )),
  in_style: v.optional(v.pipe(v.string(), 
    v.check((v) => validateStyle(v), "Solo stili ornamentali (m-, p-, text-, border-, bg-, outline-, shadow-, translate-)")
  )),
  pre_text: v.optional(v.string()),
  text: v.pipe(v.string(), v.minLength(3, "Deve contenere almeno 3 caratteri")),
});

export const section_schema = v.object({
  title: v.pipe(v.string(), v.minLength(3, "Deve contenere almeno 3 caratteri")),
  paragraphs: v.array(paragraph_schema),
});

export const parts_schema = v.object({
  title: v.pipe(v.string(), v.minLength(3, "Deve contenere almeno 3 caratteri")),
  sections: v.array(section_schema),
});

export const book_schema = v.object({
  id: v.number(),
  title: v.pipe(v.string(), v.minLength(3, "Il titolo deve contenere almeno 3 caratteri")),
  description: v.pipe(v.string(), v.minLength(3, "La descrizione deve contenere almeno 3 caratteri")),
  author: v.pipe(v.string(), v.minLength(3, "L'autore deve contenere almeno 3 caratteri")),
  parts: v.optional(v.array(parts_schema)),
});


// Interfaces
export type Book = v.InferOutput<typeof book_schema>;
export type Part = v.InferOutput<typeof parts_schema>;
export type Section = v.InferOutput<typeof section_schema>;
export type Paragraph = v.InferOutput<typeof paragraph_schema>;

