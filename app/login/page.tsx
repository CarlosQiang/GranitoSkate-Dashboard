"use client"

import type React from "react"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Shield, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useTheme } from "@/contexts/theme-context"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { theme } = useTheme()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Credenciales inválidas")
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      setError("Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo y título */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
              {theme?.logoUrl ? (
                <Image
                  src={theme.logoUrl || "/placeholder.svg"}
                  alt={theme.shopName || "Logo"}
                  width={48}
                  height={48}
                  className="rounded-xl"
                />
              ) : (
                <Image
                  src="/logo-granito-management.png"
                  alt="Granito Management app"
                  width={48}
                  height={48}
                  className="rounded-xl"
                />
              )}
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {theme?.shopName || "Granito Management app"}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">Panel de Administración</p>
          </div>
        </div>

        {/* Formulario de login */}
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full mx-auto mb-4">
              <Shield className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <CardTitle className="text-xl text-center text-slate-900 dark:text-slate-100">Acceso Seguro</CardTitle>
            <CardDescription className="text-center text-slate-600 dark:text-slate-400">
              Ingresa tus credenciales para acceder al panel de administración
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">
                  Usuario o Correo Electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="carlos@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-slate-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-400" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <div className="text-red-600 dark:text-red-400 text-sm text-center bg-red-50 dark:bg-red-900/20 p-2 rounded-md">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium py-2.5"
                disabled={isLoading}
              >
                {isLoading ? "Iniciando Sesión..." : "Iniciar Sesión"}
              </Button>
            </form>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <Link
                href="/"
                className="flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 text-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al inicio
              </Link>
            </div>

            <div className="flex items-center justify-center text-xs text-slate-500 dark:text-slate-400">
              <Shield className="w-3 h-3 mr-1" />
              Conexión segura y cifrada
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-slate-500 dark:text-slate-400">
          © 2025 {theme?.shopName || "Granito Management app"}. Todos los derechos reservados.
        </div>
      </div>
    </div>
  )
}
