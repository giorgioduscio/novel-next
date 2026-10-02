import { Book, Part, Section, Paragraph } from "../app/schemas/book_schema";
import { nanoid } from "nanoid";

const FIREBASE_URL = "https://books-3e4c3-default-rtdb.europe-west1.firebasedatabase.app/books";

// Demo book IDs
const DEMO_LETTURA_ID = "demo_lettura";
const DEMO_SCRITTURA_ID = "demo_scrittura";

// Helper to create a paragraph
function createParagraph(text: string, in_style = "", ex_style = ""): Paragraph {
  return {
    id: nanoid(),
    in_style,
    ex_style,
    scripted_style: "text-center margini-standard",
    text,
    isMarcked: false,
  };
}

// Helper to create a section
function createSection(title: string, note: string, paragraphs: Paragraph[]): Section {
  return {
    id: nanoid(),
    title,
    note,
    paragraphs,
  };
}

// Helper to create a part
function createPart(title: string, note: string, sections: Section[]): Part {
  return {
    id: nanoid(),
    title,
    note,
    sections,
  };
}

// Demo data for demo_lettura (read-only demo)
const demoLettura: Book = {
  id: DEMO_LETTURA_ID,
  title: "Demo Lettura - Romanzo Esempio",
  description: "Un libro demo di sola lettura per testare l'interfaccia",
  author_name: "Sistema Demo",
  auth_read: "", // No password required for reading
  auth_write: "demo_write_password_123", // Password for writing
  parts: [
    createPart(
      "Prima Parte",
      "Introduzione alla storia",
      [
        createSection(
          "Capitolo 1: L'Inizio",
          "In questo capitolo conosciamo il protagonista",
          [
            createParagraph("Era una notte buia e tempestosa quando tutto iniziò."),
            createParagraph("Il vento soffiava forte tra gli alberi del bosco antico."),
            createParagraph("Nessuno poteva immaginare cosa sarebbe successo quella sera."),
          ]
        ),
        createSection(
          "Capitolo 2: La Scoperta",
          "Il protagonista scopre qualcosa di incredibile",
          [
            createParagraph("Camminando lungo il sentiero, notò una luce strana."),
            createParagraph("Si avvicinò con cautela, il cuore che batteva forte."),
            createParagraph("Quello che vide cambiò per sempre la sua vita."),
          ]
        ),
      ]
    ),
    createPart(
      "Seconda Parte",
      "Lo sviluppo della trama",
      [
        createSection(
          "Capitolo 3: Il Viaggio",
          "Il protagonista inizia il suo viaggio",
          [
            createParagraph("Preparò le sue cose per il lungo viaggio che lo attendeva."),
            createParagraph("La mappa era antica, ma ancora leggibile."),
            createParagraph("Ogni passo lo portava più vicino al suo destino."),
          ]
        ),
      ]
    ),
  ],
};

// Demo data for demo_scrittura (writable demo)
const demoScrittura: Book = {
  id: DEMO_SCRITTURA_ID,
  title: "Demo Scrittura - Tuo Spazio Creativo",
  description: "Un libro demo per testare le funzionalità di scrittura",
  author_name: "Utente Demo",
  auth_read: "", // No password required for reading
  auth_write: "", // No password required for writing
  parts: [
    createPart(
      "Parte 1",
      "Scrivi qui la tua storia",
      [
        createSection(
          "Sezione 1",
          "Inizia a scrivere il tuo romanzo",
          [
            createParagraph("Questo è un paragrafo di esempio. Puoi modificarlo o cancellarlo."),
            createParagraph("Premi Invio per creare un nuovo paragrafo."),
            createParagraph("Usa le frecce per navigare tra i paragrafi."),
          ]
        ),
      ]
    ),
  ],
};

// Delete a book from Firebase
async function deleteBook(id: string): Promise<void> {
  try {
    const response = await fetch(`${FIREBASE_URL}/${id}.json`, {
      method: "DELETE",
    });
    if (!response.ok) {
      console.error(`Errore nell'eliminazione del libro ${id}:`, response.statusText);
    } else {
      console.log(`Libro ${id} eliminato con successo`);
    }
  } catch (error) {
    console.error(`Errore nell'eliminazione del libro ${id}:`, error);
  }
}

// Save a book to Firebase
async function saveBook(book: Book): Promise<void> {
  try {
    const response = await fetch(`${FIREBASE_URL}/${book.id}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(book),
    });
    if (!response.ok) {
      console.error(`Errore nel salvataggio del libro ${book.id}:`, response.statusText);
    } else {
      console.log(`Libro ${book.id} salvato con successo`);
    }
  } catch (error) {
    console.error(`Errore nel salvataggio del libro ${book.id}:`, error);
  }
}

// Main function to populate demo books
async function HANDLE(): Promise<void> {
  console.log("=== Inizio popolazione libri demo ===");

  // Delete existing demo books
  console.log("\n1. Eliminazione libri demo esistenti...");
  await deleteBook(DEMO_LETTURA_ID);
  await deleteBook(DEMO_SCRITTURA_ID);

  // Wait a bit for deletion to complete
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Create new demo books
  console.log("\n2. Creazione nuovi libri demo...");
  await saveBook(demoLettura);
  await saveBook(demoScrittura);

  console.log("\n=== Popolazione completata ===");
  console.log(`\nLibri creati:`);
  console.log(`- ${demoLettura.title} (ID: ${demoLettura.id})`);
  console.log(`- ${demoScrittura.title} (ID: ${demoScrittura.id})`);
}

// Run the script
HANDLE().catch((error) => {
  console.error("Errore durante l'esecuzione dello script:", error);
  process.exit(1);
});
