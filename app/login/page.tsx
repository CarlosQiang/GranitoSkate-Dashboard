"use client"

import type React from "react"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (result?.error) {
        setError("Credenciales inválidas. Por favor, inténtalo de nuevo.")
        setLoading(false)
        return
      }

      router.push("/dashboard")
    } catch (error) {
      setError("Ocurrió un error al iniciar sesión. Por favor, inténtalo de nuevo.")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#d29a43]">Granito Skate</h1>
          <p className="mt-2 text-gray-600">Inicia sesión en tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-lg bg-white p-8 shadow-md">
          {error && <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>}

          <div className="mb-4">
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#d29a43] focus:outline-none focus:ring-1 focus:ring-[#d29a43]"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#d29a43] focus:outline-none focus:ring-1 focus:ring-[#d29a43]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-[#d29a43] py-2 px-4 font-medium text-white hover:bg-[#b88535] focus:outline-none focus:ring-2 focus:ring-[#d29a43] focus:ring-offset-2 disabled:opacity-70"
          >
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            ¿Problemas para iniciar sesión?{" "}
            <a href="mailto:soporte@granitoskate.com" className="font-medium text-[#d29a43] hover:text-[#b88535]">
              Contacta con soporte
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
