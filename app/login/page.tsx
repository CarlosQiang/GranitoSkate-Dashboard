"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { signIn, getSession, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff, Shield, User, ArrowLeft } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"
import { ThemedButton } from "@/components/themed-button"
import {
  ThemedCard,
  ThemedCardHeader,
  ThemedCardTitle,
  ThemedCardDescription,
  ThemedCardContent,
} from "@/components/themed-card"

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
        email: identifier,
        password,
        redirect: false,
      })

      console.log("🔍 Resultado del login:", result)

      if (result?.error) {
        console.error("❌ Error de login:", result.error)
        setError("Credenciales incorrectas. Verifica tu usuario/email y contraseña.")
      } else if (result?.ok) {
        console.log("✅ Login exitoso, verificando sesión...")

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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[var(--color-primary)]" />
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="w-full max-w-md mx-auto">
        {/* Botón de volver */}
        <div className="mb-6">
          <Link href="/">
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-gray-600 hover:text-[var(--color-primary)] p-0"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio
            </Button>
          </Link>
        </div>

        {/* Logo y título */}
        <div className="text-center mb-8">
          <div
            className="mx-auto h-16 w-16 rounded-xl flex items-center justify-center mb-4 shadow-lg"
            style={{
              backgroundColor: theme.primaryColor,
            }}
          >
            <span className="text-2xl font-bold text-white">G</span>
          </div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900">GranitoSkate</h1>
          <p className="text-gray-600">Panel de Administración</p>
        </div>

        <ThemedCard className="shadow-xl border-0 backdrop-blur-sm">
          <ThemedCardHeader className="space-y-1 pb-6">
            <div className="flex items-center justify-center mb-4">
              <Shield style={{ color: theme.primaryColor }} className="h-8 w-8" />
            </div>
            <ThemedCardTitle className="text-2xl font-bold text-center">Acceso Seguro</ThemedCardTitle>
            <ThemedCardDescription className="text-center">
              Ingresa tus credenciales para acceder al panel de administración
            </ThemedCardDescription>
          </ThemedCardHeader>
          <ThemedCardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier" className="font-medium text-gray-700">
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
                    className="pl-10 h-12 border-gray-200 focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    autoComplete="username"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-medium text-gray-700">
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
                    className="pr-10 h-12 border-gray-200 focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]"
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
              <ThemedButton
                type="submit"
                className="w-full h-12 text-white font-medium shadow-lg transition-all duration-200"
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
              </ThemedButton>
            </form>

            {/* Información de seguridad */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-center text-sm text-gray-500">
                <Shield className="h-4 w-4 mr-2" />
                Conexión segura y cifrada
              </div>
            </div>
          </ThemedCardContent>
        </ThemedCard>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} GranitoSkate. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}
