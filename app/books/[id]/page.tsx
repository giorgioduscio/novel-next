import { Metadata } from "next";
import BookComponent from "@/app/books/[id]/BookComponent";

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
  const id = paramsData.id;

  return <BookComponent id={id} />;
}
