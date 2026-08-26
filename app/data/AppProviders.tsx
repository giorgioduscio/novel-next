"use client";

import React from "react";
import { AgreeProvider } from "@/app/shareds/Agree";
import { BookProvider } from "@/app/data/BookContext";
import { CommonPagesProvider } from "@/app/data/CommonPagesContext";
import { AuthProvider } from "@/app/data/AuthContext";
import { ContextProvider } from "@/app/data/contextRegistry";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AgreeProvider>
      <CommonPagesProvider>
        <BookProvider>
          <AuthProvider>
            <ContextProvider>
              {children}
            </ContextProvider>
          </AuthProvider>
        </BookProvider>
      </CommonPagesProvider>
    </AgreeProvider>
  );
}

