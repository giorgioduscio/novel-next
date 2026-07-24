import { Chapter } from "@/app/schemas/chapter_schema";

export const chapters_data = Object.freeze<Chapter[]>([
  {
    id: 1,
    title: "Chapter 1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    content: [
      {
        text: "Once upon a time...",
        style: "normal"
      },
      {
        text: "There was a dragon.",
      },
      {
        text: "And then there was a knight.",
        style: "normal",
        pre_text: "Diego"
      }
    ]
  },
  {
    id: 2,
    title: "Chapter 2",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    content: [
      {
        text: "The knight defeated the dragon.",
        style: "normal"
      }
    ]
  }
]);
