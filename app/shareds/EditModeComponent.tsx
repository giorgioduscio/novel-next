interface EditModeComponentProps {
  page:{
    isEditMode: boolean;
    toggleEditMode: () => void;
  }
  onClick?: (param:any) => void;
  buttonOnly?: boolean;
}

// componente che renderizza il pulsante di toggle modalità editing
export default function EditModeComponent({page, onClick, buttonOnly}: EditModeComponentProps) {
  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    page.toggleEditMode();
    onClick?.(undefined)
  }
  
  if(buttonOnly) return <ButtonOnly onClick={handleClick} page={page} />;

  return (
    <div className="pr-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))] mx-auto max-w-[400px] sticky bottom-0 z-30 pointer-events-none w-full">
      <div className="flex justify-end pointer-events-auto">
        <ButtonOnly onClick={handleClick} page={page} />
      </div>
    </div>
  );
}

// renderizza solo il pulsante
function ButtonOnly({onClick, page}: EditModeComponentProps) {
  return <button
      onClick={onClick}
      title={page.isEditMode ? "Modalità editing" : "Modalità lettura"}
      className={`py-2 px-3 rounded-full shadow-lg ${page.isEditMode ? "bg-indigo-500" : "bg-orange-600"}`}
    >
      <i className={`text-xl bi ${page.isEditMode ? "bi-pencil" : "bi-eye"}`}></i>
    </button>
}