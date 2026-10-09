'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useCommonPagesContext } from '../data/CommonPagesContext';
import Link from 'next/link';

interface NavbarProps {
  page_title: string;
  back_btn?: { href:string, icon?:string, label?:string };
  children?: React.ReactNode;
}

export default function Navbar(props: NavbarProps) {
  if(!props) return null;
  const {page_title, back_btn, children} = props;
  const [title, setTitle] = useState('');
  const [scrollProgress, setScrollProgress] = useState(0);
  const pathname = usePathname();
  const router = useRouter();
  const page = useCommonPagesContext();
  

  useEffect(()=>{
    setTitle(page_title || document.title);
  }, [pathname, page_title]);

  useEffect(() => {
    const scrollElement = document.getElementById('app');
    let ticking = false;
    
    function handleScroll(){
      if (!scrollElement) return;
      
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollTop = scrollElement.scrollTop;
          const elementHeight = scrollElement.clientHeight;
          const scrollHeight = scrollElement.scrollHeight;
          const scrollableHeight = scrollHeight - elementHeight;
          const progress = scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 0;
          const finalProgress = Math.min(100, Math.max(0, progress));
          setScrollProgress(finalProgress);
          ticking = false;
        });
        ticking = true;
      }
    };

    scrollElement?.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => scrollElement?.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <nav id="Navbar" className="fixed top-0 z-50 w-full print:hidden">
      <div className="w-full min-h-[50px] text-bg-tertiary border-b border-gray-800">

        {/* Barra di avanzamento scroll */}
        <div className="h-[1px] text-bg-light relative z-[51]"
              style={{ width: `${scrollProgress}%` }}/>
        {/* navigazione */}
        <div className="mx-auto container max-w-[800px]">
          <div className="flex items-center">

            {/* pulsante indietro con cronologia */}
            {back_btn &&<>
              <Link href={back_btn?.href || "/"} className="p-2 text-bg-tertiary rounded">
                <i className={`${back_btn?.icon || 'bi-chevron-left'} bi me-1`}></i>
                <span className='truncate'>{back_btn?.label ||''}</span>
              </Link>
            </>}

            {title && (
              <h1 className="p-2 text-bold text-white truncate">{title || 'NovelNext'}</h1>
            )}
            <div className="flex-1"></div>

            {children}

          </div>
        </div>
      </div>
    </nav>
  );
}
