"use client";

import { useEffect, useMemo, useState } from "react";
import { useDot } from "../tools/customStates";
import { Permission, Book } from "../schemas/book_schema";
import { useBookContext } from "./BookContext";
import { hashWithArgon2, verifyWithArgon2, checkAccessWithArgon2 } from "../actions/argonActions";
import { generateContext } from "../tools/generateContext";


export const {
  provider: AuthProvider,
  context: useAuthContext,
  
} = generateContext(() => {
  const bookContext = useBookContext();
  const permissions = useDot<Permission[]>([]);
  const [allowedReadIds, setAllowedReadIds] = useState<string[]>([]);
  const [allowedWriteIds, setAllowedWriteIds] = useState<string[]>([]);

  // Sincronizza i permessi dell'utente con i libri attuali tramite Argon2
  useEffect(() => {
    let isCancelled = false;
    const userCodes = permissions.get().map((p) => p.auth_code).filter(Boolean);
    const books = bookContext.books;

    async function evaluatePermissions() {
      const readMatches: string[] = [];
      const writeMatches: string[] = [];

      for (const b of books) {
        if (!b.auth_read?.length) {
          readMatches.push(b.id);
        } else if (userCodes.length > 0) {
          const hasAccess = await checkAccessWithArgon2(userCodes, b.auth_read);
          if (hasAccess) readMatches.push(b.id);
        }

        if (!b.auth_write?.length) {
          writeMatches.push(b.id);
        } else if (userCodes.length > 0) {
          const hasAccess = await checkAccessWithArgon2(userCodes, b.auth_write);
          if (hasAccess) writeMatches.push(b.id);
        }
      }

      if (!isCancelled) {
        setAllowedReadIds(readMatches);
        setAllowedWriteIds(writeMatches);
      }
    }

    evaluatePermissions();

    return () => {
      isCancelled = true;
    };
  }, [permissions.get(), bookContext.books]);

  // controlli
  const CONTROLS = {
    async hash(code: string): Promise<string> {
      return hashWithArgon2(code);
    },

    async verify(code: string, hash: string): Promise<boolean> {
      return verifyWithArgon2(code, hash);
    },

    canRead(book: Book | undefined): boolean {
      if (!book) return false;
      if (!book.auth_read?.length) return true;
      return allowedReadIds.includes(book.id);
    },

    canWrite(book: Book | undefined): boolean {
      if (!book) return false;
      if (!book.auth_write?.length) return true; 
      return allowedWriteIds.includes(book.id);
    },

    async updateCode(key: keyof Book, book: Book, newCode?: string): Promise<Book | null> {
      const clone = structuredClone(book);
      const rawCode = newCode !== undefined ? newCode : String((clone as any)[key] || "");
      (clone as any)[key] = rawCode.length ? await hashWithArgon2(rawCode) : "";
      return bookContext.updateBook(clone.id, clone);
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

  useEffect(() => {
    permissions.set(LOCAL.get());
  }, [LOCAL]);

  return {
    LOCAL,
    permissions,
    CONTROLS,
  };
});
