"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

export function TestBaseDatos() {
  const [emailUsuario, setEmailUsuario] = useState("admin@gestiongranito.com")
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<any>(null)
  const { toast } = useToast()

  const verificarBaseDatos = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/db/verificar")
      const data = await response.json()
      setResultado(data)

      if (data.estado === "OK") {
        toast({
          title: "✅ Base de datos verificada",
          description: "Todas las tablas están funcionando correctamente",
        })
      } else {
        toast({
          title: "⚠️ Problemas encontrados",
          description: "Revisa los detalles de la verificación",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "❌ Error de conexión",
        description: "No se pudo conectar con la base de datos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const crearProductoPrueba = async () => {
    setLoading(true)
    try {
      const datosProducto = {
        email_usuario: emailUsuario,
        nombre: "Producto de Prueba",
        descripcion: "Este es un producto de prueba creado desde la nueva API",
        precio: 29.99,
        cantidad_inventario: 10,
        categoria: "Pruebas",
        estado: "borrador",
      }

      const response = await fetch("/api/db/productos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datosProducto),
      })

      const producto = await response.json()

      if (response.ok) {
        toast({
          title: "✅ Producto creado",
          description: `Producto "${producto.nombre}" creado correctamente`,
        })
        setResultado(producto)
      } else {
        throw new Error(producto.error)
      }
    } catch (error) {
      toast({
        title: "❌ Error creando producto",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const listarProductos = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/db/productos?emailUsuario=${encodeURIComponent(emailUsuario)}`)
      const data = await response.json()

      if (response.ok) {
        setResultado(data)
        toast({
          title: "✅ Productos obtenidos",
          description: `Se encontraron ${data.productos?.length || 0} productos`,
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "❌ Error obteniendo productos",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Pruebas de Base de Datos</CardTitle>
          <CardDescription>Prueba las nuevas funcionalidades de la base de datos simplificada</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="emailUsuario">Email de Usuario</Label>
            <Input
              id="emailUsuario"
              value={emailUsuario}
              onChange={(e) => setEmailUsuario(e.target.value)}
              placeholder="admin@gestiongranito.com"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button onClick={verificarBaseDatos} disabled={loading}>
              🔍 Verificar Base de Datos
            </Button>
            <Button onClick={crearProductoPrueba} disabled={loading}>
              ➕ Crear Producto de Prueba
            </Button>
            <Button onClick={listarProductos} disabled={loading}>
              📋 Listar Productos
            </Button>
          </div>

          {resultado && (
            <div>
              <Label>Resultado:</Label>
              <Textarea value={JSON.stringify(resultado, null, 2)} readOnly className="h-64 font-mono text-sm" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
