import React from "react";

interface FragProps {
  if: boolean
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function Frag(props: FragProps) {
  if(!props.if) return null   

  // contenitore div
  if(!!props.className || !!props.style){
    return <div className={props.className} style={props.style}>{props.children}</div>
  }
  // nessun contenitore
  return <React.Fragment>{props.children}</React.Fragment>
}