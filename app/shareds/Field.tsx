import React from "react";

interface FieldProps {
    input_class?: string;
    inline?: boolean;
    id:string
    name:string
    label?: string;
    hide_label?: string
    type: string;
    placeholder: string;
    value: string | boolean;
    disabled?: boolean;
    onChange: (value: any) => void;
    rows?: number;
}

export default function Field({ label, type, placeholder, value, onChange, hide_label, input_class, inline, disabled, rows }: FieldProps) {
    if((label && hide_label) || (!label && !hide_label)){
        throw new Error('Label e hide_label non possono essere usati o omessi insieme. Scegliere quale compilare');
    }

    return (
        <div className={`grid items-center ${inline ? 'grid-cols-[auto_1fr]' : 'grid-cols-1'}`}>

            {/* LABEL */}
            {label ?
              <label htmlFor={label} className="py-1 px-2 text-sm truncate">{label}</label>
            :hide_label ?
              <label htmlFor={hide_label} className="sr-only">{hide_label}</label>
            :null}

            {/* TEXTAREA */}
            {type === 'textarea' ?(
                <textarea placeholder={placeholder} 
                            value={value as string} 
                            id={label} 
                            name={label}
                            title={label}
                            disabled={disabled}
                            className={input_class}
                            style={{ resize: 'none' }}
                            rows={rows}
                            onChange={(e) => onChange(e.target.value)} />

            // CHECKBOX
            ): typeof value === 'boolean' ? (
                <input type={type} 
                        placeholder={placeholder} 
                        checked={value} 
                        id={label}
                        name={label}
                        title={label}
                        disabled={disabled}
                        onChange={(e) => onChange(e.target.checked)} />

            // DEFAULT
            ):(
                <input type={type} 
                        placeholder={placeholder} 
                        value={value as string} 
                        className={input_class}
                        id={label}
                        name={label}
                        title={label}
                        disabled={disabled}
                        onChange={(e) => onChange(e.target.value)} />
            )}
        </div>
    )
}