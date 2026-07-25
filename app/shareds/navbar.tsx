'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [title, setTitle] = useState('');
  const pathname = usePathname();

  useEffect(()=>{
    setTitle(document.title);
  }, [pathname]);
  
  return (
    <nav className="w-full bg-gray-800">
      <div className="mx-auto px-4 container">
        <div className="flex justify-between items-center h-16">

          <div className="text-xl font-bold text-white truncate">{title}</div>

          <div className="flex space-x-6">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors truncate">
              <i className="bi bi-house me-1"></i>
              <span>Home</span>
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
}
