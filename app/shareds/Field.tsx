import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Frag from "./Frag";

interface FieldProps {
  // proprietà
  inline?: boolean;
  id: string;
  label: string;
  hide_label?: boolean;
  type: string;
  placeholder: string;
  value: string | boolean;
  disabled?: boolean;
  readOnly?: boolean;
  rows?: number;
  message?: string;
  // stile
  input_class?: string;
  label_class?: string;
  // eventi
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => any;
  onInput?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => any;
  onFocus?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => any;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => any;
  onClick?: (e: React.MouseEvent<HTMLInputElement | HTMLTextAreaElement>) => any;

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

  // Copia il valore negli appunti
  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    try {
      const textToCopy = String(localValue);
      
      // Metodo moderno (funziona su HTTPS e contesti sicuri)
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback per dispositivi mobili e contesti non sicuri
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Fallback copy failed:', err);
          throw err;
        }
        
        document.body.removeChild(textArea);
      }
      
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Errore durante la copia:', err);
    }
  };

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
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (e.key === "Tab") {
      // Permette la navigazione naturale del browser con Tab
      return;
    }
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
  return { localValue, setLocalValue, handleLocalChange, handleBlur, handleFocus, handleKeyDown, resetInput, showPassword, togglePassword, handleCopy, copied };
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
  onClick,
  hide_label,
  input_class,
  label_class,
  inline,
  disabled,
  readOnly,
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
        className={`${hide_label ? "sr-only" : label_class || "py-1 px-2 text-sm truncate"} block`}
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
          readOnly={readOnly}
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
          onClick={onClick}
          onKeyDown={EVENTS.handleKeyDown}
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
          readOnly={readOnly}
          required={asterisk}
          aria-required={asterisk || undefined}
          aria-invalid={!!error_message}
          aria-describedby={error_message ? errorId : undefined}
          className={`block w-full ${input_class} ${error_message ? "border border-red-500" : ""}`}
          onChange={onChange}
          onClick={onClick}
          {...rest}
        />

      /* DEFAULT */
      ) : (
        <>
          <input
            ref={MOBILE.inputRefInternal}
            type={type==='password' 
              ? (EVENTS.showPassword ?'text' :'password') 
              : ["search","copy"].includes(type) ?'text' :type
            }
            placeholder={placeholder}
            value={EVENTS.localValue as string}
            id={id}
            name={id}
            disabled={disabled}
            readOnly={readOnly}
            required={asterisk}
            aria-required={asterisk || undefined}
            aria-invalid={!!error_message}
            aria-describedby={error_message ? errorId : undefined}
            className={`block w-full ${input_class} ${error_message ? "border border-red-500" : ""}`}
            onChange={EVENTS.handleLocalChange}
            onBlur={EVENTS.handleBlur}
            onClick={onClick}
            onKeyDown={EVENTS.handleKeyDown}
            onFocus={(e) => {
              EVENTS.handleFocus(e);
              MOBILE.handleFocus();
            }}
            autoComplete={autoComplete}
            {...rest}
          />

          {/* pulsanti */}
          <Frag if={["password","search","copy"].includes(type)} 
                className="absolute right-1 bottom-1 z-1">
            {/* se premuto mostra la password */}
            {type==="password" && (
              <button type="button" onClick={EVENTS.togglePassword} 
                      className="px-1 bg-gray-200/80 text-black rounded outline">
                {EVENTS.showPassword 
                  ? <i className="bi bi-eye-slash" aria-hidden="true"></i>
                  : <i className="bi bi-eye" aria-hidden="true"></i>
                } 
              </button>
            )}
            {/* se premuto, resetta l'input */}
            {(type==="search" && value.length > 0) && (
              <button type="button" onClick={EVENTS.resetInput} 
                      className="px-1 bg-gray-200/80 text-black rounded-full outline">
                <i className="bi bi-x-lg" aria-hidden="true"></i>
              </button>
            )}
            {/* se premuto, copia il valore */}
            {type==="copy" && (
              <button type="button" onClick={EVENTS.handleCopy} 
                      className={`px-1 rounded outline bg-gray-200 text-black`}
                      title={EVENTS.copied ? "Copiato!" : "Copia"}>
                {EVENTS.copied 
                  ? <i className="bi bi-check-lg text-green-700" aria-hidden="true"></i>
                  : <i className="bi bi-clipboard" aria-hidden="true"></i>
                } 
              </button>
            )}
          </Frag>
        </>
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