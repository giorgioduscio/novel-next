interface EditModeComponentProps {
  page:{
    isEditMode: boolean;
    toggleEditMode: () => void;
  }
}
export default function EditModeComponent({page}: EditModeComponentProps) {
  const {isEditMode, toggleEditMode} = page;
  
  return (
    <section id="EditModeComponent" className="p-3 fixed end-0 bottom-0 z-5">
      <button onClick={toggleEditMode}
        title={isEditMode ? "Modalità editing" : "Modalità lettura"}
        className={`py-2 px-3 border rounded-full shadow-lg ${isEditMode ? "bg-gray-100 text-black" : "bg-gray-800"}`}
      >
        <i className={`text-xl bi ${isEditMode ? "bi-pencil" : "bi-eye"}`}></i> 
      </button>
    </section>
  );
}