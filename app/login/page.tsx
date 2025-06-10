"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Shield, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import Image from "next/image"
import { useTheme } from "@/contexts/theme-context"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { theme } = useTheme()

  // Valores por defecto seguros
  const shopName = theme?.shopName || "Granito Management app"
  const logoUrl = theme?.logoUrl || "/logo-granito-management.png"
  const primaryColor = theme?.primaryColor || "#c7a04a"
  const primaryColorHover = adjustBrightness(primaryColor, -10) || "#b08a3d"

  // Función para ajustar el brillo de un color
  function adjustBrightness(hex: string, percent: number): string {
    if (!hex) return "#c7a04a"

    // Convertir hex a RGB
    let r = Number.parseInt(hex.substring(1, 3), 16)
    let g = Number.parseInt(hex.substring(3, 5), 16)
    let b = Number.parseInt(hex.substring(5, 7), 16)

    // Ajustar brillo
    r = Math.max(0, Math.min(255, r + Math.round((r * percent) / 100)))
    g = Math.max(0, Math.min(255, g + Math.round((g * percent) / 100)))
    b = Math.max(0, Math.min(255, b + Math.round((b * percent) / 100)))

    // Convertir de nuevo a hex
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
  }

  // Verificar si ya está autenticado
  useEffect(() => {
    const checkAuth = async () => {
      const session = await getSession()
      if (session) {
        router.push("/dashboard")
      }
    }
    checkAuth()
  }, [router])

  // Manejar errores de URL
  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam) {
      setError("Error de autenticación. Por favor, inténtalo de nuevo.")
    }
  }, [searchParams])

  // Actualizar el título de la página solo en el cliente
  useEffect(() => {
    if (typeof window !== "undefined" && shopName) {
      document.title = `${shopName} - Iniciar Sesión`
    }
  }, [shopName])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!username.trim() || !password.trim()) {
      setError("Por favor, completa todos los campos")
      setIsLoading(false)
      return
    }

    try {
      const result = await signIn("credentials", {
        username: username.trim(),
        password: password,
        redirect: false,
      })

      if (result?.error) {
        setError("Credenciales incorrectas. Por favor, verifica tu usuario y contraseña.")
        toast({
          title: "Error de autenticación",
          description: "Credenciales incorrectas. Por favor, inténtalo de nuevo.",
          variant: "destructive",
        })
      } else if (result?.ok) {
        toast({
          title: "¡Bienvenido!",
          description: "Has iniciado sesión correctamente.",
        })
        // Pequeña pausa para mostrar el toast
        setTimeout(() => {
          router.push("/dashboard")
        }, 500)
      }
    } catch (error) {
      console.error("Error de login:", error)
      setError("Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.")
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
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg bg-white p-1">
              <Image
                src={logoUrl || "/placeholder.svg"}
                alt={shopName}
                width={56}
                height={56}
                className="rounded-xl"
                onError={(e) => {
                  // Fallback si la imagen no carga
                  const target = e.target as HTMLImageElement
                  target.style.display = "none"
                  if (target.parentElement) {
                    target.parentElement.innerHTML = '<span class="text-[#c7a04a] font-bold text-xl">G</span>'
                  }
                }}
              />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">{shopName}</CardTitle>
            <CardDescription className="text-gray-600">Panel de Administración</CardDescription>
          </div>
          <div className="flex items-center justify-center space-x-2" style={{ color: primaryColor }}>
            <Shield className="w-5 h-5" />
            <span className="text-sm font-medium">Acceso Seguro</span>
          </div>
          <p className="text-sm text-gray-500">Ingresa tus credenciales para acceder al panel de administración</p>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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
                className="bg-gray-50 border-gray-200"
                style={{
                  borderColor: `${primaryColor}40`,
                  boxShadow: `0 0 0 0 ${primaryColor}00`,
                  transition: "box-shadow 0.2s, border-color 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = primaryColor
                  e.target.style.boxShadow = `0 0 0 2px ${primaryColor}40`
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = `${primaryColor}40`
                  e.target.style.boxShadow = `0 0 0 0 ${primaryColor}00`
                }}
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
                  className="bg-gray-50 border-gray-200 pr-10"
                  style={{
                    borderColor: `${primaryColor}40`,
                    boxShadow: `0 0 0 0 ${primaryColor}00`,
                    transition: "box-shadow 0.2s, border-color 0.2s",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = primaryColor
                    e.target.style.boxShadow = `0 0 0 2px ${primaryColor}40`
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = `${primaryColor}40`
                    e.target.style.boxShadow = `0 0 0 0 ${primaryColor}00`
                  }}
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
              className="w-full text-white font-medium py-2.5"
              style={{
                backgroundColor: primaryColor,
                transition: "background-color 0.2s",
              }}
              onMouseOver={(e) => {
                ;(e.target as HTMLButtonElement).style.backgroundColor = primaryColorHover
              }}
              onMouseOut={(e) => {
                ;(e.target as HTMLButtonElement).style.backgroundColor = primaryColor
              }}
              disabled={isLoading}
            >
              {isLoading ? "Iniciando Sesión..." : "Iniciar Sesión"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm font-medium inline-flex items-center"
              style={{ color: primaryColor }}
              onMouseOver={(e) => {
                ;(e.target as HTMLAnchorElement).style.color = primaryColorHover
              }}
              onMouseOut={(e) => {
                ;(e.target as HTMLAnchorElement).style.color = primaryColor
              }}
            >
              ← Volver al inicio
            </Link>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700 font-medium mb-1">Credenciales de prueba:</p>
            <p className="text-xs text-blue-600">
              Usuario: <code>Carlos Qiang</code>
            </p>
            <p className="text-xs text-blue-600">
              Contraseña: <code>GranitoSkate</code>
            </p>
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
