import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-6xl font-bold text-[#c59d45] mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-4">Página no encontrada</h2>
      <p className="text-lg mb-6">Lo sentimos, la página que estás buscando no existe o ha sido movida.</p>
      <Button asChild className="bg-[#c59d45] hover:bg-[#b38d35] text-white">
        <Link href="/">Volver al inicio</Link>
      </Button>
    </div>
  )
}
