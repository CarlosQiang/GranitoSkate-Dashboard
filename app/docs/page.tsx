import Link from "next/link"

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img src="/favicon.ico" alt="GranitoSkate Logo" className="h-8 w-8 mr-2" />
              <h1 className="text-xl font-bold text-gray-900">GranitoSkate</h1>
            </Link>
          </div>
          <div>
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">Documentación</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              <div className="border-4 border-dashed border-gray-200 rounded-lg p-6 bg-white">
                <h2 className="text-2xl font-bold mb-4">Guía de uso del panel de administración</h2>

                <div className="space-y-6">
                  <section>
                    <h3 className="text-xl font-semibold mb-2">Introducción</h3>
                    <p className="text-gray-600">
                      Bienvenido al panel de administración de GranitoSkate. Esta plataforma te permite gestionar todos
                      los aspectos de tu tienda Shopify de manera sencilla y eficiente.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold mb-2">Primeros pasos</h3>
                    <ol className="list-decimal pl-5 space-y-2 text-gray-600">
                      <li>Inicia sesión con tus credenciales de administrador</li>
                      <li>Explora el dashboard para ver un resumen de la actividad de tu tienda</li>
                      <li>Navega por las diferentes secciones usando el menú lateral</li>
                    </ol>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold mb-2">Gestión de productos</h3>
                    <p className="text-gray-600">La sección de productos te permite:</p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-600">
                      <li>Ver todos los productos de tu tienda</li>
                      <li>Añadir nuevos productos</li>
                      <li>Editar productos existentes</li>
                      <li>Gestionar el inventario</li>
                      <li>Organizar productos en colecciones</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold mb-2">Gestión de colecciones</h3>
                    <p className="text-gray-600">
                      Las colecciones te ayudan a organizar tus productos para mejorar la experiencia de compra. Puedes:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-600">
                      <li>Crear nuevas colecciones</li>
                      <li>Añadir o quitar productos de las colecciones</li>
                      <li>Establecer condiciones automáticas para las colecciones</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold mb-2">Optimización SEO</h3>
                    <p className="text-gray-600">Mejora la visibilidad de tu tienda en los motores de búsqueda:</p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-600">
                      <li>Configura metadatos para productos y colecciones</li>
                      <li>Genera datos estructurados para mejorar los resultados de búsqueda</li>
                      <li>Monitoriza el rendimiento SEO de tu tienda</li>
                    </ul>
                  </section>

                  <div className="mt-8 border-t border-gray-200 pt-6">
                    <p className="text-gray-500 text-sm">
                      Esta documentación está en desarrollo. Próximamente se añadirán más secciones con información
                      detallada sobre todas las funcionalidades del panel.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <p className="mt-8 text-center text-base text-gray-400">
            &copy; {new Date().getFullYear()} GranitoSkate. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
