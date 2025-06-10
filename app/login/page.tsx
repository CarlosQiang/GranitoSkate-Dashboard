"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import Image from "next/image"
import { useTheme } from "@/contexts/theme-context"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { theme } = useTheme()

  // Valores por defecto seguros
  const shopName = theme?.shopName || "Granito Management app"
  const logoUrl = theme?.logoUrl || "/logo-granito-management.png"

  // Actualizar el título de la página solo en el cliente
  useEffect(() => {
    if (typeof window !== "undefined" && shopName) {
      document.title = `${shopName} - Iniciar Sesión`
    }
  }, [shopName])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: "Error de autenticación",
          description: "Credenciales incorrectas. Por favor, inténtalo de nuevo.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "¡Bienvenido!",
          description: "Has iniciado sesión correctamente.",
        })
        router.push("/dashboard")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Image
                src={logoUrl || "/placeholder.svg"}
                alt={`${shopName} Logo`}
                width={40}
                height={40}
                className="rounded-lg"
                onError={(e) => {
                  // Fallback si la imagen no carga
                  const target = e.target as HTMLImageElement
                  target.style.display = "none"
                  if (target.parentElement) {
                    target.parentElement.innerHTML = '<span class="text-white font-bold text-xl">G</span>'
                  }
                }}
              />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">{shopName}</CardTitle>
            <CardDescription className="text-gray-600">Panel de Administración</CardDescription>
          </div>
          <div className="flex items-center justify-center space-x-2 text-amber-600">
            <Shield className="w-5 h-5" />
            <span className="text-sm font-medium">Acceso Seguro</span>
          </div>
          <p className="text-sm text-gray-500">Ingresa tus credenciales para acceder al panel de administración</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario o Correo Electrónico</Label>
              <Input
                id="username"
                type="text"
                placeholder="Carlos Qiang"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-gray-50 border-gray-200 focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-gray-50 border-gray-200 focus:border-amber-500 focus:ring-amber-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium py-2.5"
              disabled={isLoading}
            >
              {isLoading ? "Iniciando Sesión..." : "Iniciar Sesión"}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-amber-600 hover:text-amber-700 font-medium inline-flex items-center">
              ← Volver al inicio
            </Link>
          </div>
          <div className="mt-4 flex items-center justify-center text-xs text-gray-500">
            <Shield className="w-3 h-3 mr-1" />
            Conexión segura y cifrada
          </div>
        </CardContent>
      </Card>
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">
        © 2025 {shopName}. Todos los derechos reservados.
      </div>
    </div>
  )
}
