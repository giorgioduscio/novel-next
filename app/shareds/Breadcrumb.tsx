"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import useBookHook from "../data/useBookHook";

export function Breadcrumb() {
  const pathname = usePathname();
  const bookStore = useBookHook();

  // converte l'url nel breadcrumb
  function buildRoutes() {
    const routes = [{ label:"Home", url:'/', icon:"bi-house" }];
    
    // aggiunge i segmenti dell'url
    let url=''; // url crescente
    
    pathname.split("/").filter(Boolean).forEach((segment, segment_i) => {

      // cliccare la parte rimanda al libro, 
      // le pagine delle parti sono dedicate anche alle sezioni
      const previousUrl = url; 
      url += `/${segment}`;

      routes.push({
        label: convertLabel(segment),
        url: segment_i===2 ?previousUrl :url,
        icon: "",
      })
    })
    
    return routes;
  }

  // converte parti dell'url in label comprensibili
  function convertLabel(segment: string): string {
    if (segment === "books") return "Libri";

    // verifica se è un UUID (formato xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(segment)) {
      // è un UUID, quindi è un book
      const book = bookStore.getBookById(segment);
      if(book) return book.title;
    }
    return segment .replaceAll('-', ' ');
  }

  const routes = buildRoutes();

  return (
    <nav aria-label="Breadcrumb" className="p-2 bg-indigo-900 text-sm">
      <ol className="mx-auto container max-w-[800px] flex items-center flex-wrap gap-2 text-gray-400">
        {routes.map((route, index) => (
          <li key={index}>
            {index > 0 && 
              <i className="bi bi-chevron-right me-1"></i>
            }
            
            <Link
              href={route.url}
              className="active:text-white transition-colors truncate max-w-[110px]"
              title={`Torma a ${route.label}`}
              aria-disabled={route.url === pathname}
            >
              {route.icon && 
                <i className={`me-2 bi ${route.icon}`}></i>
              }
              {route.label}
            </Link>
          </li>
        ))}
      </ol>
      
    </nav>
  );
}