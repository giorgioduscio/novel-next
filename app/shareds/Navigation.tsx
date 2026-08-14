'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface NavigationProps {
  page_title: string;
  back_btn?: { icon?:string, label?:string, href:string };
}

export default function Navigation({ page_title, back_btn }: NavigationProps) {
  const [title, setTitle] = useState('');
  const pathname = usePathname();
  

  useEffect(()=>{
    setTitle(page_title || document.title);
  }, [pathname, page_title]);
  
  return (
    <nav className="sticky top-0 z-50">
      <div className="w-full bg-gray-800">
        <div className="mx-auto container max-w-[800px]">
          <div className="flex items-center">

            {/* se esiste almeno l'href */}
            {(back_btn && back_btn.href) &&(
              <Link href={back_btn.href} className="p-3 bg-gray-800 truncate">
                <i className={`${back_btn.icon || 'bi-chevron-left'} bi me-1`}></i>
                <span>{back_btn.label ||''}</span>
              </Link>
            )}

            {title && (
              <h1 className="py-3 px-1 text-bold truncate">{title || 'NovelNext'}</h1>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
}
