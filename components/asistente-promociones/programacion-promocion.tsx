"use client"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/date-picker"
import { Clock, Users } from "lucide-react"

interface FormularioProgramacionPromocionProps {
  tieneFechaFin: boolean
  fechaInicio: Date
  fechaFin: Date
  limitarUsos: boolean
  limiteUsos: string
  onChange: (
    datos: Partial<{
      tieneFechaFin: boolean
      fechaInicio: Date
      fechaFin: Date
      limitarUsos: boolean
      limiteUsos: string
    }>,
  ) => void
}

export function FormularioProgramacionPromocion({
  tieneFechaFin,
  fechaInicio,
  fechaFin,
  limitarUsos,
  limiteUsos,
  onChange,
}: FormularioProgramacionPromocionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Programa tu promoción</h2>
      <p className="text-muted-foreground">Define cuándo estará activa la promoción y si tendrá un límite de usos</p>

      <div className="space-y-6 pt-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Fecha de inicio</Label>
            <DatePicker
              date={fechaInicio}
              onSelect={(fecha) => fecha && onChange({ fechaInicio: fecha })}
              placeholder="Selecciona fecha de inicio"
            />
            <p className="text-sm text-muted-foreground">La promoción estará activa a partir de esta fecha</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-granito" />
              <Label htmlFor="tiene-fecha-fin" className="font-medium">
                Fecha de finalización
              </Label>
            </div>
            <Switch
              id="tiene-fecha-fin"
              checked={tieneFechaFin}
              onCheckedChange={(checked) => onChange({ tieneFechaFin: checked })}
              className="data-[state=checked]:bg-granito"
            />
          </div>

          {tieneFechaFin && (
            <div className="ml-7 space-y-2">
              <DatePicker
                date={fechaFin}
                onSelect={(fecha) => fecha && onChange({ fechaFin: fecha })}
                placeholder="Selecciona fecha de fin"
              />
              <p className="text-sm text-muted-foreground">La promoción dejará de estar activa después de esta fecha</p>
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-granito" />
              <Label htmlFor="limitar-usos" className="font-medium">
                Limitar número de usos
              </Label>
            </div>
            <Switch
              id="limitar-usos"
              checked={limitarUsos}
              onCheckedChange={(checked) => onChange({ limitarUsos: checked })}
              className="data-[state=checked]:bg-granito"
            />
          </div>

          {limitarUsos && (
            <div className="ml-7 space-y-2">
              <Input
                id="limite-usos"
                type="number"
                placeholder="100"
                value={limiteUsos}
                onChange={(e) => onChange({ limiteUsos: e.target.value })}
                min="1"
              />
              <p className="text-sm text-muted-foreground">
                La promoción dejará de estar activa después de este número de usos
              </p>
            </div>
          )}
        </div>

        <div className="p-4 bg-granito-light/10 border border-granito-light/20 rounded-md">
          <h3 className="text-sm font-medium text-granito-dark">Consejo:</h3>
          <p className="text-sm text-granito-dark/80">
            Las promociones con tiempo limitado generan sensación de urgencia. Considera usar promociones de corta
            duración (1-2 semanas) para aumentar las conversiones.
          </p>
        </div>
      </div>
    </div>
  )
}
