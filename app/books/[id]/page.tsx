import { redirect } from "next/navigation";

interface BookPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BookPage({ params }: BookPageProps) {
  const { id } = await params;
  redirect(`/books/${id || ""}/structure`);
}

