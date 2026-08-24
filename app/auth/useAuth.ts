
import { useEffect, useMemo } from "react"
import { useDot } from "../tools/customStates"
import * as v from "valibot"
import { permission_schema, Permission, auth_code_schema, Book } from "../schemas/book_schema"
import { useAgreeWrapper } from "../shareds/Agree"
import { toast } from "../tools/feedbacksUI"

export default function useAuth() {
  const agree =useAgreeWrapper();

  // localhost
  const LOCAL ={
    permissions_title:'permissions',

    get(){
      try {
        const res = localStorage.getItem(this.permissions_title)
        const _permissions :Permission[] = res ? JSON.parse(res) : []
        return _permissions
      } catch (error) {
        console.error('Errore nel parsing dei permessi:', error)
        return []
      }
    },

    set(permissions: Permission[]){
      localStorage.setItem(this.permissions_title, JSON.stringify(permissions))
    }
  }

  const permissions = useDot<Permission[]>([])
  useEffect(()=>{
    permissions.set(LOCAL.get())
  }, [])

  const FORM ={
    isVisible: useDot(false),
    state: useDot<{key:keyof Permission, value:string, placeholder:string, label:string}[]>([
      { key:"title", value:'', placeholder:"Inserire titolo", label:"Titolo" },
      { key:"auth_code", value:'', placeholder:"Inserire codice", label:"Codice" },
    ]),
    
    reset(){
      this.state.set(prev=> prev.map(item => ({ ...item, value: '' })))
    },

    handleSubmit(e: React.FormEvent){
      e.preventDefault()

      if(!newPermession.success){
        console.error('Errore nella validazione:', newPermession.issues[0].message)
        return
      }

      // se ci sono due codici con lo stesso title  
      const existing = permissions.get().find((perm) => perm.title === newPermession.output.title);
      if(existing) return toast.danger("Titolo già esistente");
      
      // aggiornamento
      const updated = [...permissions.get(), newPermession.output]
      permissions.set(updated)
      LOCAL.set(updated)

      // feedback
      const res = LOCAL.get().find((perm) => perm.title === newPermession.output.title);
      if(!res) return toast.danger("Permesso non trovaato");
      toast.success('Permesso aggiunto');
      FORM.reset()
    }
  }

  const newPermession = useMemo(()=>{
    let formValues :Record<string, string> = {}

    FORM.state.get().forEach((item)=>{
    formValues[item.key] = item.value
    })

    return v.safeParse(permission_schema, formValues)
  }, [JSON.stringify(FORM.state.get())])

  const errors = useMemo(()=>{
    const result :Record<string, string> = {}
    // form
    for(let error of newPermession.issues ||[]){
      const [field, message] = error.message.split(": ")
      result[field] = message
      result['form>'+field] = message
    }
    // codici
    for(let i=0; i < permissions.get().length; i++){
      const code = permissions.get()[i]
      const parsedCode = v.safeParse(permission_schema, code)
      if(!parsedCode.success){
        const [key, message] = parsedCode.issues[0].message.split(": ")
        result[`${i}>${key}`] = message
      }
    }
    return result
  }, [newPermession, permissions.get()])


  // AZIONI
  const checkedTargets =useDot<number[]>([])
  const CRUD ={
    async handleDelete(index:number){
      const target = permissions.get()[index]
      if(!target) return console.error("Codice non trovato");

      if(!(await agree.danger(`Rimuovere '${target.title || target.auth_code}'?`, "Rimuovi"))) return;
      
      const updated = permissions.get().filter((_, i) => i !== index)
      permissions.set(updated)
      LOCAL.set(updated)
      // feedback
      const res = LOCAL.get().find((perm) => perm.title === target.title);
      if(res) return toast.danger("Eliminazione fallita");
      toast.success('Permesso rimosso');
    },
    
    async handleDeleteMany(){
      const targets = checkedTargets.get()
        .map(i => permissions.get()[i].title)
        .filter(Boolean) as string[]
      if(!targets.length) return console.error("Nessun target selezionato");
  
      if(!(await agree.danger(`Rimuovere '${targets.join(', ')}'?`, "Rimuovi"))) return;

      const updated = permissions.get().filter((_, i) => !checkedTargets.get().includes(i))
      permissions.set(updated)
      LOCAL.set(updated)
      checkedTargets.set([])
      // feedback
      const res = LOCAL.get().filter((perm) => targets.includes(perm.title));
      if(res.length > 0) return toast.danger("Eliminazione fallita");
      toast.success('Permessi rimossi');
    },

    handleUpdate(index:number, key: keyof Permission, newValue:string){
      const previousValue = structuredClone((permissions as any).get()[index][key])
      const updated = permissions.get().map((p, i) =>
        i === index ? { ...p, [key]: newValue } : p
      )
      permissions.set(updated)
      LOCAL.set(updated)
      // feedback
      const res = (LOCAL.get()[index] as any)[key] === previousValue;
      if(res) return toast.danger("Aggiornamento fallito");
      toast.success('Permesso aggiornato');
    },

    toggleTarget(index:number){
      const current = checkedTargets.get()
      if(current.includes(index)){
        checkedTargets.set(current.filter(i => i !== index))
      } else {
        checkedTargets.set([...current, index])
      }
    }
  }

  // controlli
  const CONTROLS = {
    canRead(book:Book |undefined){
      if(!book) return false;
      if(!book.auth_read?.length) return true;
      
      const result = permissions.get()
        .map(p=> p.auth_code)
        .includes(book.auth_read);
      return result;
    },

    canWrite(book:Book |undefined){
      if(!book) return false;
      if(!book.auth_write?.length) return true;

      const result = permissions.get()
        .map(p=> p.auth_code)
        .includes(book.auth_write);
      return result;
    }
  }

  return {
    permissions,
    FORM,
    CRUD,
    errors,
    checkedTargets,
    CONTROLS,
  }
}