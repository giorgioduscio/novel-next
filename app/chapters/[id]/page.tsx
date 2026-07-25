import Link from "next/link";
import { redirect } from "next/navigation";
import "../_chapter.sass"; 

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Chapter({ params }: PageProps) {
  const { id } = await params;
  const chapterId = parseInt(id);
  
  // const chapter = chapters_data.find((chapter) => chapter.id === chapterId);
  const chapter = {};
  if(!chapter) {
    return redirect("/chapters");
  }

  return <>
    {/* NAVBAR */}
    <nav className="py-6">
      <div className="fixed w-full top-0 start-0 bg-gray-800">
        <div className="mx-auto container">

          <div className="p-2 py-3 flex items-center gap-2">
            <Link href="/chapters" className=""> 
              <i className="bi bi-arrow-left"></i> 
            </Link>

            {/* <h1 className="font-bold">{ chapter?.title }</h1> */}
          </div>

        </div>
      </div>
    </nav>

    {/* MAIN */}
    <main id="Chapter" className="mx-auto container">
        <section>

          <div className="">
            {/* {chapter.content.map((paragraph, index) => (
              <div className={`p-2 my-5 ${paragraph.style || ""}`} key={index} >

                {paragraph.pre_text && (
                  <div className="pb-1 mb-1 border-b border-gray-500 font-bold">{paragraph.pre_text}:</div>
                )}
                <div>{paragraph.text}</div>

              </div>
            ))} */}
          </div>

        </section>
    </main>
  </>;
}
