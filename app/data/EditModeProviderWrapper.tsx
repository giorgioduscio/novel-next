"use client";

import { EditModeProvider } from "./EditModeContext";


export default function EditModeProviderWrapper({ children }: { children: React.ReactNode }) {
  return <EditModeProvider>{children}</EditModeProvider>;
}
