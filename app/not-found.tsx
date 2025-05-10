import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingBag } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#d29a43]/10">
          <ShoppingBag className="h-8 w-8 text-[#d29a43]" />
        </div>
        <h1 className="mb-4 text-6xl font-bold text-[#d29a43]">404</h1>
        <h2 className="mb-4 text-2xl font-semibold text-gray-900">Página no encontrada</h2>
        <p className="mb-6 text-gray-600">Lo sentimos, la página que estás buscando no existe o ha sido movida.</p>
        <Button asChild className="w-full">
          <Link href="/dashboard">Volver al Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
