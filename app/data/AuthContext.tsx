"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { generateContext, useDotNotation } from "../tools/reactCustomization";
import { Code, Book } from "../schemas/book_schema";
import { useBookContext } from "./BookContext";
import { hashWithArgon2, verifyWithArgon2, checkAccessWithArgon2 } from "../actions/argonActions";
import { nanoid } from "nanoid";

export const {
  provider: AuthProvider,
  context: useAuthContext,
} = generateContext(() => {
  const bookContext = useBookContext();
  
  class AuthContextClass {
    codes = useDotNotation<Code[]>([]);
    allowedReadIds = useDotNotation<string[]>([]);
    allowedWriteIds = useDotNotation<string[]>([]);
    isAuthLoaded = useDotNotation<boolean>(false);
    
    constructor(){
      // Sincronizza i permessi con localStorage all'avvio
      useEffect(() => {
        this.codes.set(this.LOCAL.get());
      }, []);

      // Sincronizza tra tab tramite storage event
      useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
          if (e.key === this.LOCAL.codes_title) {
            this.codes.set(this.LOCAL.get());
          }
        };
        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
      }, []);
  
      // Sincronizza i permessi dell'utente con i libri
      useEffect(() => {
        let isCancelled = false;
        const userCodes = this.codes.get.map((p) => p.auth_code).filter(Boolean);
        const books = bookContext.books;
    
        const evaluateCodes = async ()=> {
          this.isAuthLoaded.set(false);
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
            this.allowedReadIds.set(readMatches);
            this.allowedWriteIds.set(writeMatches);
            this.isAuthLoaded.set(true);
          }
        }
    
        evaluateCodes();
    
        return () => {
          isCancelled = true;
        };
      }, [this.codes.get, bookContext.books]);
    }

    // gestione del localStorage
    LOCAL = {
      codes_title: "codes",
      get(): Code[] {
        if (typeof window === "undefined") return [];
        try {
          const res = localStorage.getItem(this.codes_title);
          const _codes: any[] = res ? JSON.parse(res) : [];
          let modified = false;
          const sanitized: Code[] = _codes.map((p) => {
            if (!p.id) {
              modified = true;
              return { ...p, id: nanoid() };
            }
            return p;
          });
          if (modified && typeof window !== "undefined") {
            localStorage.setItem(this.codes_title, JSON.stringify(sanitized));
          }
          return sanitized;
        } catch (error) {
          console.error("Errore nel parsing dei permessi:", error);
          return [];
        }
      },
      set(codes: Code[]) {
        if (typeof window === "undefined") return;
        try {
          localStorage.setItem(this.codes_title, JSON.stringify(codes));
        } catch (error) {
          console.error("Errore nel salvataggio dei permessi:", error);
        }
      },
    };
  
    getCodes(): Code[] {
      return this.codes.get;
    }

    getCodeById(id: string): Code | undefined {
      return this.codes.get.find((p) => p.id === id);
    }

    createCode(newCode: Omit<Code, "id"> & { id?: string }): Code {
      const codeWithId: Code = {
        ...newCode,
        id: newCode.id || nanoid(),
      };
      this.codes.set((prev) => {
        const next = [...prev, codeWithId];
        this.LOCAL.set(next);
        return next;
      });
      return codeWithId;
    }

    updateCode(
      idOrCode: string | Code,
      updated?: Partial<Omit<Code, "id">>
    ): Code | null {
      const id = typeof idOrCode === "string" ? idOrCode : idOrCode.id;
      const patch = typeof idOrCode === "string" ? (updated || {}) : idOrCode;
      let feedback: Code | null = null;

      this.codes.set((prev) => {
        const next = prev.map((code) => {
          if (code.id === id) {
            feedback = { ...code, ...patch, id };
            return feedback;
          }
          return code;
        });
        if (feedback) {
          this.LOCAL.set(next);
        }
        return next;
      });
      
      return feedback;
    }

    deleteCode(idOrCode: string | Code): Code | null {
      const id = typeof idOrCode === "string" ? idOrCode : idOrCode.id;
      let target: Code | null = null;

      this.codes.set((previous) => {
        target = previous.find((_p) => _p.id === id) || null;
        if (!target) return previous;
        const next = previous.filter((_p) => _p.id !== id);
        this.LOCAL.set(next);
        return next;
      });

      return target;
    }

    deleteCodes(ids: string[]): boolean {
      const idSet = new Set(ids);
      this.codes.set((previous) => {
        const next = previous.filter((_p) => !idSet.has(_p.id));
        this.LOCAL.set(next);
        return next;
      });
      return true;
    }
  
    // Funzioni stabilizzate con useCallback
    canRead = useCallback(
      (book: Book | undefined): boolean => {
        if (!book) return false;
        if (!book.auth_read?.length) return true;
        return this.allowedReadIds.get.includes(book.id);
      },
      [this.allowedReadIds.get]
    );
  
    canWrite = useCallback(
      (book: Book | undefined): boolean => {
        if (!book) return false;
        if (!book.auth_write?.length) return true;
        return this.allowedWriteIds.get.includes(book.id);
      },
      [this.allowedWriteIds.get]
    );
  
    // Oggetto CONTROLS con funzioni stabilizzate
    CONTROLS = {
      canRead: this.canRead,
      canWrite: this.canWrite,

      async hash(code: string): Promise<string> {
        return hashWithArgon2(code);
      },

      async verify(code: string, hash: string): Promise<boolean> {
        return verifyWithArgon2(code, hash);
      },

      async updateCode(key: keyof Book, book: Book, newCode?: string): Promise<Book | null> {
        const clone = structuredClone(book);
        const rawCode = newCode !== undefined ? newCode : String((clone as any)[key] || "");
        (clone as any)[key] = rawCode.length ? await hashWithArgon2(rawCode) : "";
        return bookContext.updateBook(clone.id, clone);
      },
    };
  };

  return new AuthContextClass() 
});