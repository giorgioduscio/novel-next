"use client";

import { useMemo, useState } from "react";
import { useAuthContext } from "../data/AuthContext";
import { useBookContext } from "../data/BookContext";
import Field from "./Field";
import { toast } from "../tools/feedbacksUI";
import { verifyWithArgon2 } from "../actions/argonActions";
import { useDotNotation } from "../tools/reactCustomization";
import Link from "next/link";

interface InsertAuthCodesComponentProps {
  targetId: string;
}

export default function InsertAuthCodesComponent({ targetId }: InsertAuthCodesComponentProps) {
  const authContext = useAuthContext();
  const bookContext = useBookContext();
  const book = bookContext.getBookById(targetId);
  const [isLoading, setIsLoading] = useState(false);

  const codes =({
    "auth_read": {
      value: useDotNotation(""), 
      isVisible: useMemo(() => !!(book?.auth_read && book.auth_read.length > 0), [book])
    },
    "auth_write": {
      value: useDotNotation(""), 
      isVisible: useMemo(() => !!(book?.auth_write && book.auth_write.length > 0), [book])
    },
  })

  function handleChange(key:keyof typeof codes, value:string) {
    codes[key].value.set(value.trim())
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!book) return console.error("libro non disponibille");

    setIsLoading(true);

    try {
      // Verifica i codici
      const hasReadAccess = await verifyCode("auth_read", "lettura");
      if (!hasReadAccess) return;
      
      const hasWriteAccess = await verifyCode("auth_write", "scrittura");
      if (book.auth_write && book.auth_write.length > 0 && !hasWriteAccess) return;
      
      // Definisco una funzione helper per verificare i codici
      async function verifyCode (codeKey: keyof typeof codes, accessType: "lettura" | "scrittura") {
        const codeValue = codes[codeKey].value.get.trim();
        if (!codeValue) {
          toast.danger(`Inserisci il codice di ${accessType}`);
          setIsLoading(false);
          return false;
        }

        const bookCode = book ?book[codeKey] :"";
        if (!bookCode || bookCode.length === 0) {
          return true; // Nessun codice richiesto
        }

        const isValid = await verifyWithArgon2(codeValue, bookCode);
        if (!isValid) {
          toast.danger(`Codice di ${accessType} non valido`);
          setIsLoading(false);
          return false;
        }

        return true;
      };

      // Salva i codici in localStorage
      saveCode("auth_read", "lettura");
      saveCode("auth_write", "scrittura");
      
      function saveCode (codeKey: keyof typeof codes, accessType: "lettura" | "scrittura") {
        const codeValue = codes[codeKey].value.get.trim();
        if (codeValue) {
          authContext.createCode({
            title: `${book?.title}: ${accessType}`,
            auth_code: codeValue,
          });
        }
      };

      toast.success("Codici salvati correttamente");
      window.location.reload();
    } catch (error) {
      console.error("Errore durante la verifica:", error);
      toast.danger("Errore durante la verifica dei codici");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-3">
      <div className="p-3 mx-auto max-w-fit bg-orange-700 text-white border rounded">
        <div className="mb-3">
          <h3 className="text-xl font-bold mb-2">
            <i className="bi bi-lock me-2"></i>
            Accesso protetto
          </h3>
          <p className="text-sm">Inserisci i codici per accedere a "{book?.title}"</p>
        </div>

        {/* wrapper codici */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {Object.entries(codes).map(([key, code])=>(
            code.isVisible && (
              <div className="relative" key={key}>
                <Field
                  id={key}
                  label={key === "auth_read" ? "Codice di lettura" : "Codice di scrittura"}
                  type="password"
                  label_class="block text-sm font-bold mb-1"
                  input_class="px-3 py-2 bg-white text-black outline rounded"
                  placeholder={`Inserisci il codice di ${key === "auth_read" ? "lettura" : "scrittura"}`}
                  value={code.value.get} 
                  onChange={(e) => handleChange(key as any, e.target.value)}
                  disabled={isLoading}
                />
              </div>
            )
          ))}

          <div>
            <Link href={"/books"} className="p-2 underline">Torna al catalogo</Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 rounded font-bold"
          >
            {isLoading ? (
              <>
                <i className="bi bi-hourglass-split me-2"></i>
                Verifica in corso...
              </>
            ) : (
              <>
                <i className="bi bi-unlock me-2"></i>
                Accedi
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
