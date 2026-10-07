import { tailwind_colors, tailwind_shades } from "@/app/styles/styles";

// gruppi di classi tailwind
export interface TailwindGroup { 
  title:string, 
  icon:string, 
  value:string 
}

export const GROUPS_DATAS :Record<string, TailwindGroup[]> ={
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
      title:"Non allinea",
      icon: "bi-fullscreen", 
      value:"" 
    },
    {
      title:"Limitato",
      icon: "bi-distribute-horizontal", 
      value:"limitato" 
    },
    {
      title:"Allinea a sinistra",
      icon: "bi-align-start", 
      value:"sinistra" 
    },
    {
      title: "Allinea al centro",
      icon: "bi-align-center", 
      value:"centro" 
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
      icon: "bi-chevron-compact-down",
      value: "margini-standard"
    },
    {
      title: "Margini piccoli",
      icon: "bi-chevron-down",
      value: "margini-piccoli"
    },
    {
      title: "Margini medi",
      icon: "bi-chevron-double-down",
      value: "margini-medi"
    },
    {
      title: "Margini grandi",
      icon: "bi-caret-down-fill",
      value: "margini-grandi"
    },
    {
      title: "Margini schermo",
      icon: "bi-eject-fill",
      value: "margini-schermo"
    },
  ],

  BACKGROUNDS: colorsGroups() 
};

function colorsGroups() {
  const result =[
    {
      title: "Nessun colore",
      icon: "bi-palette",
      value: ""
    },
  ];

  for(const _color of tailwind_colors){
    // ignorare
    const ignored =["transparent", "current", 
      "stone", "zinc", "neutral", "slate", "amber", 
      "teal", "emerald", "cyan", 
      "violet", "pink"];
    if(ignored.includes(_color)) continue;

    // bianco e nero
    else if(["white", "black"].includes(_color)){
      const color_result = `bg-${_color}`;
      result.unshift({
        title: color_result,
        icon: `bi-palette text ${color_result}`,
        value: color_result
      })
      continue;
    }

    for(const _shade of tailwind_shades){
      const color_result = `bg-${_color}-${_shade}`;

      result.unshift({
        title: color_result,
        icon: `bi-${_shade/100}-circle text ${color_result}`,
        value: color_result
      })
    }
  }

  console.log("*", result.length);
  
  return result
}