import { BOOKS_DATA } from "@/app/tools/_transformBooksDatas";
import Link from "next/link";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Book({ params }: PageProps) {
  const id = parseInt((await params).id);
  
  const book = BOOKS_DATA.find((book) => book.id === id);
  if(!book) {
    return redirect("/");
  }

  function href(book_id: number, part: string, section: string) {
    part = part.replaceAll(" ", "-");
    section = section.replaceAll(" ", "-");
    return `/book/${book_id}/${part}/${section}`;
  }

  return <>
    {/* NAVBAR */}
    <nav className="py-6">
      <div className="fixed w-full top-0 start-0 bg-gray-800">
        <div className="mx-auto container">

          <div className="p-2 py-3 flex items-center gap-2">
            <Link href="/" className=""> 
              <i className="bi bi-arrow-left"></i> 
            </Link>

            <h1 className="font-bold">{ book.title }</h1>
          </div>

        </div>
      </div>
    </nav>

    {/* MAIN */}
    <main id="book" className="mx-auto container max-w-[400px]">
      <section>

        {/* LIBRO */}
        <div className="p-3 py-8 text-center">
          <div className="grid gap-5">
            <h1 className="text-3xl font-bold">{book.title}</h1>
            <p className="text-gray-400">{book.description}</p>
            <p className="text-gray-400">{book.author}</p>
          </div>
        </div>
        <div className="mx-3 border-y border-gray-500"></div>

        {/* PARTI */}
        <div className="py-3">
          <h2 className="p-2 text-2xl">Sezioni</h2>
          {book.parts.map((part, part_i) => (
            <div className="" key={part_i} >
              <h3 className="p-2 italic">{part.title}</h3>


              {/* SEZIONI */}
              <div className="">
                {part.sections.map((section, section_i) => (
                  <Link key={section_i} 
                        href={href(id, part.title, section.title)}
                        className="p-3 block bg-gray-800 hover:bg-gray-700 transition-colors">

                    <div className="flex justify-between items-center">
                      <h4>{section.title}</h4>
                      <i className="bi bi-chevron-right text-gray-400"></i>
                    </div>
                  </Link>
                ))}
              </div>
              {/* SEZIONI */}


            </div>
          ))}
        </div>
        {/* PARTI */}

      </section>
    </main>
  </>;
}
