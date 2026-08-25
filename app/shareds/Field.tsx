import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

interface FieldProps {
  // proprietà
  input_class?: string;
  inline?: boolean;
  id: string;
  label: string;
  hide_label?: boolean;
  type: string;
  placeholder: string;
  value: string | boolean;
  disabled?: boolean;
  rows?: number;
  message?: string;
  // eventi
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => any;
  onInput?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => any;
  onFocus?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => any;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => any;

  // validazione
  error_message?: string;
  asterisk?: boolean;

  // altro
  [key: string]: any;
}


const useEvents = ({ value, onChange, onInput, onFocus, onBlur }: Partial<FieldProps>) => {

  // Sincronizza localValue con value
  useEffect(() => {
    setLocalValue(value !== undefined && value !== null ? value : "");
  }, [value]);
  

  // Gestisce il cambiamento del valore locale (onInput - comportamento React onChange)
  function handleLocalChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>){
      setLocalValue(e.target.value);
      onInput?.(e); // Triggera ad ogni cambiamento
  };

  // Gestisce il blur (perdita di focus) - onChange HTML
  function handleBlur (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>){
    onBlur?.(e); // Chiama il prop onBlur
    const hasChanged = localValue !== value;
    if (!hasChanged) return;
    onChange?.(e as any); // Chiama onChange solo se il valore è cambiato
  };

  // Gestisce il focus
  function handleFocus(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>){
    onFocus?.(e); // Chiama il prop onFocus
  };

  // Gestisce la pressione di Enter (solo per input non textarea) - onChange HTML
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      const hasChanged = localValue !== value;
      if (!hasChanged) return;
      onChange?.(e as any); // Chiama onChange su Enter
    }
  };
  
  // Resetta l'input
  function resetInput() {
    setLocalValue("");
    onChange?.({ target: { value: "" } } as any);
  }

  // mostra pasword
  const [showPassword, setShowPassword] = useState(false);
  function togglePassword() {
    setShowPassword(!showPassword);
  }

  const [localValue, setLocalValue] = useState(value !== undefined && value !== null ? value : "");
  return { localValue, setLocalValue, handleLocalChange, handleBlur, handleFocus, handleKeyDown, resetInput, showPassword, togglePassword };
};


// Custom Hook per gestire l'adattamento mobile e focus tastiera
const useMobile = ({ type }: Partial<FieldProps>) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRefInternal = useRef<HTMLInputElement | null>(null);

  // Scrolla la pagina per visualizzare l'elemento centrato, gestendo la comparsa della tastiera
  function handleFocus() {
    const element = type === 'textarea' ? textareaRef.current : inputRefInternal.current;
    if (!element) return;

    element.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Secondo passaggio dopo che la tastiera mobile ha completato l'animazione di apertura
    setTimeout(() => {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  }

  return { textareaRef, inputRefInternal, handleFocus };
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
  onInput,
  onFocus,
  onBlur,
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
  const EVENTS = useEvents({ value, onChange, onInput, onFocus, onBlur });
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
          onFocus={(e) => {
            EVENTS.handleFocus(e);
            MOBILE.handleFocus();
          }}
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
        <div className="relative">
          <input
            ref={MOBILE.inputRefInternal}
            type={type==='password' ? (EVENTS.showPassword ? 'text' : 'password') : type}
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
            onFocus={(e) => {
              EVENTS.handleFocus(e);
              MOBILE.handleFocus();
            }}
            autoComplete={autoComplete}
            {...rest}
          />
          {/* pulsanti */}
          {/* se premuto mostra la password */}
          {type==="password" && (
            <div className="h-full absolute right-0 top-0  flex items-center justify-center">
              <button type="button" onClick={EVENTS.togglePassword} 
                      className="me-1 py-1 px-2 bg-gray-800/80 rounded-full text-xl block">
                {EVENTS.showPassword 
                  ? <i className="bi bi-eye-slash" aria-hidden="true"></i>
                  : <i className="bi bi-eye" aria-hidden="true"></i>
                } 
              </button>
            </div>
          )}
          {/* se premuto, resetta l'input */}
          {type==="search" && (
            <div className="absolute right-0 top-0">
              <button type="button" onClick={EVENTS.resetInput} 
                      className="m-1 px-1 bg-gray-800/80 rounded-full text-2xl block">
                <i className="bi bi-x" aria-hidden="true"></i>
              </button>
            </div>
          )}
        </div>
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
          className="block w-full px-2 bg-indigo-600 text-xs text-left"
        >
          {message}
        </div>
      )}
    </React.Fragment>
  );
}