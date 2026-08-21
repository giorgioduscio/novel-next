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
    <div className="pb-3 pr-3 ml-auto sticky bottom-0 z-30 w-max">
      <div className="">
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
      className={`py-1 px-2 rounded-full shadow-lg border-2  ${page.isEditMode ? "bg-indigo-500 border-gray-600" : "bg-orange-500 border-gray-600"}`}
    >
      <i className={`text-xl bi ${page.isEditMode ? "bi-pencil" : "bi-eye"}`}></i>
    </button>
}