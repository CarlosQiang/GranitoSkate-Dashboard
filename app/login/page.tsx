"use client"

import type React from "react"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Obtener error de la URL si existe
  const errorFromUrl = searchParams.get("error")
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const identifier = formData.get("identifier") as string
    const password = formData.get("password") as string

    try {
      const result = await signIn("credentials", {
        identifier,
        password,
        redirect: false,
        callbackUrl,
      })

      if (result?.error) {
        setError("Credenciales incorrectas")
      } else if (result?.url) {
        router.push(result.url)
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      setError("Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  // Determinar mensaje de error a mostrar
  const errorMessage = errorFromUrl
    ? errorFromUrl === "CredentialsSignin"
      ? "Credenciales incorrectas"
      : "Error al iniciar sesión"
    : error

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">GestionGranito</CardTitle>
          <CardDescription>Inicia sesión para acceder al panel de administración</CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">Email o Usuario</Label>
              <Input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                required
                placeholder="Introduce tu email o nombre de usuario"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Introduce tu contraseña"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">Panel de administración exclusivo para personal autorizado</p>
        </CardFooter>
      </Card>
    </div>
  )
}
