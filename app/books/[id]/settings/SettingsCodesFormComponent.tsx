import { useAuthContext } from "@/app/data/AuthContext";
import { auth_code_schema, Book } from "@/app/schemas/book_schema";
import Field from "@/app/shareds/Field";
import { useDotNotation } from "@/app/tools/customStates";
import { toast } from "@/app/tools/feedbacksUI";
import * as v from "valibot";
import { settings_component_input_class, settings_component_label_class } from "./SettingsComponent";
import { useAgreeWrapper } from "@/app/shareds/Agree";

interface Props {
  labelParam: string;
  book: Book;
  attributeKey: keyof Book;
}

export default function AuthFormComponent({ labelParam, book, attributeKey }: Props) {
  const authContext = useAuthContext();
  const { verify, updateCode } = authContext.CONTROLS;
  const agree = useAgreeWrapper();

  const fields = useDotNotation({
    old: { label: "Precedente", placeholder: "Es: 19dj-28dy-gry5-bktu", value: "" },
    code: { label: labelParam, placeholder: "Es: 19dj-28dy-gry5-bktu", value: "" },
    confirm: { label: `Conferma ${labelParam}`, placeholder: "Es: 19dj-28dy-gry5-bktu", value: "" },
  });

  function reset() {
    fields.set((prev) => {
      prev.old.value = "";
      prev.code.value = "";
      prev.confirm.value = "";
      return prev;
    });
  }

  function handleFieldChange(key: string, value: string) {
    fields.set((prev) => {
      (prev as any)[key].value = value;
      return { ...prev };
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!book) return console.error("Libro non trovato");
    const _field = fields.get;

    // 1) il vecchio codice è corretto?
    const isOldCorrect = book[attributeKey]?.length
      ? await verify(_field.old.value, String(book[attributeKey]))
      : true;
    if (book[attributeKey]?.length && !isOldCorrect) {
      return toast.danger("Codice precedente non corretto");
    }

    // 2) il nuovo codice è diverso dal precedente?
    const old_equal_new = _field.old.value === _field.code.value;
    if (old_equal_new) return toast.danger("Codice nuovo uguale al precedente");

    // 3) la conferma corrisponde al nuovo codice?
    const confirm_equal_new = _field.code.value === _field.confirm.value;
    if (!confirm_equal_new) return toast.danger("Conferma non corrispondente");

    // 4) validazione codice
    const parsed = v.safeParse(auth_code_schema, _field.code.value);
    if (!parsed.success) return toast.danger("Codice non valido");

    // 5) conferma
    if (!(await agree.warning(`Aggiornare '${labelParam}' da '${book.title}'?`, "Aggiorna"))) return;

    // aggiornamento tramite updateCode (con crittografia Argon2)
    const res = await updateCode(attributeKey, book, parsed.output);
    if (!res) return console.error("Errore nell'aggiornamento del libro");
    // feedback
    reset();
    toast.success("Codice aggiornato con successo");
  }

  return (
    <div className="p-1 outline rounded outline-red-500 bg-red-900">
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-2">
        {Object.entries(fields.get).map(([key, field]) => (
          <div key={key} className="relative flex-1 min-w-[200px] bg-white outline rounded">
            <Field
              label_class={settings_component_label_class}
              input_class={settings_component_input_class}
              id={key}
              label={field.label}
              type="password"
              placeholder={field.placeholder}
              value={String(field.value)}
              onChange={(e) => handleFieldChange(key, e.target.value)}
            />
          </div>
        ))}

        <div className="w-full">
          <button type="submit" className="py-2 px-3 bg-blue-500 rounded">
            Modifica
          </button>
        </div>
      </form>
    </div>
  );
}