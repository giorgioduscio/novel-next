"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBooks } from "../data/BookContext";

interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrent: boolean;
}

export function Breadcrumb() {
  const pathname = usePathname();
  const bookStore = useBooks();

  const segments = pathname.split("/").filter(Boolean);
  const items: BreadcrumbItem[] = [
    {
      label: "Home",
      href: "/",
      isCurrent: false,
    },
  ];

  // se ha uno slash, imposta come books
  if (segments[0] === "books") {
    items.push({
      label: "Libri",
      href: "/books",
      isCurrent: segments.length === 1,
    });

  // se ne ha un'altro, imposta come book
  } else if (segments[0] === "book") {
    items.push({
      label: "Libri",
      href: "/books",
      isCurrent: false,
    });

    const bookId = Number(segments[1]);
    if (!isNaN(bookId) && segments[1]) {
      const book = bookStore.getBookById ? bookStore.getBookById(bookId) : undefined;
      const bookTitle = book?.title || `Libro`;
      const bookHref = `/book/${bookId}`;

      items.push({
        label: bookTitle,
        href: bookHref,
        isCurrent: segments.length === 2,
      });

      if (segments[2]) {
        // Nome della Parte (es. Parte-1 -> Parte 1)
        const rawPart = decodeURIComponent(segments[2]).replaceAll("-", " ");
        items.push({
          label: rawPart,
          href: bookHref,
          isCurrent: segments.length === 3,
        });

        if (segments[3]) {
          // Nome della Sezione (es. Sezione-1 -> Sezione 1)
          const rawSection = decodeURIComponent(segments[3]).replaceAll("-", " ");
          const sectionHref = `/book/${bookId}/${segments[2]}/${segments[3]}`;
          items.push({
            label: rawSection,
            href: sectionHref,
            isCurrent: true,
          });
        }
      }
    }

  } else {
    // Gestione generica per altre rotte
    let currentPath = "";
    segments.forEach((seg, i) => {
      currentPath += `/${seg}`;
      const decoded = decodeURIComponent(seg).replaceAll("-", " ");
      const formattedLabel = decoded.charAt(0).toUpperCase() + decoded.slice(1);
      items.push({
        label: formattedLabel,
        href: currentPath,
        isCurrent: i === segments.length - 1,
      });
    });
  }

  return (
    <nav aria-label="Breadcrumb" className="p-2 bg-gray-900 text-xs sm:text-sm">
      <ol className="mx-auto container max-w-[400px] flex items-center flex-wrap gap-2 text-gray-400">
        {items.map((item, index) => 
            <li key={index} className="flex items-center gap-1 min-w-0">
              {index > 0 && 
                <i className="bi bi-chevron-right text-gray-500 mx-0.5 shrink-0"></i>
              }

              {item.isCurrent ? (
                <span className="text-blue-400 font-semibold truncate max-w-[130px]" title={item.label}>
                  {index === 0 && 
                    <i className="bi bi-house-door-fill me-1"></i>
                  }
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-white transition-colors truncate max-w-[110px]"
                  title={item.label}
                >
                  {index === 0 && 
                    <i className="bi bi-house-door-fill me-1"></i>
                  }
                  {item.label}
                </Link>
              )}
            </li>
        )}
      </ol>
    </nav>
  );
}