"use client";

import Link from "next/link";
import Navbar from "../shareds/navbar";
import { useEffect, useState } from "react";
import { BOOKS_DATA } from "../tools/_transformBooksDatas";

export default function Home() {
  const books = BOOKS_DATA;
  const [weight, setWeight] = useState(0);
  const [limit, setLimit] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setWeight(window.innerWidth);
      setLimit(Math.floor(window.innerWidth / 10));
    };
    handleResize();
    // aggiunge e rimuove l'event listener per il ridimensionamento
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function ellipsis(text: string) {
    return (weight > 350) ? text : text.slice(0, limit) + "...";
  }

  return (
    <main id="home">
      <Navbar />
      <section className="p-2 mx-auto container">

        <div className="text-center">
          <h1 className="text-2xl font-bold">Libri</h1>
          <p className="text-gray-400">Totale: {books.length} libri</p>
        </div>

        <ol className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {books.map((book) => (
            <li key={book.title} className="bg-white/10 hover:bg-white/30 transition-colors rounded-lg">
              <Link href={`/book/${book.id}`} className="p-2 block text-center">
                <h4 className="font-bold">{book.title}</h4>
                <p className="pb-2 mb-2 border-b border-gray-500 italic text-xs">
                  By "{book.author}"
                </p>
                <p className="text-sm">{ellipsis(book.description)}</p>
              </Link>
            </li>
          ))}
        </ol>

      </section>
    </main>
  );
}