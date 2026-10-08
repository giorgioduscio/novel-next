import Link from "next/link";

export default function NotFound() {
  return (
    <main id="NotFound" className="flex-1 flex flex-col justify-center min-h-[80dvh]">
        
      <section className="max-w-[400px] mx-auto w-full">
        <div className="p-5 flex flex-wrap items-center justify-between">
          <strong className="text-3xl text-light">404</strong>
          <h1 className="text-3xl font-bold">Pagina non trovata</h1>
        </div>

        <p className="m-3 p-2 text-white border-l-4">
          <i className="bi bi-exclamation-triangle me-2"></i>
          La pagina che stai cercando non esiste o è stata spostata.
        </p>

        <div className="flex justify-center">
          <Link
            href="/books"
            className="mt-6 px-4 py-2 text-bg-primary text-white rounded-md"
          >
            Torna al catalogo
          </Link>
        </div>
      </section>
        
    </main>
  );
}