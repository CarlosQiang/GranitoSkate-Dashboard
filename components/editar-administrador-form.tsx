"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PasswordInput } from "@/components/password-input"

interface EditarAdministradorFormProps {
  id: string
}

export default function EditarAdministradorForm({ id }: EditarAdministradorFormProps) {
  const [formData, setFormData] = useState({
    nombre_usuario: "",
    correo_electronico: "",
    contrasena: "",
    nombre_completo: "",
    rol: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchAdministrador = async () => {
      try {
        const response = await fetch(`/api/administradores/${id}`)
        if (!response.ok) {
          throw new Error("Error al obtener datos del administrador")
        }
        const data = await response.json()
        setFormData({
          nombre_usuario: data.nombre_usuario || "",
          correo_electronico: data.correo_electronico || "",
          contrasena: "", // No mostramos la contraseña actual por seguridad
          nombre_completo: data.nombre_completo || "",
          rol: data.rol || "admin",
        })
        setFetchLoading(false)
      } catch (error) {
        console.error("Error al obtener administrador:", error)
        setError("No se pudo cargar la información del administrador")
        setFetchLoading(false)
      }
    }

    fetchAdministrador()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRolChange = (value: string) => {
    setFormData((prev) => ({ ...prev, rol: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Crear un objeto con solo los campos que queremos actualizar
    const updateData = { ...formData }

    // Si la contraseña está vacía, no la enviamos para actualizar
    if (!updateData.contrasena) {
      delete updateData.contrasena
    }

    try {
      const response = await fetch(`/api/administradores/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al actualizar administrador")
      }

      router.push("/dashboard/administradores")
      router.refresh()
    } catch (error: any) {
      console.error("Error al actualizar administrador:", error)
      setError(error.message || "Ocurrió un error al actualizar el administrador")
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar Administrador</CardTitle>
        <CardDescription>Actualiza la información del administrador</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre_usuario">Nombre de Usuario</Label>
            <Input
              id="nombre_usuario"
              name="nombre_usuario"
              value={formData.nombre_usuario}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="correo_electronico">Correo Electrónico</Label>
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
            <Label htmlFor="contrasena">Contraseña (dejar en blanco para mantener la actual)</Label>
            <PasswordInput id="contrasena" name="contrasena" value={formData.contrasena} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nombre_completo">Nombre Completo</Label>
            <Input
              id="nombre_completo"
              name="nombre_completo"
              value={formData.nombre_completo}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rol">Rol</Label>
            <Select value={formData.rol} onValueChange={handleRolChange}>
              <SelectTrigger id="rol">
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="viewer">Visualizador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && <div className="text-sm text-red-500">{error}</div>}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Actualizando..." : "Actualizar Administrador"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
