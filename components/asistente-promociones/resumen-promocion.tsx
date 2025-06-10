"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface ResumenPromocionProps {
  datosPromocion: any
  setDatosPromocion: (datos: any) => void
}

const ResumenPromocion = ({ datosPromocion, setDatosPromocion }: ResumenPromocionProps) => {
  const { toast } = useToast()
  const router = useRouter()
  const [creandoPromocion, setCreandoPromocion] = useState(false)
  const [error, setError] = useState("")

  const crearPromocion = async () => {
    if (creandoPromocion) return

    setCreandoPromocion(true)
    setError("")

    try {
      console.log("📝 Creando promoción:", datosPromocion)

      // Preparar los datos para Shopify
      const shopifyData = {
        titulo: datosPromocion.titulo,
        descripcion: datosPromocion.descripcion || datosPromocion.titulo,
        tipo: datosPromocion.tipo,
        valor: datosPromocion.valor,
        codigo: datosPromocion.codigo || "",
        fechaInicio: datosPromocion.fechaInicio
          ? new Date(datosPromocion.fechaInicio).toISOString()
          : new Date().toISOString(),
        fechaFin: datosPromocion.fechaFin ? new Date(datosPromocion.fechaFin).toISOString() : null,
        compraMinima: datosPromocion.compraMinima || null,
        limitarUsos: datosPromocion.limitarUsos || false,
        limiteUsos: datosPromocion.limiteUsos || null,
        objetivo: datosPromocion.objetivo || "TODOS_LOS_PRODUCTOS",
      }

      console.log("📝 Datos preparados para Shopify:", shopifyData)

      // Crear en Shopify primero
      const shopifyResponse = await fetch("/api/shopify/promotions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(shopifyData),
      })

      if (!shopifyResponse.ok) {
        const errorData = await shopifyResponse.json()
        throw new Error(errorData.error || `Error HTTP: ${shopifyResponse.status}`)
      }

      const shopifyResult = await shopifyResponse.json()

      if (!shopifyResult.success) {
        throw new Error(shopifyResult.error || "Error al crear promoción en Shopify")
      }

      console.log("✅ Promoción creada en Shopify:", shopifyResult)

      // Mostrar mensaje de éxito
      toast({
        title: "¡Promoción creada!",
        description: `La promoción "${datosPromocion.titulo}" se ha creado correctamente en Shopify.`,
      })

      // Redirigir a la lista de promociones
      router.push("/dashboard/promociones")
    } catch (error) {
      console.error("❌ Error creando promoción:", error)
      setError(error.message || "Error al crear la promoción")

      toast({
        title: "Error",
        description: error.message || "No se pudo crear la promoción",
        variant: "destructive",
      })
    } finally {
      setCreandoPromocion(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen de la Promoción</CardTitle>
        <CardDescription>Revisa los detalles antes de crear la promoción.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="titulo">Título</Label>
          <Input id="titulo" value={datosPromocion.titulo} readOnly />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="descripcion">Descripción</Label>
          <Textarea id="descripcion" value={datosPromocion.descripcion} readOnly />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="tipo">Tipo de Promoción</Label>
          <Input id="tipo" value={datosPromocion.tipo} readOnly />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="valor">Valor</Label>
          <Input id="valor" value={datosPromocion.valor} readOnly />
        </div>
        {datosPromocion.tipo === "codigo_descuento" && (
          <div className="grid gap-2">
            <Label htmlFor="codigo">Código de Descuento</Label>
            <Input id="codigo" value={datosPromocion.codigo} readOnly />
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
            <Input
              id="fechaInicio"
              value={
                datosPromocion.fechaInicio
                  ? format(new Date(datosPromocion.fechaInicio), "PPP", { locale: es })
                  : "No definida"
              }
              readOnly
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="fechaFin">Fecha de Fin</Label>
            <Input
              id="fechaFin"
              value={
                datosPromocion.fechaFin
                  ? format(new Date(datosPromocion.fechaFin), "PPP", { locale: es })
                  : "No definida"
              }
              readOnly
            />
          </div>
        </div>
        {datosPromocion.compraMinima && (
          <div className="grid gap-2">
            <Label htmlFor="compraMinima">Compra Mínima</Label>
            <Input id="compraMinima" value={datosPromocion.compraMinima} readOnly />
          </div>
        )}
        {datosPromocion.limitarUsos && (
          <div className="grid gap-2">
            <Label htmlFor="limiteUsos">Límite de Usos</Label>
            <Input id="limiteUsos" value={datosPromocion.limiteUsos} readOnly />
          </div>
        )}
        <div className="grid gap-2">
          <Label htmlFor="objetivo">Objetivo</Label>
          <Input id="objetivo" value={datosPromocion.objetivo} readOnly />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          Regresar
        </Button>
        <Button onClick={crearPromocion} disabled={creandoPromocion}>
          {creandoPromocion ? "Creando..." : "Crear Promoción"}
        </Button>
      </CardFooter>
    </Card>
  )
}

export default ResumenPromocion
