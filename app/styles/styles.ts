"use client";

import { useEffect } from "react";

export default function DynamicStyles() {
    useEffect(() => {
        applyStyle();
    }, []);

    return null;
}

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


    // === TESTO AD ALTO CONTRASTO PER TUTTI I COLORI TAILWIND ===
    const colors = [
        "transparent", "current", "black", "white",
        "indigo", "red", "gray", "yellow", "green", "blue",
        "slate", "zinc", "neutral", "stone", "orange", "amber",
        "lime", "emerald", "teal", "cyan", "sky", "purple",
        "violet", "fuchsia", "pink", "rose"
    ];

    const shades = [100, 200, 300, 400, 500, 600, 700, 800, 900];

    // Mappa per i colori speciali (black/white/transparent/current)
    const specialColors: Record<string, string> = {
        transparent: "black",
        current: "black",
        black: "white",
        white: "black",
    };

    // Genera le regole per i colori speciali
    const specialColorClasses = Object.entries(specialColors)
        .map(([bg, text]) => `
            .text.bg-${bg} {
                color: ${text};
            }
        `)
        .join("\n");

    // Genera le regole per le sfumature di black e white
    const blackWhiteShadeClasses = shades
        .map(shade => `
            .text.bg-black\\/${shade} {
                color: white;
            }
            .text.bg-white\\/${shade} {
                color: black;
            }
        `)
        .join("\n");

    // Genera le regole per i colori con sfumature
    const colorShadeClasses = colors
        .filter(color => !Object.keys(specialColors).includes(color))
        .map(color => {
            return shades
                .map(shade => {
                    // Logica per determinare il colore del testo
                    const isLightColor =
                        color === "red" ||
                        color === "yellow" ||
                        color === "amber" ||
                        color === "lime" ||
                        color === "orange";
                    const isMediumColor =
                        color === "green" ||
                        color === "blue" ||
                        color === "slate" ||
                        color === "zinc" ||
                        color === "neutral" ||
                        color === "stone" ||
                        color === "emerald" ||
                        color === "teal" ||
                        color === "cyan" ||
                        color === "sky" ||
                        color === "pink" ||
                        color === "rose";
                    const textColor = (isLightColor && shade < 500) || (isMediumColor && shade < 500)
                        ? "black"
                        : "white";
                    return `
                        .text.bg-${color}-${shade} {
                            color: ${textColor};
                        }
                    `;
                }).join("\n");
        }).join("\n");



    // Combina tutti gli stili
    const allStyles = [
        translateClasses,
        slashClasses,
        specialColorClasses,
        blackWhiteShadeClasses,
        colorShadeClasses,
    ].join("\n");

    styleTag.textContent = allStyles;
    document.head.appendChild(styleTag);
}