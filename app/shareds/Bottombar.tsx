"use client"
import "./Bottombar.sass"

interface Props { children: React.ReactNode; }
export default function Bottombar(props: Props) {

  return (<>
    <section id="bottombar" 
            className="pb-2 px-2 fixed bottom-0 right-0 z-30 w-fit print:hidden md:left-1/2 md:-translate-x-1/2">
      <div className="flex items-end gap-2">
        {props.children}
      </div>
    </section>
  </>)
}