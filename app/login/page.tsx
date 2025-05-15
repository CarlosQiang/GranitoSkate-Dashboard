"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { RefreshCw, User, Eye, EyeOff, AlertCircle, Info } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard"
  const errorType = searchParams?.get("error") || ""

  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [adminInfo, setAdminInfo] = useState<{ count: number; admins: any[] } | null>(null)
  const [showAdminInfo, setShowAdminInfo] = useState(false)

  useEffect(() => {
    if (errorType) {
      setError("Credenciales inválidas. Por favor, inténtalo de nuevo.")
    }
  }, [errorType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!identifier || !password) {
      setError("Por favor, completa todos los campos")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        redirect: false,
        identifier,
        password,
      })

      if (result?.error) {
        setError("Credenciales inválidas. Por favor, inténtalo de nuevo.")
        setIsLoading(false)
        return
      }

      router.push(callbackUrl)
    } catch (error) {
      setError("Ocurrió un error al iniciar sesión. Por favor, inténtalo de nuevo.")
      setIsLoading(false)
    }
  }

  const useAdmin = useCallback(
    (admin: any) => {
      setIdentifier(admin.nombre_usuario)
      setShowAdminInfo(false)
    },
    [setIdentifier, setShowAdminInfo],
  )

  const checkAdmins = async () => {
    setIsChecking(true)
    setAdminInfo(null)

    try {
      const response = await fetch("/api/init-admin")
      const data = await response.json()

      if (data.success) {
        setAdminInfo({
          count: data.admins.length,
          admins: data.admins,
        })
        setShowAdminInfo(true)
      } else {
        setError("No se encontraron administradores: " + data.message)
      }
    } catch (error) {
      setError("Error al conectar con el servidor")
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-md granito-gradient flex items-center justify-center">
              <span className="text-white text-xl font-bold">G</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold">GestionGranito</h1>
          <p className="text-muted-foreground mt-2">Accede a tu panel de administración</p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl">Iniciar sesión</CardTitle>
            <CardDescription>Introduce tu nombre de usuario o email para acceder</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">Usuario o Email</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                    <User className="h-4 w-4" />
                  </div>
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="Escriba su nombre o correo electrónico"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar sesión"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="w-full border-t my-2"></div>
            <div className="text-sm text-muted-foreground mb-2">
              ¿Problemas para iniciar sesión? Verifica los administradores disponibles:
            </div>
            <Button variant="outline" className="w-full" onClick={checkAdmins} disabled={isChecking}>
              {isChecking ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Verificar Administradores"
              )}
            </Button>
            {showAdminInfo && adminInfo && adminInfo.count > 0 && (
              <div className="mt-4 p-3 bg-primary/10 border border-primary/30 text-primary rounded-md text-sm">
                <div className="flex items-start mb-2">
                  <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <p>Se encontraron {adminInfo.count} administradores en la base de datos:</p>
                </div>
                <ul className="space-y-2 mt-2">
                  {adminInfo.admins.map((admin) => (
                    <li key={admin.id} className="flex justify-between items-center p-2 bg-white/50 rounded">
                      <div>
                        <div className="font-medium">{admin.nombre_completo}</div>
                        <div className="text-xs text-muted-foreground">
                          Usuario: {admin.nombre_usuario} | Rol: {admin.rol}
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => useAdmin(admin)}>
                        Usar
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardFooter>
        </Card>

        {error && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-md text-sm flex items-start">
            <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
