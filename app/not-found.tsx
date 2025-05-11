import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-6xl font-bold text-granito">404</h1>
      <h2 className="text-2xl font-semibold mt-4">Página no encontrada</h2>
      <p className="text-muted-foreground mt-2 text-center">
        Lo sentimos, la página que estás buscando no existe o ha sido movida.
      </p>
      <Button asChild className="mt-8">
        <Link href="/dashboard">Volver al dashboard</Link>
      </Button>
    </div>
  )
}
