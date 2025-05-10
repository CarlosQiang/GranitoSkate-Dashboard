import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-6xl font-bold text-[#d29a43] mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Página no encontrada</h2>
        <p className="text-gray-600 mb-6">Lo sentimos, la página que estás buscando no existe o ha sido movida.</p>
        <Link
          href="/dashboard"
          className="inline-block bg-[#d29a43] hover:bg-[#b88535] text-white font-bold py-2 px-6 rounded-md transition-colors"
        >
          Volver al Dashboard
        </Link>
      </div>
    </div>
  )
}
