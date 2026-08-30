
"use client";

import { useMemo } from "react";
import { useAuthContext } from "../data/AuthContext";
import { Book, Permission, permission_schema } from "../schemas/book_schema";
import { useDot } from "../tools/customStates";
import { toast } from "../tools/feedbacksUI";
import * as v from "valibot";
import { useAgreeWrapper } from "../shareds/Agree";


export default function useAuthComponent() {
  const { LOCAL, permissions, CONTROLS} = useAuthContext();
  const agree = useAgreeWrapper();
  const canRead =(book:Book)=> !!book && !!CONTROLS.canRead(book);
  const canWrite =(book:Book)=> !!book && !!CONTROLS.canWrite(book);

  const FORM = {
    isVisible: useDot(false),
    state: useDot<{ key: keyof Permission; value: string; placeholder: string; label: string }[]>([
      { key: "title", value: "", placeholder: "Es: Signore degli anelli", label: "Titolo" },
      { key: "auth_code", value: "", placeholder: "Es: qk49-384i-gnd3-1h48", label: "Codice" },
    ]),

    reset() {
      this.state.set((prev) => prev.map((item) => ({ ...item, value: "" })));
    },

    handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      
      if (!newPermission.success) {
        console.error("Errore nella validazione:", newPermission.issues);
        return;
      }

      if(!newPermission.output.auth_code.length) 
        return toast.danger("Codice non valido");

      // se ci sono due codici con lo stesso title
      const existing = permissions.get.find((perm) => perm.title === newPermission.output.title);
      if (existing) return toast.danger("Titolo già esistente");

      // aggiornamento
      const updated = [...permissions.get, newPermission.output];
      permissions.set(updated);
      LOCAL.set(updated);

      // feedback
      const res = LOCAL.get().find((perm) => perm.title === newPermission.output.title);
      if (!res) return toast.danger("Permesso non trovato");
      toast.success("Permesso aggiunto");
      FORM.reset();
    },
  };

  const newPermission = useMemo(() => {
    let formValues: Record<string, string> = {};

    FORM.state.get().forEach((item) => {
      formValues[item.key] = item.value;
    });
    
    return v.safeParse(permission_schema, formValues);
  }, [FORM.state.get()]);

  const errors = useMemo(() => {
    const result: Record<string, string> = {};
    // form
    for (let error of newPermission.issues || []) {
      const [field, message] = error.message.split(": ");
      result[field] = message;
      result["form>" + field] = message;
    }
    // codici
    for (let i = 0; i < permissions.get.length; i++) {
      const code = permissions.get[i];
      const parsedCode = v.safeParse(permission_schema, code);
      if (!parsedCode.success) {
        const [key, message] = parsedCode.issues[0].message.split(": ");
        result[`${i}>${key}`] = message;
      }
    }
    return result;
  }, [newPermission, permissions.get]);

  // AZIONI
  const checkedTargets = useDot<number[]>([]);
  const CRUD = {
    async handleDelete(index: number) {
      const target = permissions.get[index];
      if (!target) return console.error("Codice non trovato");

      if (!(await agree.danger(`Rimuovere '${target.title || target.auth_code}'?`, "Rimuovi"))) return;

      const updated = permissions.get.filter((_, i) => i !== index);
      permissions.set(updated);
      LOCAL.set(updated);
      // feedback
      const res = LOCAL.get().find((perm) => perm.title === target.title);
      if (res) return toast.danger("Eliminazione fallita");
      toast.success("Permesso rimosso");
    },

    async handleDeleteMany() {
      const targets = checkedTargets
        .get()
        .map((i) => permissions.get[i]?.title)
        .filter(Boolean) as string[];
      if (!targets.length) return console.error("Nessun target selezionato");

      if (!(await agree.danger(`Rimuovere '${targets.join(", ")}'?`, "Rimuovi"))) return;

      const updated = permissions.get.filter((_, i) => !checkedTargets.get().includes(i));
      permissions.set(updated);
      LOCAL.set(updated);
      checkedTargets.set([]);
      // feedback
      const res = LOCAL.get().filter((perm) => targets.includes(perm.title));
      if (res.length > 0) return toast.danger("Eliminazione fallita");
      toast.success("Permessi rimossi");
    },

    handleUpdate(index: number, key: keyof Permission, newValue: string) {
      const previousValue = structuredClone((permissions as any).get()[index][key]);
      const updated = permissions.get.map((p, i) =>
        i === index ? { ...p, [key]: newValue } : p
      );
      permissions.set(updated);
      LOCAL.set(updated);
      // feedback
      const res = (LOCAL.get()[index] as any)[key] === previousValue;
      if (res) return toast.danger("Aggiornamento fallito");
      toast.success("Permesso aggiornato");
    },

    toggleTarget(index: number) {
      const current = checkedTargets.get();
      if (current.includes(index)) {
        checkedTargets.set(current.filter((i) => i !== index));
      } else {
        checkedTargets.set([...current, index]);
      }
    },
  };

  return {
    FORM,
    newPermission,
    errors,
    CRUD,
    canRead, canWrite,
    checkedTargets,
  }
}
