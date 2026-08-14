interface EditModeComponentProps {
  page:{
    isEditMode: boolean;
    toggleEditMode: () => void;
  }
  onClick?: () => void;
}
export default function EditModeComponent({page, onClick}: EditModeComponentProps) {
  const {isEditMode, toggleEditMode} = page;

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    toggleEditMode();
    onClick?.()
  }
  
  return (
    <section id="EditModeComponent" className="relative mx-auto container max-w-[800px]">
      <div className="p-3 fixed bottom-0 z-5">
        <button
          onClick={handleClick}
          title={isEditMode ? "Modalità editing" : "Modalità lettura"}
          className={`py-2 px-3 border rounded-full shadow-lg ${isEditMode ? "bg-gray-100 text-black" : "bg-gray-800"}`}
        >
          <i className={`text-xl bi ${isEditMode ? "bi-pencil" : "bi-eye"}`}></i>
        </button>
      </div>
    </section>
  );
}