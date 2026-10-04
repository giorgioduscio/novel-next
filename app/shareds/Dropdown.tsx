"use client";

import React, { useEffect, useRef, useState } from "react";

/* ESEMPIO UTILIZZO
<Dropdown>
  <DropdownSummary>
    <button className="p-2 bg-blue-500">
      Apri menu
    </button>
  </DropdownSummary>
  <DropdownContent className="absolute bg-white p-2">
    <p>Contenuto del dropdown</p>
  </DropdownContent>
</Dropdown> 
*/

interface DropdownProps {
  children: React.ReactNode;
  className?: string;
}

export function Dropdown({ children, className = "" }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Chiude il dropdown quando si clicca fuori
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    // se è aperto, aggiunge evento
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Gestisce i children per separare summary e content
  const childrenArray = React.Children.toArray(children);
  const summary = childrenArray.find((child) => 
    React.isValidElement(child) && (child.type === DropdownSummary)
  );
  const content = childrenArray.find((child) => 
    React.isValidElement(child) && (child.type === DropdownContent)
  );

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Summary - trigger container */}
      {summary && React.cloneElement(summary as React.ReactElement<any>, {
        onClick: () => setIsOpen(!isOpen),
        "aria-expanded": isOpen,
      })}

      {/* Content - contenuto del dropdown */}
      {content && isOpen && React.cloneElement(content as React.ReactElement<any>)}
    </div>
  );
}

interface DropdownSummaryProps {
  children: React.ReactNode;
  "aria-expanded"?: boolean;
  onClick?: () => void;
}

export function DropdownSummary({ children, "aria-expanded": ariaExpanded, onClick }: DropdownSummaryProps) {
  return (
    <div
      onClick={onClick}
      aria-expanded={ariaExpanded}
    >
      {children}
    </div>
  );
}

interface DropdownContentProps {
  children: React.ReactNode;
  className?: string;
}

export function DropdownContent({ children, className = "" }: DropdownContentProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
