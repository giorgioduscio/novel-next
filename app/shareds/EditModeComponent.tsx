interface EditModeComponentProps {
  page:{
    isEditMode: boolean;
    toggleEditMode: () => void;
  }
  onClick?: (param:any) => void;
  buttonOnly?: boolean;
}
export default function EditModeComponent({page, onClick, buttonOnly}: EditModeComponentProps) {

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    page.toggleEditMode();
    onClick?.(undefined)
  }
  
  if(buttonOnly) return <ButtonOnly onClick={handleClick} page={page} />;

  return (
    <div className="pr-2 pb-2 ml-auto sticky bottom-0 z-5 w-fit">
      <ButtonOnly onClick={handleClick} page={page} />
    </div>
  );
}

function ButtonOnly({onClick, page}: EditModeComponentProps) {
  return <button
      onClick={onClick}
      title={page.isEditMode ? "Modalità editing" : "Modalità lettura"}
      className={`py-2 px-3 border rounded-full shadow-lg ${page.isEditMode ? "bg-gray-100 text-black" : "bg-gray-800"}`}
    >
      <i className={`text-xl bi ${page.isEditMode ? "bi-pencil" : "bi-eye"}`}></i>
    </button>
}