import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <div className="max-w-md">
        <h1 className="mb-4 text-3xl font-bold text-gray-900">GranitoSkate Dashboard</h1>
        <p className="mb-6 text-gray-600">
          Bienvenido al panel de administración de GranitoSkate. Por favor, inicia sesión para continuar.
        </p>
        <Button asChild className="bg-brand hover:bg-brand-dark">
          <Link href="/login">Iniciar sesión</Link>
        </Button>
      </div>
    </div>
  )
}
