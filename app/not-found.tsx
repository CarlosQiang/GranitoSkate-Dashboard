import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-6xl font-bold text-[#c59d45]">404</h1>
      <h2 className="mt-4 text-2xl font-semibold">Página no encontrada</h2>
      <p className="mt-2 text-gray-500">Lo sentimos, la página que estás buscando no existe o ha sido movida.</p>
      <Link href="/" className="mt-8">
        <Button className="bg-[#c59d45] hover:bg-[#c59d45]/90 text-white">Volver al inicio</Button>
      </Link>
    </div>
  )
}
