import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export default async function Home() {
  const session = await getServerSession(authOptions)

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-gray-800">GranitoSkate</span>
          </div>
          <div>
            {session ? (
              <Link
                href="/dashboard"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Gestión de tienda Shopify para GranitoSkate</h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Administra productos, colecciones, clientes y más desde un solo lugar.
            </p>
            {!session && (
              <Link
                href="/login"
                className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-md font-medium text-lg transition-colors inline-block"
              >
                Acceder al panel
              </Link>
            )}
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Características principales</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Gestión de productos</h3>
                <p className="text-gray-600">Administra tu catálogo de productos de forma sencilla y eficiente.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Análisis de ventas</h3>
                <p className="text-gray-600">Visualiza estadísticas y métricas importantes para tu negocio.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Optimización SEO</h3>
                <p className="text-gray-600">Mejora el posicionamiento de tu tienda en los motores de búsqueda.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p>&copy; 2023 GranitoSkate. Todos los derechos reservados.</p>
            </div>
            <div className="flex space-x-4">
              <Link href="/docs" className="hover:text-blue-400 transition-colors">
                Documentación
              </Link>
              <a href="#" className="hover:text-blue-400 transition-colors">
                Soporte
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
