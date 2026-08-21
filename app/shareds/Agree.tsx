"use client";

import React, { createContext, useContext, useState } from 'react';

// COMPONENTE VISUALE
interface AgreeComponentProps {
  title: string;
  message: string;
  btn_label: string;
  btn_color: "primary" | "success" | "danger" | "warning";
  callback: () => any;
  onCancel: () => any;
}

function AgreeComponent({ title, message, btn_label, btn_color, callback, onCancel }: AgreeComponentProps) {
  const colors = {
    primary: "bg-blue-600    text-white",
    success: "bg-green-600   text-white",
    danger:  "bg-red-600     text-white",
    warning: "bg-yellow-600  text-white",
  }

  return (
    <div id="AgreeComponent" role="dialog" aria-modal="true" aria-labelledby="agree-title" aria-describedby="agree-message">
      <div className="mt-15 text-center rounded-lg bg-indigo-900 text-white shadow-lg overflow-hidden">
        {/* HEADER */}
        <div className={`px-4 py-3 ${colors[btn_color]}`}>
          <h2 id="agree-title" className="text-xl font-semibold">{title}</h2>
        </div>

        {/* MESSAGE */}
        <div className="px-4 py-3">
          <p id="agree-message" className="mb-0">{message}</p>
        </div>

        {/* BUTTONS */}
        <div className="p-3 flex justify-between items-center gap-3">
          <button
            type="button"
            className={`py-2 px-3 rounded ${colors[btn_color]} truncate`}
            onClick={callback}
            autoFocus
          >
          <i className="bi bi-check-lg me-2" aria-hidden="true"></i>
            {btn_label}
          </button>

          <button
            type="button"
            className="py-2 px-3 rounded bg-indigo-600 truncate"
            onClick={onCancel}
          >
            <i className="bi bi-x-lg me-2" aria-hidden="true"></i>
            Annulla
          </button>
        </div>
      </div>
    </div>
  );
}



// PROVIDER E HOOK
const AgreeContext = createContext<{
  showAgree: (
    title: string,
    message: string,
    btnLabel: string,
    btnColor: "primary" | "success" | "danger" | "warning"
  ) => Promise<boolean>;
} | undefined>(undefined);

export function AgreeProvider({ children }: { children: React.ReactNode }) {
  const [agreeState, setAgreeState] = useState<{
    show: boolean;    title: string;
    message: string;  btnLabel: string;
    btnColor: "primary" | "success" | "danger" | "warning";
    resolve: ((value: boolean) => void) | null;
  }>({
    show: false,
    title: '',
    message: '',
    btnLabel: '',
    btnColor: 'danger',
    resolve: null,
  });

  function showAgree(title: string, message: string, btnLabel: string, btnColor: "primary" | "success" | "danger" | "warning"): Promise<boolean> {
    return new Promise((resolve) => {
      setAgreeState({
        show: true,
        title,
        message,
        btnLabel,
        btnColor,
        resolve,
      });
    });
  };

  function handleCallback() {
    if (agreeState.resolve) {
      agreeState.resolve(true);
    }
    setAgreeState(prev => ({ ...prev, show: false, resolve: null }));
  };

  function handleBack() {
    if (agreeState.resolve) {
      agreeState.resolve(false);
    }
    setAgreeState(prev => ({ ...prev, show: false, resolve: null }));
  };

  return (
    <AgreeContext.Provider value={{ showAgree }}>
      {children}
      {agreeState.show && (
        <div className='p-3 fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto pb-[calc(1rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))]'>
          <AgreeComponent
            title={agreeState.title}
            message={agreeState.message}
            btn_label={agreeState.btnLabel}
            btn_color={agreeState.btnColor}
            callback={handleCallback}
            onCancel={handleBack}
          />
        </div>
      )}
    </AgreeContext.Provider>
  );
}

function useAgree() {
  const context = useContext(AgreeContext);
  if (!context) {
    throw new Error('useAgree must be used within AgreeProvider');
  }
  return context;
}



// WRAPPER PER SINTASSI COMPATIBILE
export function useAgreeWrapper() {
  const { showAgree } = useAgree();

  return {
    primary(message: string, btnText: string) {
      return showAgree('Conferma', message, btnText, 'primary');
    },
    danger(message: string, btnText: string) {
      return showAgree('Conferma eliminazione', message, btnText, 'danger');
    },
    success(message: string, btnText: string) {
      return showAgree('Successo', message, btnText, 'success');
    },
    warning(message: string, btnText: string) {
      return showAgree('Avviso', message, btnText, 'warning');
    },
  };
}