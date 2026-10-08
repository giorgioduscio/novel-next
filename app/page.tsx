import Link from "next/link";
import Navbar from "./shareds/Navbar";

export default function Home() {
  const tools =[
    { name: 'Docker', icon: 'bi-box-seam' },
    { name: 'Next.js', icon: 'bi-lightning' },
    { name: 'TailwindCSS', icon: 'bi-palette' },
    { name: 'TypeScript', icon: 'bi-code-slash' },
    { name: 'Valibot', icon: 'bi-shield-check' },
    { name: 'Bootstrap Icons', icon: 'bi-bootstrap' }
  ];
  
  return (
    <main id="Home" className="">
      <Navbar page_title="Home" />

      {/* Hero Section */}
      <section className="mx-auto container max-w-[800px]">
        <div className="flex flex-col items-center justify-center px-4 py-16">
          <div className="max-w-3xl text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-lime-400">
              Novel <code>Next</code>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white">
              Crea e leggi novelle con un tocco fumettistico
            </p>
            <p className="text-lg mb-12 text-white">
              Un'applicazione per dare vita alle tue storie, con uno stile unico e divertente che richiama il mondo dei fumetti.
            </p>

            <div className="mx-auto w-fit text-xl text-black font-bold">
              <div className="flex flex-wrap rounded overflow-hidden">
                <Link href="/books"
                      className="flex-auto px-3 py-2 text text-bg-primary">
                  <i className="bi bi-book me-2"></i>
                  Inizia a leggere
                </Link>

                <Link href="/auth"
                      className="flex-auto px-3 py-2 text text-bg-tertiary">
                  <i className="bi bi-person-vcard-fill me-2"></i>
                  Codici
                </Link>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="text-bg-secondary">
        <div className="py-12 px-4">
          <div className="max-w-max mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center text-lime-400">Tecnologie utilizzate</h2>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {tools.map((tech, index) => (
                <button key={index}
                        className="p-2 py-6 text-bg-dark text-center rounded">
                  <i className={`bi ${tech.icon} text-3xl mb-3`}></i>
                  <p className="font-semibold text-lg">{tech.name}</p>
                </button>
              ))}
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}
