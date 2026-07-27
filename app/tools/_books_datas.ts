export interface InputBook{
  id: number;
  title: string;
  description: string;
  author: string;
  parts: {
    [k:string]: {
      [k:string]: string[][];
    }[];
  }[];
}[]

/**GUIDA PER I PARAGRAFI
 * Ogni paaragrafo può contenere fino a 4 elementi:
 * - classe Tailwind (es: "p-3 m-10 bg-white/20 border-2 border-white/50")
 * - (opzionale) pre_text (voce di chi parla nei dialoghi)
 * - testo
 */
export const BOOKS_DATA_INPUT :InputBook[] = [
  {
    id: 1,
    title: "Ombra",
    description: "Un ragazzo sfugge da una vita difficile ma ne comincia un'altra.",
    author: "Giorgio",
    parts: [
      {
        "Piccola parte di mondo": [
          {
            "Il Berretto": [
              [ 
                "All'interno di un'auto degli occhi stanchi guardano oltre il finestrino le luci della città, accompagnati dal suono di una canzone che viene riprodotta dagli auricolari alle orecchie."
              ],
              [ "ms-15 me-3 bg-purple-800 border-2 border-white/50", 
                "Nei posti da passeggero vi è seduto il ragazzo descritto: caucasico, sulla ventina di anni, indossa abiti larghi, ha una corporatura snella e porta dei capelli ricci carnagione."
              ],
              [ "ms-3 me-15 bg-blue-800 border-2 border-white/50", 
                "Nel posto da conducente, invece, c'è un uomo: caucasico, capelli corti e mossi, si gira verso il ragazzo e lo guarda con compassione, poi torna a guardare la strada."
              ],
              [  
                "Dopo molti minuti l'auto arriva nei pressi di un palazzo e si posteggia."
              ],

              [ "ms-3 me-10 bg-blue-800 rounded-3xl border-1", 
                "L'uomo:",
                "Toglie le chiavi e guarda la strada davanti a sé, poi guarda il passeggero attraverso lo specchio “Diego”"
              ],
              [ "ms-10 me-3 bg-purple-800 rounded-3xl border-1", 
                "Diego:",
                "Si riprende dalla sonnolenza, lo guarda e toglie un auricolare"
              ],
              [ "ms-3 me-10 bg-blue-800 rounded-3xl border-1", 
                "L'uomo:",
                "“Dai scendiamo. Siamo arrivati”"
              ],
              [ "mx-3 bg-pink-800 border-1", 
                "I due arrivano dentro un appartamento, subito si presenta un open space con una cucina e trovano una giovane ragazza: sulla quindicina di anni, capelli corti, sta cucinando ai fornelli ma, quando sente la porta aprirsi, si gira e li guarda contenta."
              ],
              [ "---" ],
            ],
          },
        ],
      },
    ],
  },
];