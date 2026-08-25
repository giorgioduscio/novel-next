'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useCommonPagesContext } from '../data/CommonPagesContext';

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
  const page = useCommonPagesContext();
  

  useEffect(()=>{
    setTitle(page_title || document.title);
  }, [pathname, page_title]);
  
  return (
    <nav id="Navigation" className="sticky top-0 z-50 pt-[env(safe-area-inset-top)]">
      <div className="w-full bg-indigo-900 border-b border-black">
        <div className="mx-auto container max-w-[800px]">
          <div className="flex items-center min-h-[44px]">

            {/* se esiste almeno l'href */}
            {(back_btn && back_btn.href) &&(
              <Link href={back_btn.href} className="p-2 bg-indigo-900">
                <i className={`${back_btn.icon || 'bi-chevron-left'} bi me-1`}></i>
                <span className='truncate'>{back_btn.label ||''}</span>
              </Link>
            )}

            {title && (
              <h1 className="p-2 text-bold text-orange-500">{title || 'NovelNext'}</h1>
            )}
            <div className="flex-1"></div>

            {children}

          </div>
        </div>
      </div>
    </nav>
  );
}
