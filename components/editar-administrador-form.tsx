"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { AlertCircle, Loader2, Eye, EyeOff } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

interface Administrador {
  id: string
  nombre_usuario: string
  correo_electronico: string
  nombre_completo: string | null
  rol: string
  activo: boolean
}

export default function EditarAdministradorForm({ administrador }: { administrador: Administrador }) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nombre_usuario: administrador.nombre_usuario,
    correo_electronico: administrador.correo_electronico,
    contrasena: "",
    nombre_completo: administrador.nombre_completo || "",
    rol: administrador.rol,
    activo: administrador.activo,
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch(`/api/administradores/${administrador.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al actualizar el administrador")
      }

      router.push("/dashboard/administradores")
      router.refresh()
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error al actualizar el administrador")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="nombre_usuario">Nombre de usuario</Label>
          <Input
            id="nombre_usuario"
            name="nombre_usuario"
            value={formData.nombre_usuario}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="correo_electronico">Correo electrónico</Label>
          <Input
            id="correo_electronico"
            name="correo_electronico"
            type="email"
            value={formData.correo_electronico}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contrasena">Nueva contraseña (dejar en blanco para mantener la actual)</Label>
          <div className="relative">
            <Input
              id="contrasena"
              name="contrasena"
              type={showPassword ? "text" : "password"}
              value={formData.contrasena}
              onChange={handleChange}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="nombre_completo">Nombre completo</Label>
          <Input id="nombre_completo" name="nombre_completo" value={formData.nombre_completo} onChange={handleChange} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rol">Rol</Label>
          <Select value={formData.rol} onValueChange={(value) => handleSelectChange("rol", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Administrador</SelectItem>
              <SelectItem value="superadmin">Super Administrador</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="activo" className="block mb-2">
            Estado
          </Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="activo"
              checked={formData.activo}
              onCheckedChange={(checked) => handleSwitchChange("activo", checked)}
            />
            <Label htmlFor="activo" className="cursor-pointer">
              {formData.activo ? "Activo" : "Inactivo"}
            </Label>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Link href="/dashboard/administradores">
          <Button type="button" variant="outline">
            Cancelar
          </Button>
        </Link>
        <Button type="submit" className="bg-granito hover:bg-granito-dark" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            "Guardar cambios"
          )}
        </Button>
      </div>
    </form>
  )
}
