'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useCommonPagesContext } from '../data/CommonPagesContext';

interface NavigationProps {
  page_title: string;
  back_btn?: { icon?:string, label?:string };
  children?: React.ReactNode;
}

export default function Navigation(props: NavigationProps) {
  if(!props) return null;
  const {page_title, back_btn, children} = props;
  const [title, setTitle] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const page = useCommonPagesContext();
  

  useEffect(()=>{
    setTitle(page_title || document.title);
  }, [pathname, page_title]);
  
  const handleBack = () => {
    router.back();
  };
  
  return (
    <nav id="Navigation" className="sticky top-0 z-50 pt-[env(safe-area-inset-top)] print:hidden">
      <div className="w-full bg-indigo-900 border-b border-black">
        <div className="mx-auto container max-w-[800px]">
          <div className="px-2 flex items-center min-h-[44px]">

            {/* pulsante indietro con cronologia */}
            {back_btn &&(
              <button onClick={handleBack} className="p-2 bg-indigo-900">
                <i className={`${back_btn.icon || 'bi-chevron-left'} bi me-1`}></i>
                <span className='truncate'>{back_btn.label ||''}</span>
              </button>
            )}

            {title && (
              <h1 className="p-2 text-bold text-orange-500 truncate">{title || 'NovelNext'}</h1>
            )}
            <div className="flex-1"></div>

            {children}

          </div>
        </div>
      </div>
    </nav>
  );
}
