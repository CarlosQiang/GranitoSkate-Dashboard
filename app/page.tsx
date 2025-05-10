import Link from "next/link"
import { ArrowRight, Package2, FileText, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Navbar */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-[#d29a43] p-1">
              <Package2 className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">GranitoSkate</span>
          </div>
          <nav className="hidden md:block">
            <ul className="flex gap-6">
              <li>
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-600 transition-colors hover:text-[#d29a43]"
                >
                  Iniciar Sesión
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm font-medium text-gray-600 transition-colors hover:text-[#d29a43]">
                  Documentación
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm font-medium text-gray-600 transition-colors hover:text-[#d29a43]">
                  Soporte
                </Link>
              </li>
            </ul>
          </nav>
          <div className="md:hidden">
            <Button variant="ghost" size="icon" className="text-gray-600">
              <Package2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div className="flex flex-col gap-6">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
              Panel de Administración <span className="text-[#d29a43]">GranitoSkate</span>
            </h1>
            <p className="text-lg text-gray-600">
              Gestiona tu tienda de skate de manera eficiente. Controla inventario, ventas y más desde un solo lugar.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button asChild className="gap-2">
                <Link href="/login">
                  Iniciar Sesión
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <Link href="#">
                  Ver Documentación
                  <FileText className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative hidden h-[400px] md:block">
            <div className="rounded-lg bg-gray-200 h-full w-full flex items-center justify-center">
              <img
                src="/skateboard-shop-dashboard.png"
                alt="Dashboard Preview"
                className="rounded-lg object-cover shadow-xl"
                width={600}
                height={400}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">Características Principales</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
              <div className="mb-4 inline-flex rounded-full bg-[#d29a43]/10 p-3">
                <Package2 className="h-6 w-6 text-[#d29a43]" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Gestión de Inventario</h3>
              <p className="text-gray-600">Controla tu stock, productos y colecciones de manera eficiente.</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
              <div className="mb-4 inline-flex rounded-full bg-[#d29a43]/10 p-3">
                <FileText className="h-6 w-6 text-[#d29a43]" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Análisis de Ventas</h3>
              <p className="text-gray-600">Visualiza y analiza tus ventas con gráficos intuitivos.</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
              <div className="mb-4 inline-flex rounded-full bg-[#d29a43]/10 p-3">
                <Settings className="h-6 w-6 text-[#d29a43]" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Optimización SEO</h3>
              <p className="text-gray-600">Mejora la visibilidad de tu tienda con herramientas SEO integradas.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#d29a43]/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">¿Listo para comenzar?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
            Accede al panel de administración y comienza a gestionar tu tienda de manera eficiente.
          </p>
          <Button asChild size="lg" className="gap-2">
            <Link href="/login">
              Iniciar Sesión
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-[#d29a43] p-1">
                <Package2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">GranitoSkate</span>
            </div>
            <div className="text-sm text-gray-600">
              © {new Date().getFullYear()} GranitoSkate. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
