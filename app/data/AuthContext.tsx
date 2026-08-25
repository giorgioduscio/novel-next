"use client";

import React, { createContext, useContext, useEffect, useMemo } from "react";
import { useDot } from "../tools/customStates";
import { Permission, Book } from "../schemas/book_schema";

export interface AuthContextType {
  permissions: ReturnType<typeof useDot<Permission[]>>;
  CONTROLS: {
    canRead: (book: Book | undefined) => boolean;
    canWrite: (book: Book | undefined) => boolean;
  };
  LOCAL: {
    permissions_title: string;
    get(): Permission[];
    set(permissions: Permission[]): void;
  };
}

export function useAuthState(): AuthContextType {

  // controlli
  const CONTROLS = {
    canRead(book: Book | undefined) {
      if (!book) return false;
      if (!book.auth_read?.length) return true;

      const result = permissions
        .get()
        .map((p) => p.auth_code)
        .includes(book.auth_read);
      return result;
    },

    canWrite(book: Book | undefined) {
      if (!book) return false;
      if (!book.auth_write?.length) return true;

      const result = permissions
        .get()
        .map((p) => p.auth_code)
        .includes(book.auth_write);
      return result;
    },
  };

  // localhost
  const LOCAL = useMemo(() => ({
    permissions_title: "permissions",

    get(): Permission[] {
      if (typeof window === "undefined") return [];
      try {
        const res = localStorage.getItem(this.permissions_title);
        const _permissions: Permission[] = res ? JSON.parse(res) : [];
        return _permissions;
      } catch (error) {
        console.error("Errore nel parsing dei permessi:", error);
        return [];
      }
    },

    set(permissions: Permission[]) {
      if (typeof window === "undefined") return;
      localStorage.setItem(this.permissions_title, JSON.stringify(permissions));
    },
  }), []);

  const permissions = useDot<Permission[]>([]);
  useEffect(() => {
    permissions.set(LOCAL.get());
  }, [LOCAL]);

  return {
    LOCAL,
    permissions,
    CONTROLS,
  };
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = useAuthState();
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
