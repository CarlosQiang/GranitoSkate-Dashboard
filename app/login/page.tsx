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
import { Loader2, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("admin@gmail.com")
  const [password, setPassword] = useState("GranitoSkate")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { data: session, status } = useSession()

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
      console.log("🔐 Intentando iniciar sesión con:", email)

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      console.log("🔍 Resultado del login:", result)

      if (result?.error) {
        console.error("❌ Error de login:", result.error)
        setError("Credenciales incorrectas. Verifica tu email y contraseña.")
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Verificando sesión...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">GranitoSkate</CardTitle>
          <CardDescription className="text-center">Inicia sesión en tu cuenta de administrador</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-2">Credenciales de prueba:</p>
            <div className="text-sm text-blue-700">
              <p>
                <strong>Email:</strong> admin@gmail.com
              </p>
              <p>
                <strong>Contraseña:</strong> GranitoSkate
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
