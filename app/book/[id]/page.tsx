import { Metadata } from "next";
import BookComponent from "@/app/book/[id]/Book";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export const metadata: Metadata = {
  title: "Book",
  description: "Mostra i libri"
};

export default async function Book({ params }: PageProps) {
  const paramsData = await params;
  const id = parseInt(paramsData.id);

  return <BookComponent id={id} />;
}
