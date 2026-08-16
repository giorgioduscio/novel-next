import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

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
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => any;
  rows?: number;
  error_message?: string;
  message?: string;
  asterisk?: boolean;
  [key: string]: any;
}


const useEvents = ({ value, onChange }: Partial<FieldProps>) => {

  // Sincronizza localValue con value
  useEffect(() => {
    setLocalValue(value || false);
  }, [value]);
  

    // Gestisce il cambiamento del valore locale
  function handleLocalChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>){
      setLocalValue(e.target.value);
  };

    // Gestisce il blur (perdita di focus)
  function handleBlur (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>){
    const hasChanged = localValue !== value;
    if (!hasChanged) return;
    onChange?.(e);
  };

    // Gestisce la pressione di Enter (solo per input non textarea)
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      const hasChanged = localValue !== value;
      if (!hasChanged) return;
      onChange?.(e as any);
    }
  };

  const [localValue, setLocalValue] = useState(value || false);
  return { localValue, setLocalValue, handleLocalChange, handleBlur, handleKeyDown };
};


// Custom Hook per gestire l'adattamento mobile
const useMobile = ({ type }: Partial<FieldProps>) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRefInternal = useRef<HTMLInputElement | null>(null);
  const lastKeyboardHeight = useRef(0);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


    // Gestisce il resize della finestra in base alla presenza della tastiera
  function handleResize() {
    const keyboardHeight = window.innerHeight - document.documentElement.clientHeight;

    // Applica solo se la differenza è significativa (evita flickering)
    if (Math.abs(keyboardHeight - lastKeyboardHeight.current) > 10) {
      requestAnimationFrame(() => {
        document.body.style.paddingBottom = `${keyboardHeight}px`;
        lastKeyboardHeight.current = keyboardHeight;
      });
    }
  }

  // Scrolla la pagina per visualizzare l'elemento
  function handleFocus() {
    const element = type === 'textarea' ? textareaRef.current : inputRefInternal.current;
    element?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }

  return { textareaRef, inputRefInternal, handleFocus, handleResize };
};


// Custom Hook per gestire il ridimensionamento della textarea
function useResize({ rows, localValue }: Partial<FieldProps>) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyResize = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Ripristina l'altezza naturale
    textarea.style.height = "auto";
    // Imposta l'altezza necessaria
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, []);

  useLayoutEffect(() => {
    if (rows) return;
    applyResize();
  }, [localValue, rows]);

  // Ricalcola l'altezza quando la dimensione della textarea cambia
  useEffect(() => {
    if (rows) return;
    const textarea = textareaRef.current;
    if (!textarea) return;

    const observer = new ResizeObserver(() => {
      applyResize();
    });

    observer.observe(textarea);
    return () => observer.disconnect();
  }, [rows]);

  return { textareaRef };
};


export default function Field({
  label,
  type,
  placeholder,
  value,
  onChange,
  hide_label,
  input_class,
  inline,
  disabled,
  rows,
  id,
  error_message,
  asterisk,
  message,
  autoComplete = "off",
  ...rest
}: FieldProps) {
  // Custom Hooks
  const EVENTS = useEvents({ value, onChange });
  const MOBILE = useMobile({ type });
  const RESIZE = useResize({ rows, localValue: EVENTS.localValue });


  const errorId = `${id}-error`;

  return (
    <React.Fragment>
      {/* LABEL */}
      <label
        htmlFor={id}
        className={hide_label ? "sr-only" : "block py-1 px-2 text-sm truncate"}
      >
        <span className="truncate">{label}</span>
        {asterisk && (
          <>
            <b className="ms-1 text-red-500" aria-hidden="true">*</b>
            <span className="sr-only"> campo obbligatorio</span>
          </>
        )}
      </label>

      {/* TEXTAREA */}
      {type === "textarea" ? (
        <textarea
          ref={RESIZE.textareaRef}
          id={id}
          name={id}
          placeholder={placeholder}
          value={EVENTS.localValue as string}
          disabled={disabled}
          rows={rows || 1}
          required={asterisk}
          aria-required={asterisk || undefined}
          aria-invalid={!!error_message}
          aria-describedby={error_message ? errorId : undefined}
          className={`block w-full ${input_class} ${error_message ? "border border-red-500" : ""}`}
          style={{
            resize: rows ? "vertical" : "none",
            overflow: rows ? "auto" : "hidden",
          }}
          onChange={EVENTS.handleLocalChange}
          onBlur={EVENTS.handleBlur}
          onFocus={MOBILE.handleFocus}
          {...rest}
        />

      /* BOOLEAN */
      ) : typeof value === "boolean" ? (
        <input
          type={type}
          checked={value}
          id={id}
          name={id}
          disabled={disabled}
          required={asterisk}
          aria-required={asterisk || undefined}
          aria-invalid={!!error_message}
          aria-describedby={error_message ? errorId : undefined}
          className={`block w-full ${input_class} ${error_message ? "border border-red-500" : ""}`}
          onChange={onChange}
          {...rest}
        />

      /* DEFAULT */
      ) : (
        <input
          ref={MOBILE.inputRefInternal}
          type={type}
          placeholder={placeholder}
          value={EVENTS.localValue as string}
          id={id}
          name={id}
          disabled={disabled}
          required={asterisk}
          aria-required={asterisk || undefined}
          aria-invalid={!!error_message}
          aria-describedby={error_message ? errorId : undefined}
          className={`block w-full ${input_class} ${error_message ? "border border-red-500" : ""}`}
          onChange={EVENTS.handleLocalChange}
          onBlur={EVENTS.handleBlur}
          onKeyDown={EVENTS.handleKeyDown}
          onFocus={MOBILE.handleFocus}
          autoComplete={autoComplete}
          {...rest}
        />
      )}

      {/* ERROR MESSAGE */}
      {error_message && (
        <div
          id={errorId}
          role="alert"
          aria-live="polite"
          className="block w-full px-1 text-white bg-red-700"
        >
          <div className="grid grid-cols-[auto_1fr] gap-1 text-sm text-left">
            <i className="bi bi-exclamation-triangle" aria-hidden="true"></i>
            <span>{error_message}</span>
          </div>
        </div>
      )}

      {/* MESSAGGIO AGGIUNTIVO */}
      {message && (
        <div
          id={errorId}
          role="alert"
          aria-live="polite"
          className="block w-full px-2 bg-gray-600 text-xs text-left"
        >
          {message}
        </div>
      )}
    </React.Fragment>
  );
}