import Link from "next/link";
import React from "react";
import Navbar from "../shareds/navbar";
import "./_chapters.sass";

export const metadata = {
  title: "Capitoli",
};

export default function Chapters() {
  const chapters: any[] = [];

  return (
    <main id="Chapters" className="mx-auto pb-5 container max-w-4xl">
      <Navbar />

      <div className="py-5 text-center">
        <h1 className="text-3xl font-bold">Capitoli</h1>
        <div>{chapters.length} capitoli</div>
      </div>

      <ol className="p-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {chapters.map((chapter, i, array) => <React.Fragment key={chapter.id}>

          {chapter.section!==array[i-1]?.section && 
            <li className="col-span-full text-center text-lg font-semibold py-2">{chapter.section}</li>
          }
          
          <li className="bg-white/10 rounded-lg shadow hover:bg-white/20 transition-colors">
            <Link href={`/chapters/${chapter.id}`} 
                  className="p-2 py-5 flex flex-col items-center gap-1">
              
              <i className={`bi bi-${chapter.icon} text-4xl`}></i>
              <div>{chapter.title}</div>

            </Link>
          </li>
        </React.Fragment>)}
      </ol>

    </main>
  );
}