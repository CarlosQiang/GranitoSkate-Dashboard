"use client"

export const dynamic = "force-dynamic"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { AlertCircle, CheckCircle2, Loader2, Shield, Trash2, UserPlus, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import type { Administrador } from "@/lib/auth-service"

export default function AdministradoresPage() {
  const session = useSession()
  const sessionData = session?.data
  const status = session?.status || "loading"
  const [administradores, setAdministradores] = useState<Administrador[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [formData, setFormData] = useState({
    nombre_usuario: "",
    correo_electronico: "",
    contrasena: "",
    confirmar_contrasena: "",
    nombre_completo: "",
    rol: "admin",
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Verificar si el usuario tiene permisos de superadmin
  const isSuperAdmin = sessionData?.user?.role === "superadmin"

  useEffect(() => {
    if (status === "loading") return

    if (!sessionData) {
      // Redirigir a login si no hay sesión
      window.location.href = "/login"
      return
    }

    if (sessionData.user.role !== "superadmin") {
      // No cargar datos si no es superadmin
      setLoading(false)
      return
    }

    fetchAdministradores()
  }, [sessionData, status])

  const fetchAdministradores = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/administradores")
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Error al cargar administradores")
      }
      const data = await response.json()
      setAdministradores(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
      toast({
        title: "Error",
        description: "No se pudieron cargar los administradores",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Limpiar error del campo
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, rol: value }))
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.nombre_usuario.trim()) {
      errors.nombre_usuario = "El nombre de usuario es obligatorio"
    } else if (formData.nombre_usuario.length < 3) {
      errors.nombre_usuario = "El nombre de usuario debe tener al menos 3 caracteres"
    }

    if (!formData.correo_electronico.trim()) {
      errors.correo_electronico = "El correo electrónico es obligatorio"
    } else if (!/\S+@\S+\.\S+/.test(formData.correo_electronico)) {
      errors.correo_electronico = "El correo electrónico no es válido"
    }

    if (!formData.contrasena) {
      errors.contrasena = "La contraseña es obligatoria"
    } else if (formData.contrasena.length < 8) {
      errors.contrasena = "La contraseña debe tener al menos 8 caracteres"
    }

    if (formData.contrasena !== formData.confirmar_contrasena) {
      errors.confirmar_contrasena = "Las contraseñas no coinciden"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch("/api/administradores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre_usuario: formData.nombre_usuario,
          correo_electronico: formData.correo_electronico,
          contrasena: formData.contrasena,
          nombre_completo: formData.nombre_completo || undefined,
          rol: formData.rol,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al crear administrador")
      }

      toast({
        title: "Éxito",
        description: "Administrador creado correctamente",
      })

      // Resetear formulario y cerrar diálogo
      setFormData({
        nombre_usuario: "",
        correo_electronico: "",
        contrasena: "",
        confirmar_contrasena: "",
        nombre_completo: "",
        rol: "admin",
      })
      setOpenDialog(false)

      // Recargar lista de administradores
      fetchAdministradores()
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Error desconocido",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (id: number, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/administradores/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          activo: !currentActive,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al cambiar estado del administrador")
      }

      toast({
        title: "Éxito",
        description: `Administrador ${!currentActive ? "activado" : "desactivado"} correctamente`,
      })

      // Actualizar lista de administradores
      fetchAdministradores()
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Error desconocido",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      const response = await fetch(`/api/administradores/${deleteId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al eliminar administrador")
      }

      toast({
        title: "Éxito",
        description: "Administrador eliminado correctamente",
      })

      // Cerrar diálogo y recargar lista
      setOpenDeleteDialog(false)
      setDeleteId(null)
      fetchAdministradores()
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Error desconocido",
        variant: "destructive",
      })
    }
  }

  const confirmDelete = (id: number) => {
    setDeleteId(id)
    setOpenDeleteDialog(true)
  }

  // Mostrar pantalla de carga mientras se verifica la sesión
  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Redirigir si no es superadmin
  if (sessionData && sessionData.user && sessionData.user.role !== "superadmin") {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Acceso denegado</AlertTitle>
          <AlertDescription>No tienes permisos para acceder a esta sección.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <Toaster />

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Administradores</h1>
          <p className="text-muted-foreground">Gestiona los usuarios administradores del sistema</p>
        </div>

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Nuevo Administrador
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Administrador</DialogTitle>
              <DialogDescription>Completa el formulario para crear un nuevo administrador.</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nombre_usuario">
                    Nombre de Usuario <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nombre_usuario"
                    name="nombre_usuario"
                    value={formData.nombre_usuario}
                    onChange={handleInputChange}
                    className={formErrors.nombre_usuario ? "border-red-500" : ""}
                    disabled={submitting}
                  />
                  {formErrors.nombre_usuario && <p className="text-red-500 text-sm">{formErrors.nombre_usuario}</p>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="correo_electronico">
                    Correo Electrónico <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="correo_electronico"
                    name="correo_electronico"
                    type="email"
                    value={formData.correo_electronico}
                    onChange={handleInputChange}
                    className={formErrors.correo_electronico ? "border-red-500" : ""}
                    disabled={submitting}
                  />
                  {formErrors.correo_electronico && (
                    <p className="text-red-500 text-sm">{formErrors.correo_electronico}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="nombre_completo">Nombre Completo</Label>
                  <Input
                    id="nombre_completo"
                    name="nombre_completo"
                    value={formData.nombre_completo}
                    onChange={handleInputChange}
                    disabled={submitting}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="contrasena">
                    Contraseña <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="contrasena"
                    name="contrasena"
                    type="password"
                    value={formData.contrasena}
                    onChange={handleInputChange}
                    className={formErrors.contrasena ? "border-red-500" : ""}
                    disabled={submitting}
                  />
                  {formErrors.contrasena && <p className="text-red-500 text-sm">{formErrors.contrasena}</p>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="confirmar_contrasena">
                    Confirmar Contraseña <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="confirmar_contrasena"
                    name="confirmar_contrasena"
                    type="password"
                    value={formData.confirmar_contrasena}
                    onChange={handleInputChange}
                    className={formErrors.confirmar_contrasena ? "border-red-500" : ""}
                    disabled={submitting}
                  />
                  {formErrors.confirmar_contrasena && (
                    <p className="text-red-500 text-sm">{formErrors.confirmar_contrasena}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="rol">Rol</Label>
                  <Select value={formData.rol} onValueChange={handleSelectChange} disabled={submitting}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="superadmin">Super Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setOpenDialog(false)} disabled={submitting}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lista de Administradores</CardTitle>
          <CardDescription>Administra los usuarios con acceso al sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-[250px] bg-gray-200 animate-pulse" />
                    <div className="h-4 w-[200px] bg-gray-200 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : administradores.length === 0 ? (
            <div className="text-center py-10">
              <Shield className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <p className="mt-4 text-lg text-muted-foreground">No hay administradores registrados</p>
              <Button className="mt-4" onClick={() => setOpenDialog(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Crear primer administrador
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Último Acceso</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {administradores.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">{admin.nombre_usuario}</TableCell>
                    <TableCell>{admin.correo_electronico}</TableCell>
                    <TableCell>{admin.nombre_completo || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={admin.rol === "superadmin" ? "default" : "outline"}>
                        {admin.rol === "superadmin" ? "Super Admin" : "Admin"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={admin.activo ? "success" : "destructive"}
                        className={admin.activo ? "bg-green-500" : ""}
                      >
                        {admin.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {admin.ultimo_acceso
                        ? new Date(admin.ultimo_acceso).toLocaleString("es-ES", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Nunca"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleToggleActive(admin.id, admin.activo)}
                          title={admin.activo ? "Desactivar" : "Activar"}
                          disabled={admin.id.toString() === sessionData?.user?.id}
                        >
                          {admin.activo ? (
                            <XCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => confirmDelete(admin.id)}
                          title="Eliminar"
                          disabled={admin.id.toString() === sessionData?.user?.id}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este administrador? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
