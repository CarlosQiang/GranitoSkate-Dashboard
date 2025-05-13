import Link from "next/link"

export default function DocsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-gray-800">
              GranitoSkate
            </Link>
          </div>
          <div>
            <Link
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Documentación</h1>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Introducción</h2>
            <p className="text-gray-700 mb-4">
              Bienvenido a la documentación de GranitoSkate Dashboard. Esta aplicación te permite gestionar tu tienda
              Shopify de manera eficiente y sencilla.
            </p>
            <p className="text-gray-700 mb-4">
              A continuación encontrarás información sobre cómo utilizar las diferentes funcionalidades del panel de
              administración.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Primeros pasos</h2>
            <ol className="list-decimal pl-6 space-y-2 text-gray-700">
              <li>Inicia sesión con tus credenciales de administrador</li>
              <li>Explora el panel de control para ver estadísticas generales</li>
              <li>Navega por las diferentes secciones usando el menú lateral</li>
              <li>Comienza a gestionar tus productos, colecciones y clientes</li>
            </ol>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Funcionalidades principales</h2>

            <div className="mb-4">
              <h3 className="text-xl font-medium mb-2">Gestión de productos</h3>
              <p className="text-gray-700">
                Añade, edita y elimina productos. Gestiona inventario, precios y metadatos.
              </p>
            </div>

            <div className="mb-4">
              <h3 className="text-xl font-medium mb-2">Gestión de colecciones</h3>
              <p className="text-gray-700">
                Organiza tus productos en colecciones para mejorar la navegación de tu tienda.
              </p>
            </div>

            <div className="mb-4">
              <h3 className="text-xl font-medium mb-2">Clientes</h3>
              <p className="text-gray-700">Visualiza información de tus clientes y su historial de compras.</p>
            </div>

            <div className="mb-4">
              <h3 className="text-xl font-medium mb-2">Optimización SEO</h3>
              <p className="text-gray-700">
                Mejora el posicionamiento de tu tienda con herramientas de SEO integradas.
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Soporte</h2>
            <p className="text-gray-700">
              Si necesitas ayuda adicional, no dudes en contactar con nuestro equipo de soporte en{" "}
              <a href="mailto:soporte@granitoskate.com" className="text-blue-600 hover:underline">
                soporte@granitoskate.com
              </a>
              .
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p>&copy; 2023 GranitoSkate. Todos los derechos reservados.</p>
            </div>
            <div className="flex space-x-4">
              <Link href="/" className="hover:text-blue-400 transition-colors">
                Inicio
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
