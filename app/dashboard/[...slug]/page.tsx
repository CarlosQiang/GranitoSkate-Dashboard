import { notFound } from "next/navigation"

export default function CatchAllPage() {
  // Esta página captura todas las rutas que no existen bajo /dashboard
  // y muestra la página 404
  notFound()
}
