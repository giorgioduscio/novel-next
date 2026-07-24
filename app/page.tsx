import { redirect } from "next/navigation";

export default function redirectToHome() {
  return redirect("/chapters");
};