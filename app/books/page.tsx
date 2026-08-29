import { Metadata } from "next";
import BooksComponents from "./BooksComponent";

// Metadata (solo qui, in un Server Component)
export const metadata: Metadata = {
  title: "Catalogo Disponibili",
  description: "Esplora la collezione di libri e scopri i dettagli di ogni volume.",
};

export default function HomeRoute() {
  return <BooksComponents />;
}