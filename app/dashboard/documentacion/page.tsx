import { FaBook, FaCode, FaQuestionCircle } from "react-icons/fa"

const DocumentationPage = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-semibold mb-6">Documentación</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tarjeta 1: Guía de Usuario */}
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center">
          <FaBook className="text-4xl text-blue-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Guía de Usuario</h2>
          <p className="text-gray-700">Aprende a utilizar nuestra plataforma paso a paso.</p>
          <a href="#" className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Ver Guía
          </a>
        </div>

        {/* Tarjeta 2: API Documentation */}
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center">
          <FaCode className="text-4xl text-green-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">API Documentation</h2>
          <p className="text-gray-700">Descubre cómo integrar nuestra API en tus proyectos.</p>
          <a href="#" className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            Ver Documentación
          </a>
        </div>

        {/* Tarjeta 3: FAQ */}
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center">
          <FaQuestionCircle className="text-4xl text-yellow-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">FAQ</h2>
          <p className="text-gray-700">Encuentra respuestas a las preguntas más frecuentes.</p>
          <a href="#" className="mt-4 bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
            Ver FAQ
          </a>
        </div>
      </div>
    </div>
  )
}

export default DocumentationPage
