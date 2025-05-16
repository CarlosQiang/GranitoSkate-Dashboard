"use client"

import type React from "react"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        redirect: false,
        identifier,
        password,
      })

      if (result?.error) {
        setError("Credenciales inválidas. Por favor, inténtalo de nuevo.")
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      setError("Ocurrió un error al iniciar sesión. Por favor, inténtalo de nuevo.")
      console.error("Error de inicio de sesión:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <div className="bg-amber-500 w-12 h-12 rounded-md flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">G</span>
          </div>
          <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-gray-900">GestionGranito</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Accede a tu panel de administración</p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow-md rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <h3 className="text-lg font-medium">Iniciar sesión</h3>
            <p className="text-sm text-gray-500">Introduce tu nombre de usuario o email para acceder</p>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div>
              <Label htmlFor="identifier">Usuario o Email</Label>
              <div className="mt-1">
                <Input
                  id="identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="block w-full"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Contraseña</Label>
              <div className="mt-1 relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <Button type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                {loading ? "Iniciando sesión..." : "Iniciar sesión"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
