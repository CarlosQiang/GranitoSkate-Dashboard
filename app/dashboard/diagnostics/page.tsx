import { SystemDiagnostics } from "@/components/system-diagnostics"

export default function DiagnosticsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">Diagnósticos del Sistema</h1>
      <p className="text-muted-foreground">
        Esta página te permite verificar el estado de los componentes del sistema y diagnosticar problemas.
      </p>

      <SystemDiagnostics />

      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mt-6">
        <h2 className="text-xl font-semibold text-blue-800 mb-4">Solución de problemas comunes</h2>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-blue-700">Si hay errores de conexión con Shopify:</h3>
            <ul className="list-disc pl-5 text-blue-600 space-y-1 mt-2">
              <li>
                Verifica que las variables de entorno NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN y SHOPIFY_ACCESS_TOKEN estén
                configuradas correctamente en Vercel
              </li>
              <li>Asegúrate de que el token de acceso de Shopify sea válido y tenga los permisos necesarios</li>
              <li>Comprueba que la tienda Shopify esté activa y accesible</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-blue-700">Si hay errores al cargar datos:</h3>
            <ul className="list-disc pl-5 text-blue-600 space-y-1 mt-2">
              <li>Verifica que la API de Shopify esté funcionando correctamente</li>
              <li>Comprueba los logs del servidor para más detalles sobre el error</li>
              <li>Intenta reiniciar el servidor o redesplegarlo en Vercel</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
