"use client"

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Code, RefreshCw } from "lucide-react"

interface FormularioCodigoPromocionProps {
  requiereCodigo: boolean
  codigo: string
  onChange: (datos: { requiereCodigo: boolean; codigo: string }) => void
}

export function FormularioCodigoPromocion({ requiereCodigo, codigo, onChange }: FormularioCodigoPromocionProps) {
  const generarCodigoAleatorio = () => {
    const caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    let resultado = ""
    for (let i = 0; i < 8; i++) {
      resultado += caracteres.charAt(Math.floor(Math.random() * caracteres.length))
    }
    onChange({ requiereCodigo, codigo: resultado })
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Código promocional</h2>
      <p className="text-muted-foreground">
        Decide si los clientes necesitarán introducir un código para aplicar el descuento
      </p>

      <div className="space-y-6 pt-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Code className="h-5 w-5 text-primary" />
              <Label htmlFor="requiere-codigo" className="font-medium">
                Requiere código promocional
              </Label>
            </div>
            <Switch
              id="requiere-codigo"
              checked={requiereCodigo}
              onCheckedChange={(checked) => onChange({ requiereCodigo: checked, codigo })}
            />
          </div>

          {requiereCodigo && (
            <div className="ml-7 space-y-2">
              <div className="flex space-x-2">
                <Input
                  id="codigo"
                  placeholder="Ej: VERANO2023"
                  value={codigo}
                  onChange={(e) => onChange({ requiereCodigo, codigo: e.target.value.toUpperCase() })}
                  className="uppercase"
                />
                <Button type="button" variant="outline" onClick={generarCodigoAleatorio}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generar
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Los clientes deberán introducir este código en el carrito para aplicar el descuento
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-muted/50 border rounded-md">
            <h3 className="text-sm font-medium">Con código:</h3>
            <ul className="text-sm text-muted-foreground list-disc list-inside mt-2 space-y-1">
              <li>Puedes compartir el código en redes sociales</li>
              <li>Ideal para campañas de marketing específicas</li>
              <li>Permite medir la efectividad de diferentes canales</li>
              <li>Los clientes deben introducir el código manualmente</li>
            </ul>
          </div>

          <div className="p-4 bg-muted/50 border rounded-md">
            <h3 className="text-sm font-medium">Sin código:</h3>
            <ul className="text-sm text-muted-foreground list-disc list-inside mt-2 space-y-1">
              <li>Se aplica automáticamente en el carrito</li>
              <li>Mejor experiencia de usuario</li>
              <li>Ideal para promociones generales</li>
              <li>No se puede compartir fácilmente en marketing</li>
            </ul>
          </div>
        </div>

        <div className="p-4 bg-muted/50 border rounded-md">
          <h3 className="text-sm font-medium">Consejo:</h3>
          <p className="text-sm text-muted-foreground">
            Usa códigos cortos y fáciles de recordar. Evita caracteres ambiguos como "0" y "O" o "1" e "I".
          </p>
        </div>
      </div>
    </div>
  )
}
