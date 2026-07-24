import * as v from "valibot";

export const chapter_schema = v.object({
  id: v.number(),
  title: v.string(),
  createdAt: v.string(),
  updatedAt: v.string(),
  // content  
  content: v.array(v.object({
    text: v.string(),
    style: v.optional(v.string()),
    pre_text: v.optional(v.string()),
  })),

});

export type Chapter = v.InferOutput<typeof chapter_schema>;