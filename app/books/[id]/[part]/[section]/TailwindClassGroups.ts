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
      icon: "bi-aspect-ratio", 
      value:"" 
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
      title: "Nessun margine",
      icon: "bi-bricks",
      value: ""
    },
    {
      title: "Margini standard",
      icon: "bi-view-list",
      value: "margini-standard"
    },
    {
      title: "Margini medi",
      icon: "bi-distribute-vertical",
      value: "margini-medi"
    },
    {
      title: "Margini grandi",
      icon: "bi-distribute-vertical",
      value: "margini-grandi"
    },
    {
      title: "Margini schermo",
      icon: "bi-window-fullscreen",
      value: "margini-schermo"
    },
  ]
};