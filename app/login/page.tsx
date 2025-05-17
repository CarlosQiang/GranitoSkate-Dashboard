"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Capturar errores de la URL
  useEffect(() => {
    const errorParam = searchParams?.get("error")
    if (errorParam) {
      if (errorParam === "CredentialsSignin") {
        setError("Credenciales inválidas. Por favor, inténtalo de nuevo.")
      } else {
        setError("Error al iniciar sesión. Por favor, inténtalo de nuevo.")
      }
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      console.log("Intentando iniciar sesión con:", { identifier, password })

      const result = await signIn("credentials", {
        redirect: false,
        identifier,
        password,
      })

      console.log("Resultado de inicio de sesión:", result)

      if (result?.error) {
        setError("Credenciales inválidas. Por favor, inténtalo de nuevo.")
      } else if (result?.ok) {
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error) {
      console.error("Error de inicio de sesión:", error)
      setError("Ocurrió un error al iniciar sesión. Por favor, inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-md bg-amber-500 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">G</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">GestionGranito</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Accede a tu panel de administración</p>
        </div>

        <form className="mt-8 space-y-6 bg-white p-8 shadow rounded-lg" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Iniciar sesión</h3>
            <p className="text-sm text-gray-500">Introduce tu nombre de usuario o email para acceder</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                Usuario o Email
              </label>
              <div className="mt-1">
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
