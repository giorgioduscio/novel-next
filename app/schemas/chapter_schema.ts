import * as v from "valibot";

/*
Gerarchie 
* Libro     •
* Parte     ••
* Sezione   
* Capitolo  •••
* Paragrafo ••••
* Frase     •••••
*/

export const paragraph_schema = v.object({
  style: v.optional(v.string()),
  text: v.string(),

  phrases: v.array(v.object({
    style: v.optional(v.string()),
    text: v.string(),
  })),
});

export const chapter_schema = v.object({
  title: v.string(),
  paragraphs: v.array(paragraph_schema),
});

export const parts_schema = v.object({
  title: v.string(),
  sections: v.array(chapter_schema),
});

export const book_schema = v.object({
  id: v.number(),
  title: v.string(),
  description: v.string(),
  author: v.string(),
  parts: v.array(parts_schema),
});


// Interfaces
export type Chapter = v.InferOutput<typeof chapter_schema>;
export type Book = v.InferOutput<typeof book_schema>;