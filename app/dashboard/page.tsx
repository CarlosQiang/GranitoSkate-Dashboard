import { redirect } from "next/navigation"

export default function DashboardPage() {
  // Redirigir a la página de administradores
  redirect("/dashboard/administradores")
}
