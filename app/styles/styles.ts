"use client";

import { useEffect } from "react";

export default function DynamicStyles() {
  useEffect(() => {
    applyStyle();
  }, []);

  return null;
}


// === TESTO AD ALTO CONTRASTO PER TUTTI I COLORI TAILWIND ===
export const tailwind_colors_steps = [
  { bg:"transparent", color:"white" }, 
  { bg:"current", color:'white' }, 
  { bg:"black",   color:"white" }, 
  { bg:"white",   color:"black" }, 
  { bg:"red",     step: 400}, 
  { bg:"gray",    step: 500}, 
  { bg:"yellow",  step: 600}, 
  { bg:"green",   step: 600}, 
  { bg:"blue",    step: 400}, 
  { bg:"slate",   step: 400}, 
  { bg:"zinc",    step: 400}, 
  { bg:"neutral", step: 400}, 
  { bg:"stone",   step: 400}, 
  { bg:"orange",  step: 400}, 
  { bg:"amber",   step: 400}, 
  { bg:"lime",    step: 500}, 
  { bg:"emerald", step: 400}, 
  { bg:"teal",    step: 400}, 
  { bg:"cyan",    step: 400}, 
  { bg:"sky",     step: 400}, 
  { bg:"purple",  step: 400}, 
  { bg:"violet",  step: 400}, 
  { bg:"fuchsia", step: 500}, 
  { bg:"pink",    step: 400}, 
  { bg:"rose",    step: 400}, 
  { bg:"indigo",  step: 400}, 
];
export const tailwind_colors = tailwind_colors_steps.map(item=> item.bg)

export const tailwind_shades = [100, 200, 300, 400, 500, 600, 700, 800, 900];

function applyStyle() {
  const styleTag = document.createElement("style");

  // === TRANSLATE (X e Y) ===
  const translateClasses = [1, 2, 3, 4, 5].map(i => `
    .translate-y-${i} {
      transform: translateY(${i}rem);
    }
    .-translate-y-${i} {
      transform: translateY(-${i}rem);
    }
    .translate-x-${i} {
      transform: translateX(${i}rem);
    }
    .-translate-x-${i} {
      transform: translateX(-${i}rem);
    }
  `).join("\n");


  // === CLIP-PATH (Slash e Reverse Slash) ===
  const slashVariants = [
    { name: "left", clip: "polygon(5% 0%, 100% 0%, 100% 100%, 0% 100%)" },
    { name: "top", clip: "polygon(0% 0%, 100% 10%, 100% 100%, 0% 100%)" },
    { name: "right", clip: "polygon(0% 0%, 100% 0%, 95% 100%, 0% 100%)" },
    { name: "bottom", clip: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 90%)" },
    { name: "x", clip: "polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%)" },
    { name: "y", clip: "polygon(0% 0%, 100% 10%, 100% 100%, 0% 90%)" },
  ];

  const rSlashVariants = [
    { name: "left", clip: "polygon(0% 0%, 100% 0%, 100% 100%, 5% 100%)" },
    { name: "top", clip: "polygon(0% 10%, 100% 0%, 100% 100%, 0% 100%)" },
    { name: "right", clip: "polygon(0% 0%, 95% 0%, 100% 100%, 0% 100%)" },
    { name: "bottom", clip: "polygon(0% 0%, 100% 0%, 100% 90%, 0% 100%)" },
    { name: "x", clip: "polygon(0% 0%, 95% 0%, 100% 100%, 5% 100%)" },
    { name: "y", clip: "polygon(0% 10%, 100% 0%, 100% 90%, 0% 100%)" },
  ];

  const slashClasses = [
    ...slashVariants.map(v => `
      .slash-${v.name} {
        clip-path: ${v.clip};
      }
    `),
    ...rSlashVariants.map(v => `
      .r-slash-${v.name} {
        clip-path: ${v.clip};
      }
    `),
  ].join("\n");


  

  // Genera tutte le classi .text.bg-*-* usando tailwind_colors_steps
  const textBgClasses = tailwind_colors_steps.map(item => {
    // Colori speciali con colore definito
      if (item.color) {
        return `
          .text.bg-${item.bg} {
            color: ${item.color};
          }
        `;
      // Colori con step per sfumature
      } else if (item.step) {
        return tailwind_shades
          .map(shade => {
            const textColor = shade < item.step ? "black" : "white";
            return `
              .text.bg-${item.bg}-${shade} {
                color: ${textColor};
              }
            `;
          })
          .join("\n");
      }
      return "";
    })
    .join("\n");

  // Combina tutti gli stili
  styleTag.textContent = [
    translateClasses,
    slashClasses,
    textBgClasses,
  ].join("\n");

  document.head.appendChild(styleTag);
}

  
// bordi della classe .dettaglio
export class DettaglioBorders {
  constructor() {
    const dettagli = document.querySelectorAll<HTMLElement>('.dettaglio')
    if (dettagli.length)

      dettagli.forEach((el) => {
        const bg = getComputedStyle(el).backgroundColor;
        el.style.borderColor = `color-mix(in srgb, ${bg} 40%, #00000080)`;
      });
  }
}