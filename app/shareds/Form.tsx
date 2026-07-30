/* import Field from "./Field";

interface FormProps {
  handleSubmit: () => void;
  title: string;
  formArray: { key: string, value: string }[];
  submitOnce: boolean;
}

export default function Form({ handleSubmit, title, formArray, submitOnce }: FormProps) {
  return <>
    <h2 className="py-3 text-2xl text-center">{title}</h2>
          <p className="text-sm text-center">
            I campi contrassegnati con <b className="text-red-500">*</b> sono obbligatori
          </p>

          <form onSubmit={handleSubmit} className="">
            {formArray.map(({ key, value }) => (
              <div key={key} className="my-3">
                <Field id={key} 
                       label={key.charAt(0).toUpperCase() + key.slice(1)} 
                       type="text" 
                       placeholder={"Inserire " + key} 
                       value={String(value)} 
                       input_class="py-1 px-2 w-full bg-gray-200 text-black rounded"
                       error_message={form_submitOnce ? (form_errors[key] || "") : ""}
                       onChange={(value) => form_setState({ ...form_state, [key]: value })}
                />
              </div>
            ))}

            <div className="grid grid-cols-2 rounded overflow-hidden">
              <button type="submit" className="p-2 bg-green-700 hover:bg-green-800 transition-colors">
                <i className="me-1 bi bi-plus-lg"></i>
                <span>Aggiungi</span>
              </button>
              <button type="reset"
                      className="p-2 bg-red-700 hover:bg-red-800 transition-colors"
                      onClick={() => form_reset()}>
                <i className="me-1 bi bi-x-lg"></i>
                <span>Reset</span>
              </button>
            </div>

          </form>
  </>
}
*/