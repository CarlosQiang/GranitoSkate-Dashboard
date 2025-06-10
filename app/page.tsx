import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { LogIn } from "lucide-react"
import { redirect } from "next/navigation"
import { ThemedButton } from "@/components/themed-button"

export default async function Home() {
  const session = await getServerSession(authOptions)

  // Si el usuario ya está autenticado, redirigir al dashboard
  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src="/images/granito-logo.png" alt="Granito Management App Logo" className="h-10 w-auto" />
          </div>
          <div>
            <Link href="/login">
              <ThemedButton variant="outline" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Iniciar sesión
              </ThemedButton>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Background Image */}
      <section className="relative flex-1 flex items-center justify-center py-12 sm:py-20 overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url(/images/skater-background.jpg)",
            backgroundPosition: "center center",
            backgroundSize: "cover",
          }}
        >
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-white drop-shadow-lg">
            Panel de Administración GranitoSkate
          </h1>
          <p className="text-lg sm:text-xl text-white/90 mb-8 sm:mb-10 max-w-3xl mx-auto drop-shadow-md">
            Gestiona tu tienda Shopify de manera eficiente con nuestro panel de administración personalizado.
          </p>
          <div className="flex justify-center">
            <Link href="/login">
              <ThemedButton size="lg" className="flex items-center gap-2 shadow-lg">
                <LogIn className="h-5 w-5" />
                Iniciar sesión
              </ThemedButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Características principales</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="p-4 sm:p-6 border rounded-lg shadow-sm">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 text-[#B8860B]">Gestión de productos</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Administra tu catálogo de productos de forma sencilla y eficiente.
              </p>
            </div>
            <div className="p-4 sm:p-6 border rounded-lg shadow-sm">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 text-[#B8860B]">Análisis de ventas</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Visualiza estadísticas y métricas clave para tomar mejores decisiones.
              </p>
            </div>
            <div className="p-4 sm:p-6 border rounded-lg shadow-sm">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 text-[#B8860B]">Optimización SEO</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Mejora la visibilidad de tu tienda con herramientas de SEO integradas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-6 sm:py-8 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm sm:text-base text-gray-600">
            &copy; {new Date().getFullYear()} GranitoSkate. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
