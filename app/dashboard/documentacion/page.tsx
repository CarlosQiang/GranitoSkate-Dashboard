import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Database, Zap, BookOpen, Code, Server, Globe } from "lucide-react"

export const metadata: Metadata = {
  title: "Documentación para Desarrolladores - GranitoSkate",
  description: "Documentación técnica completa para desarrolladores",
}

export default function DocumentacionPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-blue-600" />
          Documentación para Desarrolladores
        </h1>
        <p className="text-muted-foreground">
          Documentación técnica completa para desarrolladores que trabajen en el proyecto GranitoSkate
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Documentación de Base de Datos */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-6 w-6 text-green-600" />
              API de Base de Datos
            </CardTitle>
            <CardDescription>
              Documentación completa del sistema SQL, estructura de base de datos y todos los endpoints de la API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Incluye:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Esquema completo de la base de datos</li>
                <li>• Endpoints de la API REST</li>
                <li>• Ejemplos de consultas SQL</li>
                <li>• Modelos de datos y relaciones</li>
                <li>• Procedimientos almacenados</li>
              </ul>
            </div>
            <Link href="/dashboard/documentacion/base-datos">
              <Button className="w-full">
                <Code className="h-4 w-4 mr-2" />
                Ver Documentación de BD
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Documentación de Shopify */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-purple-600" />
              Conexión con Shopify
            </CardTitle>
            <CardDescription>
              Documentación de la integración con Shopify, endpoints de la API y configuración
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Incluye:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Configuración de la API de Shopify</li>
                <li>• Endpoints GraphQL y REST</li>
                <li>• Autenticación y tokens</li>
                <li>• Sincronización de datos</li>
                <li>• Webhooks y eventos</li>
              </ul>
            </div>
            <Link href="/dashboard/documentacion/shopify">
              <Button className="w-full">
                <Globe className="h-4 w-4 mr-2" />
                Ver Documentación de Shopify
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Información adicional */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-6 w-6 text-orange-600" />
            Información del Proyecto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <h4 className="font-semibold mb-2">Tecnologías Principales</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Next.js 14 (App Router)</li>
                <li>• TypeScript</li>
                <li>• Tailwind CSS</li>
                <li>• Neon PostgreSQL</li>
                <li>• Shopify API</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Arquitectura</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• API Routes (Next.js)</li>
                <li>• Server Components</li>
                <li>• Client Components</li>
                <li>• Middleware</li>
                <li>• Database Repositories</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Funcionalidades</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Gestión de productos</li>
                <li>• Sincronización automática</li>
                <li>• Panel de administración</li>
                <li>• SEO y metadatos</li>
                <li>• Sistema de promociones</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
