import { Metadata } from "next";
import { redirect } from "next/navigation";
import Chapter from "./Chapter";
import { Section } from "@/app/schemas/_book_schema";
import { BOOKS_DATA } from "@/app/tools/_transformBooksDatas";

export const metadata: Metadata = {
  title: "Capitolo",
  description: "Capitolo",
};

interface ChapterServerProps {
  params: Promise<{
    id: string;
    part: string;
    section: string;
  }>;
}

export default async function ChapterServer({ params }: ChapterServerProps) {
  const { id, part, section } = await params;
  const _parts = part.replaceAll("-", " ");
  const _section = section.replaceAll("-", " ");

  const chapter = BOOKS_DATA .find((b) => b.id === parseInt(id))
                  ?.parts.find((p) => p.title === _parts)
                  ?.sections.find((s) => s.title === _section);

  if(!chapter) {
    return redirect(`/book/${id}`);
  }
  
  return <Chapter chapter={chapter as Section} />;
}