import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <div className="max-w-md">
        <h1 className="mb-4 text-3xl font-bold text-gray-900">Página no encontrada</h1>
        <p className="mb-6 text-gray-600">Lo sentimos, la página que estás buscando no existe o ha sido movida.</p>
        <Button variant="default" asChild className="bg-brand hover:bg-brand-dark">
          <Link href="/login">Volver al inicio</Link>
        </Button>
      </div>
    </div>
  )
}
