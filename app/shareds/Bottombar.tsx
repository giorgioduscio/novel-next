"use client"
import "./Bottombar.sass"

interface Props { 
  children: React.ReactNode; 
  className?: string
}
export default function Bottombar(props: Props) {

  return (<>
    <section id="bottombar" 
            className="fixed bottom-0 right-0 z-30 w-fit print:hidden md:left-1/2 md:-translate-x-1/2">
      <div className={`flex justify-end items-end gap-1 ${props.className || ''}`}>
        {props.children}
      </div>
    </section>
  </>)
}