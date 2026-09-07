
"use client";

import { useMemo } from "react";
import { useAuthContext } from "../data/AuthContext";
import { Book, Code, code_schema } from "../schemas/book_schema";
import { useDotNotation } from "../tools/reactCustomization";
import { toast, debounce } from "../tools/feedbacksUI";
import * as v from "valibot";
import { useAgreeWrapper } from "../shareds/Agree";
import { nanoid } from "nanoid";

export default function useAuthComponent() {
  const authcontext = useAuthContext();
  const agree = useAgreeWrapper();

  const codes = authcontext.getCodes();
  const canRead = (book: Book) => !!book && !!authcontext.CONTROLS.canRead(book);
  const canWrite = (book: Book) => !!book && !!authcontext.CONTROLS.canWrite(book);

  const FORM = {
    isVisible: useDotNotation(false),
    state: useDotNotation<{ key: "title" | "auth_code"; value: string; placeholder: string; label: string }[]>([
      { key: "title", value: "", placeholder: "Es: Signore degli anelli", label: "Titolo" },
      { key: "auth_code", value: "", placeholder: "Es: qk49-384i-gnd3-1h48", label: "Codice" },
    ]),

    reset() {
      this.state.set((prev) => prev.map((item) => ({ ...item, value: "" })));
    },

    handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      
      if (!newCode.success) {
        console.error("Errore nella validazione:", newCode.issues);
        return;
      }

      const formTitle = newCode.output.title.trim();
      const formCode = newCode.output.auth_code.trim();

      if (!formTitle.length) 
        return toast.danger("Titolo non valido");

      if (!formCode.length) 
        return toast.danger("Codice non valido");

      // se ci sono due codici con lo stesso title
      const existing = codes.find(
        (perm) => perm.title.trim().toLowerCase() === formTitle.toLowerCase()
      );
      if (existing) return toast.danger("Titolo già esistente");

      // creazione permesso con id
      const created = authcontext.createCode({
        id: nanoid(),
        title: formTitle,
        auth_code: formCode,
      });

      if (!created) return toast.danger("Permesso non creato");
      toast.success("Permesso aggiunto");
      FORM.reset();
    },
  };

  const newCode = useMemo(() => {
    let formValues: Record<string, string> = {
      id: "placeholder-id",
    };

    FORM.state.get.forEach((item) => {
      formValues[item.key] = item.value;
    });
    
    return v.safeParse(code_schema, formValues);
  }, [FORM.state.get]);

  const errors = useMemo(() => {
    const result: Record<string, string> = {};
    // form
    for (let error of newCode.issues || []) {
      const [field, message] = error.message.split(": ");
      if (field && message && field !== "id") {
        result[field] = message;
        result["form>" + field] = message;
      }
    }
    // codici esistenti
    for (let i = 0; i < codes.length; i++) {
      const perm = codes[i];
      const parsedCode = v.safeParse(code_schema, perm);
      if (!parsedCode.success) {
        for (let issue of parsedCode.issues) {
          const [key, message] = issue.message.split(": ");
          if (key && message) {
            result[`${perm.id}>${key}`] = message;
          }
        }
      }
    }
    return result;
  }, [newCode, codes]);

  // Feedback debouncato per gli update
  const notifyUpdated = useMemo(
    () =>
      debounce(() => {
        toast.success("Permesso aggiornato");
      }, 800),
    []
  );

  // AZIONI
  const checkedTargets = useDotNotation<string[]>([]);
  const CRUD = {
    async handleDelete(id: string) {
      await this.handleDeleteMany([id]);
    },

    async handleDeleteMany(targetsParams?: string[] | unknown, clearManyDelete = true) {
      const targetIds = Array.isArray(targetsParams) ? targetsParams : checkedTargets.get;

      if (!targetIds.length) return console.error("Nessun target selezionato");

      const targetCodes = codes.filter((p) => targetIds.includes(p.id));
      const titles = targetCodes.map((p) => p.title).filter(Boolean);
      const confirmLabel = titles.length > 0 ? titles.join(", ") : `${targetIds.length} permessi`;

      if (!(await agree.danger(`Rimuovere '${confirmLabel}'?`, "Rimuovi"))) return;

      const res = authcontext.deleteCodes(targetIds);

      // reset facoltativo
      if (clearManyDelete) {
        checkedTargets.set(checkedTargets.get.filter((id) => !targetIds.includes(id)));
      }

      // feedback
      if (!res) return toast.danger("Eliminazione fallita");
      toast.success("Permessi rimossi");
    },

    handleUpdate(id: string, key: keyof Code, newValue: string) {
      const updated = authcontext.updateCode(id, { [key]: newValue });
      if (!updated) return toast.danger("Aggiornamento fallito");
      notifyUpdated();
    },

    toggleTarget(id: string) {
      const current = checkedTargets.get;
      if (current.includes(id)) {
        checkedTargets.set(current.filter((i) => i !== id));
      } else {
        checkedTargets.set([...current, id]);
      }
    },
  };

  return {
    FORM,
    newCode,
    errors,
    CRUD,
    canRead,
    canWrite,
    checkedTargets,
    codes: authcontext.codes,
  };
}
