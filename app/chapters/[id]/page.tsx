import { chapters_data } from "../_chapters_data";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Chapter({ params }: PageProps) {
  const { id } = await params;
  const chapterId = parseInt(id);
  
  const chapter = chapters_data.find((chapter) => chapter.id === chapterId);

  return <>
    <main>

      {/* Pagina non trovata */}
      {!chapter ?(
        <div className="">Pagina non trovata</div>

      ):(
        <section>
          <div className="">
            <h1>Chapter {chapterId}</h1>
          </div>

          <div className="">
            {chapter.content.map((paragraph, index) => (
              <div key={index} className={paragraph.style || ""}>
                <strong>☻</strong>
                {paragraph.pre_text && (
                  <span>{paragraph.pre_text}:</span>
                )}
                <span>{paragraph.text}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  </>;
}
