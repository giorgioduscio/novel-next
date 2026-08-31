import Link from "next/link";

export default function UnathorizeComponent() {
  return <>
    <div className="p-3">
      <div className="p-3 mx-auto max-w-fit bg-red-300 text-black border rounded">
        <div className="grid grid-cols-[auto_1fr]">
          <i className="bi bi-exclamation-triangle me-1"></i>
          <strong>Non hai i permessi per leggere questo libro.</strong> 
          <br />
          <Link href="/books" className="underline">Catalogo</Link>
        </div>
      </div>
    </div>
  </>
    
}