"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, BarChart3, Search, LogIn, Package, Users, TrendingUp, Shield, Zap, Globe } from "lucide-react"

interface PublicConfig {
  shopName: string
  logoUrl: string
  favicon: string
}

export default function HomePage() {
  const [config, setConfig] = useState<PublicConfig>({
    shopName: "Granito Management app",
    logoUrl: "/logo-granito-management.png",
    favicon: "/favicon-granito.ico",
  })

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch("/api/theme/public-config")
        if (response.ok) {
          const data = await response.json()
          setConfig(data)
        }
      } catch (error) {
        console.error("Error al cargar la configuración:", error)
      }
    }

    loadConfig()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
              <Image
                src={config.logoUrl || "/placeholder.svg"}
                alt={config.shopName}
                width={32}
                height={32}
                className="rounded-lg"
              />
            </div>
            <span className="text-xl font-bold text-slate-900">{config.shopName}</span>
          </div>
          <Button
            asChild
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
          >
            <Link href="/login">
              <LogIn className="w-4 h-4 mr-2" />
              Iniciar sesión
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-amber-600/10" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "url('/images/skater-background.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6 bg-amber-100 text-amber-800 border-amber-200">
              Panel de Administración Profesional
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Panel de Administración {config.shopName}
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Gestiona tu tienda Shopify de manera eficiente con nuestro panel de administración personalizado.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Link href="/login">
                <LogIn className="w-5 h-5 mr-2" />
                Iniciar sesión
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Características principales</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Todas las herramientas que necesitas para gestionar tu negocio de manera eficiente
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-amber-600">Gestión de productos</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-slate-600 leading-relaxed">
                  Administra tu catálogo de productos de forma sencilla y eficiente.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-amber-600">Análisis de ventas</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-slate-600 leading-relaxed">
                  Visualiza estadísticas y métricas clave para tomar mejores decisiones.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-amber-600">Optimización SEO</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-slate-600 leading-relaxed">
                  Mejora la visibilidad de tu tienda con herramientas de SEO integrales.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <h3 className="text-3xl font-bold text-slate-900 mb-6">Potencia tu negocio con herramientas avanzadas</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Gestión de inventario</h4>
                    <p className="text-slate-600">Control completo sobre tu stock y productos</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Gestión de clientes</h4>
                    <p className="text-slate-600">Administra y analiza tu base de clientes</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Análisis avanzado</h4>
                    <p className="text-slate-600">Reportes detallados y métricas de rendimiento</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-80 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl shadow-2xl flex items-center justify-center">
                <Image
                  src={config.logoUrl || "/placeholder.svg"}
                  alt={config.shopName}
                  width={200}
                  height={200}
                  className="rounded-xl opacity-90"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Performance */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold text-slate-900 mb-12">Seguridad y rendimiento garantizados</h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Seguridad avanzada</h4>
              <p className="text-slate-600">Protección de datos y acceso seguro</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Alto rendimiento</h4>
              <p className="text-slate-600">Carga rápida y respuesta inmediata</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Acceso global</h4>
              <p className="text-slate-600">Disponible desde cualquier lugar</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
              <Image
                src={config.logoUrl || "/placeholder.svg"}
                alt={config.shopName}
                width={32}
                height={32}
                className="rounded-lg"
              />
            </div>
            <span className="text-xl font-bold">{config.shopName}</span>
          </div>
          <p className="text-slate-400 mb-6">Panel de administración profesional para tu tienda Shopify</p>
          <div className="border-t border-slate-800 pt-6">
            <p className="text-slate-500 text-sm">© 2025 {config.shopName}. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
