'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useEditMode } from '../data/EditModeContext';

interface NavbarProps {
  page_title?: string;
  back_btn?: { icon?:string, label?:string, href:string };
}

export default function Navbar({ page_title, back_btn }: NavbarProps) {
  const [title, setTitle] = useState('');
  const pathname = usePathname();
  const { isEditMode, toggleEditMode } = useEditMode();
  

  useEffect(()=>{
    setTitle(page_title || document.title);
  }, [pathname, page_title]);
  
  return (
    <div className="sticky top-0 z-50">
      <nav className="w-full bg-gray-800">
        <div className="mx-auto container max-w-[400px]">
          <div className="flex items-center">

            {/* se esiste almeno l'href */}
            {(back_btn && back_btn.href) &&(
              <Link href={back_btn.href} className="p-3 active:bg-gray-700 truncate">
                <i className={`${back_btn.icon || 'bi-chevron-left'} bi me-1`}></i>
                <span>{back_btn.label ||''}</span>
              </Link>
            )}

            {title && (
              <h1 className="p-3 text-bold truncate">{title}</h1>
            )}

            <button onClick={toggleEditMode} className="m-2 ms-auto py-1 px-2 bg-green-700 rounded-full">
              {isEditMode ?<>
                  <i className="bi bi-eye"></i>
              </>:<>
                  <i className="bi bi-pencil"></i>
              </>
              }
            </button>

          </div>
        </div>
      </nav>
    </div>
  );
}
