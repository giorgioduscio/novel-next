import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

interface FieldProps {
  input_class?: string;
  inline?: boolean;
  id: string;
  label: string;
  hide_label?: boolean;
  type: string;
  placeholder: string;
  value: string | boolean;
  disabled?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => any;
  rows?: number;
  error_message?: string;
  [key: string]: any;
}

export default function Field({
  label,  type,  placeholder,  value,  onChange,
  hide_label,  input_class,  inline,  disabled,
  rows,  id,  error_message,
  ...rest
}: FieldProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [localValue, setLocalValue] = useState(value);

  // Sincronizza il valore locale quando cambia il valore prop
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const _events ={
    // Gestisce il cambiamento del valore locale
    handleLocalChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
      setLocalValue(e.target.value);
    },
  
    // Gestisce il blur (perdita di focus)
    handleBlur(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
      const hasChanged = localValue !== value;
      
      if (!hasChanged) return;
      onChange(e);
    },
  
    // Gestisce la pressione di Enter (solo per input non textarea)
    handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
      if (e.key === 'Enter') {
        const hasChanged = localValue !== value;
        
        if (!hasChanged) return;
        onChange(e as any);
      }
    },
  }

  // Adatta automaticamente l'altezza della textarea al contenuto.
  // Viene richiamata quando cambia il testo oppure quando cambia la larghezza
  const applyResize = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Ripristina l'altezza naturale per permettere il ricalcolo corretto
    // anche quando il contenuto viene ridotto.
    textarea.style.height = "auto";

    // Imposta l'altezza necessaria a visualizzare tutto il contenuto
    // senza scrollbar verticale.
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, []);

  // Ricalcola l'altezza ogni volta che cambia il valore della textarea.
  // Se rows è definito, l'autosize viene disabilitato.
  useLayoutEffect(() => {
    if (rows) return;

    applyResize();
  }, [localValue, rows, applyResize]);

  // Osserva eventuali variazioni di dimensione della textarea.
  // Se cambia la larghezza (es. layout responsive), viene ricalcolata
  // l'altezza perché il testo potrebbe andare a capo diversamente.
  useEffect(() => {
    if (rows) return;

    const textarea = textareaRef.current;
    if (!textarea) return;

    const observer = new ResizeObserver(() => {
      applyResize();
    });

    observer.observe(textarea);

    return () => observer.disconnect();
  }, [rows, applyResize]);


  return (
    <div className={`grid items-center ${inline ? "grid-cols-[auto_1fr]" : "grid-cols-1"}`}>
      {/* LABEL */}
      <label htmlFor={id} className={hide_label ? "sr-only" : "py-1 px-2 text-sm truncate"}>
        <span className="truncate">{label}</span>
        {error_message && <b className="ms-1 text-red-500">*</b>}
      </label>

      {/* TEXTAREA */}
      {type === "textarea" ? (
        <textarea
          ref={textareaRef} // assegna il riferimento
          id={id}
          name={id}
          title={label}
          placeholder={placeholder}
          value={localValue as string}
          disabled={disabled}
          rows={rows || 1}
          className={`${input_class} ${error_message ? "invalid" : ""}`}
          style={{
            resize: rows ? "vertical" : "none",
            overflow: rows ? "auto" : "hidden",
          }}
          onChange={_events.handleLocalChange}
          onBlur={_events.handleBlur}
          {...rest}
        />

      // BOOLEAN
      ) : typeof value === "boolean" ? (
        <input
          type={type}
          placeholder={placeholder}
          checked={value}
          id={id}
          name={id}
          title={label}
          disabled={disabled}
          className={`${input_class} ${error_message ? "invalid" : ""}`}
          onChange={onChange}
          {...rest}
        />

      // DEFAULT
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          value={localValue as string}
          id={id}
          name={id}
          title={label}
          disabled={disabled}
          className={`${input_class} ${error_message ? "invalid" : ""}`}
          onChange={_events.handleLocalChange}
          onBlur={_events.handleBlur}
          onKeyDown={_events.handleKeyDown}
          {...rest}
        />
      )}

      {/* ERROR MESSAGE */}
      {error_message && (
        <div className="px-1 text-red-400 bg-red-900/50">
          <div className="grid grid-cols-[auto_1fr] gap-1 text-sm">
            <i className="bi bi-exclamation-triangle"></i>
            <span>{error_message}</span>
          </div>
        </div>
      )}
    </div>
  );
}