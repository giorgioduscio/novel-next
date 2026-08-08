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
  const parsedParts = part.replaceAll("-", " ");
  const parsedSection = section.replaceAll("-", " ");

  return <SectionComponent book_id={parseInt(id)} part_title={parsedParts} section_title={parsedSection} />;
}