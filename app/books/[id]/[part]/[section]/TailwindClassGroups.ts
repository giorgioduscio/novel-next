import { tailwind_colors, tailwind_shades } from "@/app/styles/styles";
import * as v from "valibot";


// gruppi di classi tailwind3
export const TailwindGroupSchema =v.object({
  title: v.string(),
  class_to_insert: v.string(),

  button_icon:      v.optional(v.string()),
  button_label:     v.optional(v.string()),
  button_className: v.optional(v.string()),
  
  key: v.optional(v.string()),
})

export type TailwindGroup = v.InferOutput<typeof TailwindGroupSchema>

const _GROUPS_DATAS :Record<string, TailwindGroup[]> ={
  JUSTIFY :[
    {
      title:"Texto a sinistra",
      class_to_insert:"text-left",

      button_icon: "bi-text-left", 
    },
    {
      title:"testo al centro",
      class_to_insert:"text-center",

      button_icon: "bi-text-center", 
    },
    {
      title:"Testo a destra",
      class_to_insert:"text-right",

      button_icon: "bi-text-right", 
    },
  ],

  DIRECTION :[
    {
      title:"Non allinea",
      button_icon: "bi-fullscreen", 
      class_to_insert:"",
    },
    {
      title:"Allinea a sinistra",
      button_icon: "bi-align-start",
      class_to_insert:"sinistra",
    },
    {
      title: "Allinea al centro",
      button_icon: "bi-align-center",
      class_to_insert:"centro",
    },
    {
      title:"Limitato",
      button_icon: "bi-distribute-horizontal",
      class_to_insert:"limitato",
    },
    {
      title: "Allinea a destra",
      button_icon: "bi-align-end",
      class_to_insert:"destra",
    },
  ],

  COMIX:[
    {
      title: "Testo semplice",
      class_to_insert: "",
      button_icon: "bi-alphabet-uppercase",
    },
    {
      title: "Descrizione",
      class_to_insert: "descrizione",
      button_icon: "bi-card-text",
    },
    {
      title: "Dialogo",
      class_to_insert: "dialogo",
      button_icon: "bi-chat-fill",
    },
    {
      title: "Sussurro",
      class_to_insert: "sussurro",
      button_icon: "bi-chat-dots",
    },
    {
      title: "Esclamazione",
      class_to_insert: "esclamazione",
      button_icon: "bi-patch-exclamation-fill",
    },
    {
      title: "Lista semplice",
      class_to_insert: "lista",
      button_icon: "bi-list-ul",
    },
    {
      title: "Dettaglio",
      class_to_insert: "dettaglio",
      button_icon: "bi-calendar -rotate-90 inline-block",
    },
  ],
  

  MARGINS:[
    {
      title: "Senza margine",
      class_to_insert: "",
      button_icon: "bi-dash-lg", 
    },
    {
      title: "Margini standard",
      class_to_insert: "margini-standard",
      button_icon: "bi-chevron-bar-down",
      button_label: "100",
    },
    {
      title: "Margini piccoli",
      class_to_insert: "margini-piccoli",
      button_icon: "bi-chevron-bar-down",
      button_label: "200",
    },
    {
      title: "Margini medi",
      class_to_insert: "margini-medi",
      button_icon: "bi-chevron-bar-down",
      button_label: "300",
    },
    {
      title: "Margini grandi",
      class_to_insert: "margini-grandi",
      button_icon: "bi-chevron-bar-down",
      button_label: "400",
    },
    {
      title: "Margini schermo",
      class_to_insert: "margini-schermo",
      button_icon: "bi-chevron-bar-down",
      button_label: "600",
    },
  ],


  BACKGROUNDS: (()=>{
    const result :TailwindGroup[] =[
      { title: "Nessun colore",
        class_to_insert: "",
        button_icon: "bi-palette", 
      },
      { title: "Bianco",
        class_to_insert: "bg-white",
        button_icon: "bi-palette", 
        button_className: "text bg-white",
      },
      { title: "Nero",
        class_to_insert: "bg-black",
        button_icon: "bi-palette", 
        button_className: "text bg-black",
      },
      
      { title: "", class_to_insert: "" },
      { title: "", class_to_insert: "" },
      { title: "", class_to_insert: "" },
      { title: "", class_to_insert: "" },
      { title: "", class_to_insert: "" },
      { title: "", class_to_insert: "" },
    ];

    for(const _color of tailwind_colors){
      // ignorare
      const ignored =["transparent", "current", "white", "black", "rose"];
      if(ignored.includes(_color)) continue;

      
      for(const _shade of tailwind_shades){
        const color_result = `bg-${_color}-${_shade}`;
        
        result.push({
          title: color_result,
          class_to_insert: color_result,
          button_icon: "",
          button_label: _color[0].toUpperCase() + (_shade/100),
          button_className: `rounded text ${color_result}`,
        })
      }
    }
    
    return result
  })(),


  ESTERNAL_STYLES: (()=>{
    // 1) stili vuoti o nulli
    const reverse :TailwindGroup[] =[];
    const result  :TailwindGroup[] =[
      {
        title: "Nessuno sfondo",
        class_to_insert: "",
        button_icon: "bi-collection", 
      },
      { title: "", class_to_insert: "" },
      { title: "", class_to_insert: "" },
      { title: "", class_to_insert: "" },
      { title: "", class_to_insert: "" },
      { title: "", class_to_insert: "" },
      { title: "", class_to_insert: "" },
      { title: "", class_to_insert: "" },
      { title: "", class_to_insert: "" },
    ];

    for(let i = 1; i <= 10; i++){
      // popola gradienti sopre-> sotto
      result.push({
        title: `Gradiente ${i * 10}%`,
        class_to_insert: `py-2 bg-fade-${i * 10}`,
        button_icon: `bi-transparency`,
        button_label: `${i}`,
        button_className: `bg-fade-${i * 10}`,
      })
      // popola gradienti sotto -> sopra
      reverse.push({
        title: `Gradiente ${i * 10}%`,
        class_to_insert: `py-2 -bg-fade-${i * 10}`,
        button_icon: `bi-transparency`,
        button_label: `${i}`,
        button_className: `-bg-fade-${i * 10}`,
      })
    }

    return [...result, ...reverse]
  })()
};

// aggiunge l'attributo key
export const GROUPS_DATAS :typeof _GROUPS_DATAS = {}
for(const key in _GROUPS_DATAS){
  GROUPS_DATAS[key] = _GROUPS_DATAS[key].map(_group=>({..._group, key}))
}