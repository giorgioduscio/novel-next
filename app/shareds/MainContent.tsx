"use client";

import React from "react";
import { useBookContext } from "../data/BookContext";
import { useCommonPagesContext } from "../data/CommonPagesContext";
import { useAuthContext } from "../data/AuthContext";
import { LoadingComponent } from "./LoadingComponent";

interface MainContentProps {
  children: React.ReactNode;
}

export default function MainContent({ children }: MainContentProps) {
  const page = useCommonPagesContext();
  const bookContext = useBookContext();
  const authContext = useAuthContext();

  // feedback caricamento
  if (!page.isPageLoaded.get || !bookContext.isBookLoaded.get || !authContext.isAuthLoaded.get) {
    return <LoadingComponent />;
  }

  return (
    <main>
      {children}
      <footer className="pb-[50px] bg-indigo-900 print:hidden">
        <div className="mx-auto p-4 max-w-[400px]">
          <div className="flex gap-2 justify-center items-center flex-wrap text-white text-center">
            <i className="bi bi-book"></i>
            <span className="font-semibold">Novel App</span>
            <p className="w-full text-xs text-gray-300">&copy; {new Date().getFullYear()} Novel App. Tutti i diritti riservati.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
