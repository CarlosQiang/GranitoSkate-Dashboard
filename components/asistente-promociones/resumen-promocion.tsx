"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CalendarIcon,
  PercentIcon,
  CreditCardIcon,
  ShoppingBagIcon,
  PackageIcon,
  TagIcon,
  ShoppingCartIcon,
} from "lucide-react"
import type { TipoPromocion } from "./tipo-promocion"
import type { ObjetivoPromocion } from "./objetivo-promocion"

interface FormularioResumenPromocionProps {
  datos: {
    titulo: string
    descripcion: string
    tipo: TipoPromocion
    objetivo: ObjetivoPromocion
    valor: string
    codigo: string
    fechaInicio: Date
    fechaFin?: Date
    limiteUsos?: number
  }
}

export function FormularioResumenPromocion({ datos }: FormularioResumenPromocionProps) {
  const formatDate = (date: Date) => {
    if (!date) return ""
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Resumen de la promoción</h2>
      <p className="text-muted-foreground">Revisa los detalles de tu promoción antes de crearla.</p>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{datos.titulo}</CardTitle>
              <CardDescription>{datos.descripcion}</CardDescription>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800">
              Borrador
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Tipo de promoción</div>
                <div className="flex items-center gap-2">
                  {datos.tipo === "PORCENTAJE_DESCUENTO" && <PercentIcon className="h-4 w-4 text-primary" />}
                  {datos.tipo === "CANTIDAD_FIJA" && <CreditCardIcon className="h-4 w-4 text-primary" />}
                  {datos.tipo === "COMPRA_X_LLEVA_Y" && <ShoppingBagIcon className="h-4 w-4 text-primary" />}
                  {datos.tipo === "ENVIO_GRATIS" && <PackageIcon className="h-4 w-4 text-primary" />}
                  <span>
                    {datos.tipo === "PORCENTAJE_DESCUENTO" && `${datos.valor}% de descuento`}
                    {datos.tipo === "CANTIDAD_FIJA" && `${datos.valor}€ de descuento`}
                    {datos.tipo === "COMPRA_X_LLEVA_Y" && "Compra X y lleva Y"}
                    {datos.tipo === "ENVIO_GRATIS" && "Envío gratis"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Objetivo</div>
                <div className="flex items-center gap-2">
                  {datos.objetivo === "CART" && <ShoppingCartIcon className="h-4 w-4 text-primary" />}
                  {datos.objetivo === "COLLECTION" && <TagIcon className="h-4 w-4 text-primary" />}
                  {datos.objetivo === "PRODUCT" && <PackageIcon className="h-4 w-4 text-primary" />}
                  <span>
                    {datos.objetivo === "CART" && "Todo el carrito"}
                    {datos.objetivo === "COLLECTION" && "Colección específica"}
                    {datos.objetivo === "PRODUCT" && "Producto específico"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Código de promoción</div>
                <div className="flex items-center">
                  {datos.codigo ? (
                    <Badge variant="secondary" className="font-mono">
                      {datos.codigo}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">Aplicación automática (sin código)</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Límite de usos</div>
                <div>
                  {datos.limiteUsos ? (
                    <span>{datos.limiteUsos} usos</span>
                  ) : (
                    <span className="text-muted-foreground">Sin límite</span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t">
              <div className="text-sm font-medium text-muted-foreground mb-2">Periodo de validez</div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-primary" />
                <span>
                  Desde {formatDate(datos.fechaInicio)}
                  {datos.fechaFin ? ` hasta ${formatDate(datos.fechaFin)}` : " (sin fecha de finalización)"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Exportar también como ResumenPromocion para mantener compatibilidad
export const ResumenPromocion = FormularioResumenPromocion
