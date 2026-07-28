import * as v from "valibot";

/*
Gerarchie 
* Libro     file.md
* Parte     #
* Sezione   X Non usato
* Capitolo  ##
* Paragrafo ••••
* Frase     •••••
*/

export const paragraph_schema = v.object({
  style: v.optional(v.string()),
  pre_text: v.optional(v.string()),
  text: v.string(),
  post_text: v.optional(v.string()),
});

export const section_schema = v.object({
  title: v.string(),
  paragraphs: v.array(paragraph_schema),
});

export const parts_schema = v.object({
  title: v.string(),
  sections: v.array(section_schema),
});

export const book_schema = v.object({
  id: v.optional(v.number()),
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
