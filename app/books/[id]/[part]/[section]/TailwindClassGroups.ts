import { tailwind_colors, tailwind_shades } from "@/app/styles/styles";

// gruppi di classi tailwind
export interface TailwindGroup { 
  title:string, 
  icon:string, 
  value:string,
  className? :string,
  label?: string,
  key?: string,
}

const _GROUPS_DATAS :Record<string, TailwindGroup[]> ={
  JUSTIFY :[
    {
      title:"Texto a sinistra",
      icon:"bi-text-left",
      value:"text-left"
    },
    {
      title:"testo al centro",
      icon:"bi-text-center",
      value:"text-center"
    },
    {
      title:"Testo a destra",
      icon:"bi-text-right",
      value:"text-right"
    },
  ],

  DIRECTION :[
    {
      title:"Allinea a sinistra",
      icon: "bi-align-start", 
      value:"sinistra" 
    },
    {
      title:"Non allinea",
      icon: "bi-fullscreen", 
      value:"" 
    },
    {
      title: "Allinea al centro",
      icon: "bi-align-center", 
      value:"centro" 
    },
    {
      title:"Limitato",
      icon: "bi-distribute-horizontal", 
      value:"limitato" 
    },
    {
      title: "Allinea a destra",
      icon: "bi-align-end", 
      value:"destra" 
    },
  ],

  COMIX:[
    {
      title: "Testo semplice",
      icon: "bi-alphabet-uppercase",
      value: ""
    },
    {
      title: "Descrizione",
      icon: "bi-card-text",
      value: "descrizione"
    },
    {
      title: "Dialogo",
      icon: "bi-chat-fill",
      value: "dialogo"
    },
    {
      title: "Sussurro",
      icon: "bi-chat-dots",
      value: "sussurro"
    },
    {
      title: "Esclamazione",
      icon: "bi-patch-exclamation-fill",
      value: "esclamazione"
    },
    {
      title: "Lista semplice",
      icon: "bi-list-ul",
      value: "lista"
    },
    {
      title: "Dettaglio",
      icon: "bi-calendar -rotate-90 inline-block",
      value: "dettaglio"
    },
  ],
  

  MARGINS:[
    {
      title: "Senza margine",
      icon: "bi-dash-lg",
      value: ""
    },
    {
      title: "Margini standard",
      icon: "bi-chevron-bar-down",
      value: "margini-standard",
      label: "1"
    },
    {
      title: "Margini piccoli",
      icon: "bi-chevron-bar-down",
      value: "margini-piccoli",
      label: "2"
    },
    {
      title: "Margini medi",
      icon: "bi-chevron-bar-down",
      value: "margini-medi",
      label: "5"
    },
    {
      title: "Margini grandi",
      icon: "bi-chevron-bar-down",
      value: "margini-grandi",
      label: "7"
    },
    {
      title: "Margini schermo",
      icon: "bi-chevron-bar-down",
      value: "margini-schermo",
      label: "10"
    },
  ],


  BACKGROUNDS: (()=>{
    const result :TailwindGroup[] =[
      { title: "Nessun colore",
        icon: "bi-palette",
        value: ""
      },
      { title: "Bianco",
        icon: "bi-palette",
        className: "text bg-white",
        value: "bg-white"
      },
      { title: "Nero",
        icon: "bi-palette",
        className: "text bg-black",
        value: "bg-black"
      },
      
      { title: "", icon: "", value: "" },
      { title: "", icon: "", value: "" },
      { title: "", icon: "", value: "" },
      { title: "", icon: "", value: "" },
      { title: "", icon: "", value: "" },
      { title: "", icon: "", value: "" },
    ];

    for(const _color of tailwind_colors){
      // ignorare
      const ignored =["transparent", "current", "white", "black", "rose"];
      if(ignored.includes(_color)) continue;

      
      for(const _shade of tailwind_shades){
        const color_result = `bg-${_color}-${_shade}`;
        
        result.push({
          title: color_result,
          icon:"",
          className: `text ${color_result}`,
          value: color_result,
          label: _color[0].toUpperCase() + (_shade/100)
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
        icon: "bi-collection",
        value: ""
      },
      { title: "", icon: "", value: "" },
      { title: "", icon: "", value: "" },
      { title: "", icon: "", value: "" },
      { title: "", icon: "", value: "" },
      { title: "", icon: "", value: "" },
      { title: "", icon: "", value: "" },
      { title: "", icon: "", value: "" },
      { title: "", icon: "", value: "" },
    ];

    for(let i = 1; i <= 10; i++){
      // popola gradienti sopre-> sotto
      result.push({
        title: `Gradiente ${i * 10}%`,
        icon: `bi-transparency`,
        className: `bg-fade-${i * 10}`,
        value: `py-2 bg-fade-${i * 10}`,
        label: `${i}`,
      })
      // popola gradienti sotto -> sopra
      reverse.push({
        title: `Gradiente ${i * 10}%`,
        icon: `bi-transparency`,
        className: `-bg-fade-${i * 10}`,
        value: `py-2 -bg-fade-${i * 10}`,
        label: `${i}`,
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