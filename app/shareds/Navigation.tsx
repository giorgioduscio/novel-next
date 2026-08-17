'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import useCommonPagesHook from '../data/useCommonPagesHook';

interface NavigationProps {
  page_title: string;
  back_btn?: { icon?:string, label?:string, href:string };
}

export default function Navigation(props: NavigationProps, children?:React.ReactNode) {
  if(!props) return null;
  const {page_title, back_btn} = props;
  const [title, setTitle] = useState('');
  const pathname = usePathname();
  const page = useCommonPagesHook()
  

  useEffect(()=>{
    setTitle(page_title || document.title);
  }, [pathname, page_title]);
  
  return (
    <nav id="Navigation" className="sticky top-0 z-100">
      <div className="w-full bg-indigo-900 border-b-2 border-indigo-500">
        <div className="mx-auto container max-w-[800px]">
          <div className="flex items-center">

            {/* se esiste almeno l'href */}
            {(back_btn && back_btn.href) &&(
              <Link href={back_btn.href} className="py-2 px-3 bg-indigo-900 truncate">
                <i className={`${back_btn.icon || 'bi-chevron-left'} bi me-1`}></i>
                <span>{back_btn.label ||''}</span>
              </Link>
            )}

            {title && (
              <h1 className="p-2 text-bold text-orange-500 truncate flex-1">{title || 'NovelNext'}</h1>
            )}

            <div className='me-start px-1 grid grid-cols-[auto_1fr] text-gray-500 text-xs'>
              <i>X:</i> <b>{page.screenWidth}</b>
              <i>Y:</i> <b>{page.screenHeight}</b>
            </div>

            {children}

          </div>
        </div>
      </div>
    </nav>
  );
}
