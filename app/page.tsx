import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { FileText, LogIn, LayoutDashboard } from "lucide-react"

export default async function Home() {
  const session = await getServerSession(authOptions)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="h-10">
              <img
                src="/logo-granito.png"
                alt="GranitoSkate Logo"
                className="h-full"
                onError={(e) => {
                  e.currentTarget.src = "/favicon.ico"
                  e.currentTarget.onerror = null
                }}
              />
            </div>
            <span className="text-xl font-bold">GranitoSkate</span>
          </div>
          <div>
            {session ? (
              <Link href="/dashboard">
                <Button className="bg-granito hover:bg-granito-dark flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-granito text-granito hover:bg-granito hover:text-white"
                >
                  <LogIn className="h-4 w-4" />
                  Iniciar sesión
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Panel de Administración GranitoSkate</h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Gestiona tu tienda Shopify de manera eficiente con nuestro panel de administración personalizado.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {session ? (
              <Link href="/dashboard">
                <Button size="lg" className="bg-granito hover:bg-granito-dark flex items-center gap-2">
                  <LayoutDashboard className="h-5 w-5" />
                  Ir al Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button size="lg" className="bg-granito hover:bg-granito-dark flex items-center gap-2">
                  <LogIn className="h-5 w-5" />
                  Iniciar sesión
                </Button>
              </Link>
            )}
            <Link href="/docs">
              <Button
                size="lg"
                variant="outline"
                className="flex items-center gap-2 border-granito text-granito hover:bg-granito hover:text-white"
              >
                <FileText className="h-5 w-5" />
                Documentación
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Características principales</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 border rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3 text-granito">Gestión de productos</h3>
              <p className="text-gray-600">Administra tu catálogo de productos de forma sencilla y eficiente.</p>
            </div>
            <div className="p-6 border rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3 text-granito">Análisis de ventas</h3>
              <p className="text-gray-600">Visualiza estadísticas y métricas clave para tomar mejores decisiones.</p>
            </div>
            <div className="p-6 border rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3 text-granito">Optimización SEO</h3>
              <p className="text-gray-600">Mejora la visibilidad de tu tienda con herramientas de SEO integradas.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">
            &copy; {new Date().getFullYear()} GranitoSkate. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
