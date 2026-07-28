import { Metadata } from "next";
import Chapter from "./Chapter";

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

  return <Chapter id={parseInt(id)} part={_parts} section={_section} />;
}