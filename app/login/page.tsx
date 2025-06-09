"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { signIn, getSession, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff, Shield, User } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { data: session, status } = useSession()
  const { theme } = useTheme()

  // Si ya está autenticado, redirigir al dashboard
  useEffect(() => {
    if (status === "authenticated" && session) {
      console.log("✅ Usuario ya autenticado, redirigiendo...")
      router.push("/dashboard")
    }
  }, [session, status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      console.log("🔐 Intentando iniciar sesión con:", identifier)

      const result = await signIn("credentials", {
        email: identifier, // Cambiado de identifier a email
        password,
        redirect: false,
      })

      console.log("🔍 Resultado del login:", result)

      if (result?.error) {
        console.error("❌ Error de login:", result.error)
        setError("Credenciales incorrectas. Verifica tu usuario/email y contraseña.")
      } else if (result?.ok) {
        console.log("✅ Login exitoso, verificando sesión...")

        // Esperar un momento para que la sesión se establezca
        setTimeout(async () => {
          const session = await getSession()
          if (session) {
            console.log("✅ Sesión verificada, redirigiendo al dashboard...")
            router.push("/dashboard")
            router.refresh()
          } else {
            setError("Error al establecer la sesión")
          }
        }, 1000)
      }
    } catch (error) {
      console.error("❌ Error durante el login:", error)
      setError("Error de conexión. Inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  // Mostrar loading si está verificando la sesión
  if (status === "loading") {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: theme.backgroundColor || "#fff5e6" }}
      >
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" style={{ color: theme.primaryColor || "#f59e0b" }} />
          <p style={{ color: theme.textColor || "#4b5563" }}>Verificando sesión...</p>
        </div>
      </div>
    )
  }

  // Estilos dinámicos basados en el tema
  const primaryColor = theme.primaryColor || "#f59e0b"
  const primaryColorHover = theme.primaryColorHover || "#d97706"
  const backgroundColor = theme.backgroundColor || "#fff5e6"
  const cardBackground = theme.cardBackground || "white"
  const textColor = theme.textColor || "#4b5563"
  const borderRadius = theme.borderRadius || "0.5rem"

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "white" }}
    >
      <div className="w-full max-w-md mx-auto">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div
            className="mx-auto h-16 w-16 rounded-xl flex items-center justify-center mb-4 shadow-lg"
            style={{
              background: `linear-gradient(to bottom right, ${primaryColor}, ${primaryColorHover})`,
              borderRadius,
            }}
          >
            <span className="text-2xl font-bold text-white">G</span>
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: textColor }}>
            GranitoSkate
          </h1>
          <p style={{ color: `${textColor}99` }}>Panel de Administración</p>
        </div>

        <Card
          className="shadow-xl border backdrop-blur-sm"
          style={{
            backgroundColor: "white",
            borderColor: `${primaryColor}20`,
            borderRadius,
          }}
        >
          <CardHeader className="space-y-1 pb-6">
            <div className="flex items-center justify-center mb-4">
              <Shield style={{ color: primaryColor }} className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl font-bold text-center" style={{ color: textColor }}>
              Acceso Seguro
            </CardTitle>
            <CardDescription className="text-center" style={{ color: `${textColor}99` }}>
              Ingresa tus credenciales para acceder al panel de administración
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier" style={{ color: textColor }} className="font-medium">
                  Usuario o Correo Electrónico
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="usuario o email"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-10 h-12 border-gray-200"
                    style={{
                      borderRadius,
                      borderColor: `${primaryColor}33`,
                    }}
                    autoComplete="username"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" style={{ color: textColor }} className="font-medium">
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pr-10 h-12 border-gray-200"
                    style={{
                      borderRadius,
                      borderColor: `${primaryColor}33`,
                    }}
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}
              <Button
                type="submit"
                className="w-full h-12 text-white font-medium shadow-lg transition-all duration-200"
                style={{
                  background: `linear-gradient(to right, ${primaryColor}, ${primaryColorHover})`,
                  borderRadius,
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
            </form>

            {/* Información de seguridad */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-center text-sm" style={{ color: `${textColor}99` }}>
                <Shield className="h-4 w-4 mr-2" />
                Conexión segura y cifrada
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm" style={{ color: `${textColor}99` }}>
            © {new Date().getFullYear()} GranitoSkate. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}
