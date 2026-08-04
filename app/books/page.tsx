import { Metadata } from "next";
import Home from "./Books";

// Metadata (solo qui, in un Server Component)
export const metadata: Metadata = {
  title: "Libri Disponibili",
  description: "Esplora la collezione di libri e scopri i dettagli di ogni volume.",
};

export default function HomeRoute() {
  return <Home />;
}