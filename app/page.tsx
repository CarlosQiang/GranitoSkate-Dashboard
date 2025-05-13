import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Code, Database, Lock } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="GestionGranito Logo" width={40} height={40} className="h-10 w-10" />
            <span className="text-xl font-bold text-[#c59d45]">GestionGranito</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="text-sm font-medium hover:underline underline-offset-4">
              Inicio
            </Link>
            <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4">
              Características
            </Link>
            <Link href="#api" className="text-sm font-medium hover:underline underline-offset-4">
              API
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline" className="border-[#c59d45] text-[#c59d45] hover:bg-[#c59d45] hover:text-white">
                Iniciar sesión
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Gestión de <span className="text-[#c59d45]">Granito Skate</span>
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Plataforma integral para la gestión de productos, inventario y clientes de Granito Skate.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/login">
                  <Button className="bg-[#c59d45] hover:bg-[#c59d45]/90 text-white">
                    Acceder al Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#api">
                  <Button
                    variant="outline"
                    className="border-[#c59d45] text-[#c59d45] hover:bg-[#c59d45] hover:text-white"
                  >
                    Documentación API
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <Image
                src="/dashboard-preview.png"
                alt="Dashboard Preview"
                width={550}
                height={380}
                className="rounded-lg border shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Características principales
              </h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Descubre todas las herramientas que ofrecemos para optimizar la gestión de tu negocio.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12 mt-12">
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <div className="rounded-full bg-[#c59d45]/10 p-4">
                <Database className="h-6 w-6 text-[#c59d45]" />
              </div>
              <h3 className="text-xl font-bold">Gestión de inventario</h3>
              <p className="text-center text-gray-500">
                Control completo de productos, stock y categorías con actualizaciones en tiempo real.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <div className="rounded-full bg-[#c59d45]/10 p-4">
                <Code className="h-6 w-6 text-[#c59d45]" />
              </div>
              <h3 className="text-xl font-bold">API completa</h3>
              <p className="text-center text-gray-500">
                Integración con sistemas externos mediante nuestra API RESTful documentada.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <div className="rounded-full bg-[#c59d45]/10 p-4">
                <Lock className="h-6 w-6 text-[#c59d45]" />
              </div>
              <h3 className="text-xl font-bold">Seguridad avanzada</h3>
              <p className="text-center text-gray-500">
                Autenticación segura y gestión de permisos para proteger tus datos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* API Documentation Section */}
      <section id="api" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Documentación API</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Integra nuestros servicios con tu aplicación mediante nuestra API RESTful.
              </p>
            </div>
          </div>
          <div className="mx-auto max-w-3xl mt-12">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="p-6 flex flex-col space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-green-500 h-3 w-3"></div>
                  <h3 className="text-xl font-bold">Endpoints disponibles</h3>
                </div>
                <div className="space-y-2">
                  <div className="rounded-md bg-gray-100 p-4">
                    <code className="text-sm">GET /api/products</code>
                    <p className="text-sm text-gray-500 mt-2">Obtener lista de productos</p>
                  </div>
                  <div className="rounded-md bg-gray-100 p-4">
                    <code className="text-sm">GET /api/collections</code>
                    <p className="text-sm text-gray-500 mt-2">Obtener colecciones disponibles</p>
                  </div>
                  <div className="rounded-md bg-gray-100 p-4">
                    <code className="text-sm">GET /api/orders</code>
                    <p className="text-sm text-gray-500 mt-2">Obtener órdenes recientes</p>
                  </div>
                </div>
                <div className="pt-4">
                  <p className="text-sm text-gray-500">
                    Para acceder a la documentación completa, contacta con el administrador.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50">
        <div className="container flex flex-col gap-4 py-10 md:flex-row md:gap-8 md:py-12 px-4 md:px-6">
          <div className="flex flex-col gap-2 md:gap-4 lg:gap-6">
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="GestionGranito Logo" width={30} height={30} className="h-8 w-8" />
              <span className="text-lg font-bold text-[#c59d45]">GestionGranito</span>
            </div>
            <p className="text-sm text-gray-500">© 2024 GestionGranito. Todos los derechos reservados.</p>
          </div>
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Plataforma</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/login" className="text-gray-500 hover:underline">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="#api" className="text-gray-500 hover:underline">
                    API
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Recursos</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-gray-500 hover:underline">
                    Documentación
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-500 hover:underline">
                    Guías
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Contacto</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-gray-500 hover:underline">
                    Soporte
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-500 hover:underline">
                    Email
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
