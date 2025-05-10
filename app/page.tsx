import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Package2, FileText, Settings } from "lucide-react"

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
            <button className="rounded-md p-2 text-gray-600 hover:bg-gray-100">
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
              >
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </button>
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
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#d29a43] px-5 py-2.5 text-center font-medium text-white shadow-md transition-all hover:bg-[#c08a3a] focus:outline-none focus:ring-2 focus:ring-[#d29a43] focus:ring-offset-2"
              >
                Iniciar Sesión
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-5 py-2.5 text-center font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
              >
                Ver Documentación
                <FileText className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="relative hidden h-[400px] md:block">
            <Image
              src="/skateboard-shop-dashboard.png"
              alt="Dashboard Preview"
              fill
              className="rounded-lg object-cover shadow-xl"
              priority
            />
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
                  className="h-6 w-6 text-[#d29a43]"
                >
                  <path d="M19 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z" />
                  <path d="M17 2h-4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z" />
                  <path d="M11 2H7a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z" />
                  <path d="M12 14v3" />
                  <path d="M8 14v3" />
                  <path d="M16 14v3" />
                </svg>
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
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#d29a43] px-6 py-3 text-center font-medium text-white shadow-md transition-all hover:bg-[#c08a3a] focus:outline-none focus:ring-2 focus:ring-[#d29a43] focus:ring-offset-2"
          >
            Iniciar Sesión
            <ArrowRight className="h-4 w-4" />
          </Link>
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
            <div className="flex gap-4">
              <Link href="#" className="text-gray-600 hover:text-[#d29a43]">
                <span className="sr-only">Twitter</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-600 hover:text-[#d29a43]">
                <span className="sr-only">Instagram</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-600 hover:text-[#d29a43]">
                <span className="sr-only">Facebook</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
