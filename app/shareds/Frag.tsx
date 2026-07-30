import React from "react";

/**
 * -----------------------------------------------------------------------------
 * Frag
 * -----------------------------------------------------------------------------
 *
 * Componente per il rendering condizionale.
 *
 * Funzionamento:
 * - Se la proprietà "if" è true, viene renderizzato il contenuto principale.
 * - Se la proprietà "if" è false, viene renderizzato il contenuto racchiuso
 *   all'interno di <Frag.Else>, se presente.
 * - Se non esiste un ramo Else e la condizione è false, il componente non
 *   renderizza nulla.
 *
 * Il componente può inoltre creare opzionalmente un elemento <div> contenitore
 * quando viene specificata una className o uno style; in caso contrario utilizza
 * un React.Fragment per non aggiungere nodi inutili al DOM.
 *
 * Esempio:
 *
 * <Frag if={isAdmin}>
 *   <AdminPanel />
 *
 *   <Frag.Else>
 *     <UserPanel />
 *   </Frag.Else>
 * </Frag>
 * -----------------------------------------------------------------------------
 */

interface FragProps {
  if: boolean;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

interface ElseProps {
  children: React.ReactNode;
}

type FragComponent = React.FC<FragProps> & {
  Else: React.FC<ElseProps>;
};

// Componente utilizzato esclusivamente come identificatore del ramo "else".
const Else: React.FC<ElseProps> = ({ children }) => <>{children}</>;

const Frag: FragComponent = (props) => {

  // Converte i children in un array per facilitarne l'analisi.
  const children = React.Children.toArray(props.children);

  // Contenuto del ramo <Frag.Else>.
  let elseNode: React.ReactNode = null;

  // Contenuto principale (tutti i children escluso <Frag.Else>).
  const mainNodes: React.ReactNode[] = [];

  // Divide i children tra ramo principale e ramo else.
  children.forEach(child => {

    // Se il child è <Frag.Else>, ne memorizza il contenuto.
    if (React.isValidElement(child) && child.type === Else) {
      elseNode = (child as React.ReactElement<ElseProps>).props.children;
    }

    // Tutti gli altri elementi appartengono al ramo principale.
    else {
      mainNodes.push(child);
    }

  });

  // Seleziona il contenuto da renderizzare.
  const content = props.if ? mainNodes : elseNode;

  // Nessun contenuto disponibile.
  if (content == null) return null;

  // Crea un contenitore solo se richiesto.
  if (props.className || props.style) {
    return (
      <div className={props.className} style={props.style}>
        {content}
      </div>
    );
  }

  // Nessun contenitore: utilizza React.Fragment.
  return <>{content}</>;
};

// Espone il componente Else come proprietà statica di Frag.
Frag.Else = Else;

export default Frag;