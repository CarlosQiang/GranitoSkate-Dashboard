import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SEOMonitoringPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Monitorización SEO</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Visibilidad SEO</CardTitle>
            <CardDescription>Evolución de la visibilidad en buscadores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/20 rounded-md">
              <p className="text-muted-foreground">Datos de visibilidad SEO próximamente</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución de Tráfico</CardTitle>
            <CardDescription>Tráfico por buscador</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/20 rounded-md">
              <p className="text-muted-foreground">Datos de distribución de tráfico próximamente</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Palabras Clave</CardTitle>
          <CardDescription>Rendimiento de palabras clave principales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted/20 rounded-md">
            <p className="text-muted-foreground">Datos de palabras clave próximamente</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
