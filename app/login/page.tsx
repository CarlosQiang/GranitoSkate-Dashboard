"use client"

import type React from "react"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (result?.error) {
        setError("Credenciales inválidas. Por favor, inténtalo de nuevo.")
        setIsLoading(false)
        return
      }

      router.push("/dashboard")
    } catch (error) {
      setError("Ocurrió un error al iniciar sesión. Por favor, inténtalo de nuevo.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative w-24 h-24">
              <Image
                src="/placeholder.svg?key=hwcy9"
                alt="Granito Skate Logo"
                width={96}
                height={96}
                className="rounded-full granito-shadow"
              />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Granito Skate Dashboard</h2>
          <p className="mt-2 text-sm text-gray-600">Inicia sesión para administrar tu tienda</p>
        </div>

        <Card className="border-2 border-primary/10 granito-shadow">
          <CardHeader>
            <CardTitle className="text-xl text-center">Iniciar Sesión</CardTitle>
            <CardDescription className="text-center">Ingresa tus credenciales para acceder</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  className="border-2 focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="border-2 focus:border-primary"
                />
              </div>
              <Button
                type="submit"
                className="w-full granito-gradient hover:opacity-90 transition-opacity"
                disabled={isLoading}
              >
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-500">¿Problemas para iniciar sesión? Contacta al administrador</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
