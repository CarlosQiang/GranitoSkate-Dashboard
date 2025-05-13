import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="GestionGranito Logo" width={40} height={40} className="h-10 w-10" priority />
            <span className="text-xl font-bold text-[#c59d45]">GestionGranito</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button className="bg-[#c59d45] hover:bg-[#c59d45]/90 text-white">Iniciar sesión</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
              Gestión de <span className="text-[#c59d45]">Granito Skate</span>
            </h1>
            <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Plataforma integral para la gestión de productos, inventario y clientes de Granito Skate.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Link href="/login">
                <Button className="bg-[#c59d45] hover:bg-[#c59d45]/90 text-white min-w-[200px]">
                  Acceder al Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t bg-gray-50">
        <div className="container flex flex-col gap-4 py-10 px-4 md:px-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="GestionGranito Logo" width={30} height={30} className="h-8 w-8" />
              <span className="text-lg font-bold text-[#c59d45]">GestionGranito</span>
            </div>
            <p className="text-sm text-gray-500">© 2024 GestionGranito. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
