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
  { bg:"white",   color:"black" }, 
  { bg:"black",   color:"white" }, 

  { bg:"yellow",  white_after: 600}, 
  { bg:"amber",   white_after: 600}, 
  { bg:"lime",    white_after: 600}, 
  { bg:"green",   white_after: 600}, 
  { bg:"cyan",    white_after: 500}, 
  { bg:"teal",    white_after: 500}, 
  { bg:"emerald", white_after: 500}, 
  { bg:"sky",     white_after: 500}, 
  { bg:"orange",  white_after: 500}, 
  { bg:"fuchsia", white_after: 400}, 
  { bg:"blue",    white_after: 400}, 
  { bg:"pink",    white_after: 400}, 
  { bg:"rose",    white_after: 400}, 
  { bg:"red",     white_after: 400}, 
  { bg:"purple",  white_after: 400}, 
  { bg:"violet",  white_after: 400}, 
  { bg:"indigo",  white_after: 400}, 
  { bg:"slate",   white_after: 400}, 
  { bg:"neutral", white_after: 500}, 
  { bg:"stone",   white_after: 500}, 
  { bg:"gray",    white_after: 400}, 
  { bg:"zinc",    white_after: 500}, 
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
      // Colori con white_after per sfumature
      } else if (item.white_after) {
        return tailwind_shades
          .map(shade => {
            const textColor = shade < item.white_after ? "black" : "white";
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
    appClasses(),
  ].join("\n");

  document.head.appendChild(styleTag);
}

const colorTokens: Record<string, { value: string; fg: string }> = {
  primary:   { value: 'var(--color-lime-500)', fg: 'black' },
  secondary: { value: 'var(--color-lime-700)', fg: 'white' },
  tertiary:  { value: 'var(--color-lime-800)', fg: 'white' },
  danger:    { value: 'var(--color-red-500)',  fg: 'white' },
  light:     { value: 'var(--color-lime-300)', fg: 'black' },
  neutral:   { value: 'var(--color-gray-600)', fg: 'white' },
  dark:      { value: 'var(--color-dark)',     fg: 'white' },
};

function appClasses(): string {
  const blocks: string[] = [];

  for (const [name, { value, fg }] of Object.entries(colorTokens)) {
    blocks.push(`.text-${name} {
      color: ${value};
    }
    .text-bg-${name} {
      background-color: ${value};
      color: ${fg};
    }
    .bg-${name} {
      background-color: ${value};
    }
    .border-${name} {
      border-color: ${value};
    }
    .outline-${name} {
      outline-color: ${value};
    }`);
  }

  return blocks.join('\n');
};
  
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