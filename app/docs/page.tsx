import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Code, Book } from "lucide-react"

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Documentación de GranitoSkate Dashboard</h1>

          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Book className="mr-2 h-5 w-5 text-granito" />
              Introducción
            </h2>
            <p className="mb-4">
              Bienvenido a la documentación del Panel de Administración de GranitoSkate. Esta herramienta te permite
              gestionar todos los aspectos de tu tienda Shopify de manera eficiente.
            </p>
            <p>
              Esta documentación está en desarrollo y se irá actualizando con más información sobre las funcionalidades
              del panel.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FileText className="mr-2 h-5 w-5 text-granito" />
              Guías de uso
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Gestión de productos</li>
              <li>Gestión de colecciones</li>
              <li>Análisis de ventas</li>
              <li>Optimización SEO</li>
              <li>Gestión de promociones</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Code className="mr-2 h-5 w-5 text-granito" />
              Referencia técnica
            </h2>
            <p className="mb-4">El panel está construido con las siguientes tecnologías:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Next.js (App Router)</li>
              <li>TypeScript</li>
              <li>Tailwind CSS</li>
              <li>Prisma ORM</li>
              <li>NextAuth.js</li>
              <li>Shopify API</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">
            &copy; {new Date().getFullYear()} GranitoSkate. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
