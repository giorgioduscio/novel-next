"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

interface routerProp {
  routes: string[]
}
export function Breadcrumb({routes}: routerProp) {
  const pathname = usePathname();
  
  const routesParsed = useMemo(()=>{
    let prev ="";
    
    const res = routes.map(route => {
      const [label, url, icon] = route.split(":");
      prev += url ||"";
      return {label, url: url? prev.replace("//","/") :"", icon: icon || ""};
    });
    
    // aggiunge sempre la home
    res.unshift({label:"Home", url:"/", icon:"bi-house"})
    
    return res;
  }, [routes])

  return (
    <nav aria-label="Breadcrumb" className="p-2 bg-indigo-900 text-sm">
      <ol className="mx-auto container max-w-[800px] flex items-center flex-wrap gap-2 text-gray-400">
        {routesParsed.map((route, index) => (
          <li key={index}>
            {index > 0 && 
              <i className="bi bi-chevron-right me-1"></i>
            }

            {(!route.url || route.url === pathname) ?(
              <span>{route.label}</span>

            ):(
              <Link
                href={route.url || ""}
                className="active:text-white transition-colors truncate max-w-[110px]"
                title={route.url ?`Torma a ${route.label}`: ''}
              >
                {route.icon && 
                  <i className={`me-2 bi ${route.icon}`}></i>
                }
                {route.label}
              </Link>
            )}            
          </li>
        ))}
      </ol>
      
    </nav>
  );
}