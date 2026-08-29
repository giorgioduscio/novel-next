import { Metadata } from "next";
import SectionComponent from "./SectionComponent";

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

  return <SectionComponent book_id={id} part_id={part} section_id={section} />;
}