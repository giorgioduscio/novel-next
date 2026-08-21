import Link from "next/link";
import Navigation from "./shareds/Navigation";

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
    <main id="Home" className="flex-1 flex flex-col">
      <Navigation page_title="Home" />

      <section className="mx-auto container max-w-[800px] shadow-xl md:border-x md:border-x-gray-800 flex-1 flex flex-col">
        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center px-4 py-16">
          <div className="max-w-3xl text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-orange-500">
              Novel <code>Next</code>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">
              Crea e leggi novelle con un tocco fumettistico
            </p>
            <p className="text-lg mb-12 text-gray-300">
              Un'applicazione per dare vita alle tue storie, con uno stile unico e divertente che richiama il mondo dei fumetti.
            </p>
            <Link 
              href="/books"
              className="inline-block bg-orange-400 text-gray-900 font-bold text-xl px-8 py-4 transition-all transform hover:scale-105 slash-x"
            >
              <i className="bi bi-book me-2"></i>
              Inizia a leggere
            </Link>
          </div>
        </div>

        {/* Tech Stack Section */}
        <section className="bg-indigo-800 py-12 px-4">
          <div className="max-w-max mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center text-orange-400" style={{ fontFamily: 'var(--font-bubblegum)' }}>
              🛠️ Tecnologie utilizzate
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {tools.map((tech, index) => (
                <div 
                  key={index}
                  className="p-2 py-6 bg-indigo-700 text-center hover:bg-indigo-600 transition-colors slash-y"
                >
                  <i className={`bi ${tech.icon} text-3xl text-orange-400 mb-3`}></i>
                  <p className="font-semibold text-lg">{tech.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
/*
@page.tsx implementa una homepage accattivante che 
* spieghi sinteticamente lo scopo del progetto: creare e leggere novelle con un tocco fumettistico
* inviti l'utente a leggere i libri
* in fonto alla pagina, una tabella con gli stumenti usati per sviluppare il progetto
  - docker
  - next.js
  - tailwindcss
  - typescript
  - valibot
  - bootstrap icons
*/