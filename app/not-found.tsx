import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <div className="rounded-full bg-yellow-100 p-3 text-yellow-600 mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h2 className="mb-2 text-2xl font-bold">Página no encontrada</h2>
      <p className="mb-6 text-gray-600">Lo sentimos, la página que estás buscando no existe o ha sido movida.</p>
      <Link href="/">
        <Button className="bg-granito hover:bg-granito-dark">Volver al inicio</Button>
      </Link>
    </div>
  )
}
