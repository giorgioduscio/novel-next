import { Section } from "@/app/schemas/_book_schema";
import Frag from "@/app/shareds/Frag";
import Navbar from "@/app/shareds/navbar";


export default function Chapter({ chapter }: { chapter: Section }) {
  
  return (
    <main id="chapter">
      <Navbar />
      <section className="mx-auto container max-w-[400px]">
        
        {/* TITOLO */}
        <div className="p-3 py-5 text-center">
          <h1 className="text-3xl font-bold">{chapter.title}</h1>
        </div>
        <div className="m-3 border-y border-gray-500"></div>


        {/* PARAGRAFO */}
        <div className="pb-30">
          {chapter.paragraphs.map((p, paragraph_i) => (
            <div className="py-3 text-center" key={paragraph_i}>

              <Frag if={p.text==="---"}>
                <div className="mx-3 my-5 border-b border-gray-500"></div>
              </Frag>

              <Frag if={p.text!=="---"} className={"relative p-3 " + (p.style || "")}>
                <Frag if={!!p.pre_text}>
                  <div className="absolute w-fit top-0 start-1/2 -translate-x-1/2 rounded" 
                        style={{transform: 'translateY(-15px)', background:'inherit', borderWidth:'inherit'}}>
                    <div className="px-3 w-fit mx-auto font-bold">
                      {p.pre_text}
                    </div>
                  </div>
                </Frag>

                <p>{p.text}</p>
                
                <Frag if={!!p.post_text}>
                  <div className="pt-1 mt-1 border-t border-gray-500 text-sm">
                    {p.post_text}
                  </div>
                </Frag>

              </Frag>
            </div>
          ))}
        </div>
        {/* PARAGRAFO */}
      </section>
    </main>
  )
}