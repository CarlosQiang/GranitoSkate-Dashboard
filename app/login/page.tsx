"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!identifier || !password) {
      setError("Por favor, completa todos los campos")
      return
    }

    try {
      setLoading(true)
      setError("")

      const result = await signIn("credentials", {
        redirect: false,
        identifier,
        password,
      })

      if (result?.error) {
        setError("Credenciales inválidas. Por favor, inténtalo de nuevo.")
        setLoading(false)
        return
      }

      router.push("/dashboard")
    } catch (err) {
      console.error("Error de inicio de sesión:", err)
      setError("Ocurrió un error al iniciar sesión. Por favor, inténtalo de nuevo.")
      setLoading(false)
    }
  }

  const toggleShowPassword = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-granito-500 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">G</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">GranitoSkate</h2>
          <p className="mt-2 text-sm text-gray-600">Inicia sesión para acceder al panel de administración</p>
        </div>

        <div className="mt-8">
          <div className="rounded-md shadow-sm">
            <h3 className="text-xl font-medium text-gray-900 mb-4">Iniciar sesión</h3>
            <p className="text-sm text-gray-600 mb-6">
              Ingresa tus credenciales para acceder al panel de administración
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                  Usuario o Email
                </label>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username email"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-granito-500 focus:border-granito-500"
                  placeholder="Ingresa tu usuario o email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-granito-500 focus:border-granito-500"
                    placeholder="Ingresa tu contraseña"
                  />
                  <button
                    type="button"
                    onClick={toggleShowPassword}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-granito-500 hover:bg-granito-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-granito-500 disabled:opacity-50"
                >
                  {loading ? "Iniciando sesión..." : "Iniciar sesión"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
