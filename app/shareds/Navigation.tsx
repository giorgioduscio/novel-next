'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import useCommonPagesHook from '../data/useCommonPagesHook';

interface NavigationProps {
  page_title: string;
  back_btn?: { icon?:string, label?:string, href:string };
  children?: React.ReactNode;
}

export default function Navigation(props: NavigationProps) {
  if(!props) return null;
  const {page_title, back_btn, children} = props;
  const [title, setTitle] = useState('');
  const pathname = usePathname();
  const page = useCommonPagesHook()
  

  useEffect(()=>{
    setTitle(page_title || document.title);
  }, [pathname, page_title]);
  
  return (
    <nav id="Navigation" className="sticky top-0 z-100">
      <div className="w-full bg-indigo-900 border-b border-black">
        <div className="mx-auto container max-w-[800px]">
          <div className="flex items-center">

            {/* se esiste almeno l'href */}
            {(back_btn && back_btn.href) &&(
              <Link href={back_btn.href} className="p-2 bg-indigo-900 truncate">
                <i className={`${back_btn.icon || 'bi-chevron-left'} bi me-1`}></i>
                <span>{back_btn.label ||''}</span>
              </Link>
            )}

            {title && (
              <h1 className="p-2 text-bold text-orange-500 truncate flex-1">{title || 'NovelNext'}</h1>
            )}

            {children}

          </div>
        </div>
      </div>
    </nav>
  );
}
