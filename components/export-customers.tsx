"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { exportCustomersToCSV } from "@/lib/api/customers"
import { Download, Loader2 } from "lucide-react"

interface ExportCustomersProps {
  filters: any
}

export function ExportCustomers({ filters }: ExportCustomersProps) {
  const { toast } = useToast()
  const [isExporting, setIsExporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleExport = async () => {
    try {
      setIsExporting(true)
      setProgress(10)

      // Obtener los datos
      const { headers, rows } = await exportCustomersToCSV(filters)
      setProgress(70)

      // Convertir a CSV
      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          row
            .map((cell) => (typeof cell === "string" && cell.includes(",") ? `"${cell.replace(/"/g, '""')}"` : cell))
            .join(","),
        ),
      ].join("\n")

      setProgress(90)

      // Crear y descargar el archivo
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `clientes-${new Date().toISOString().split("T")[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setProgress(100)
      toast({
        title: "Exportación completada",
        description: `Se han exportado ${rows.length} clientes correctamente.`,
      })

      setTimeout(() => {
        setIsDialogOpen(false)
        setProgress(0)
      }, 1000)
    } catch (error) {
      toast({
        title: "Error en la exportación",
        description: `No se pudieron exportar los clientes: ${(error as Error).message}`,
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar clientes
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Exportar clientes a CSV</DialogTitle>
          <DialogDescription>
            Se exportarán todos los clientes que coincidan con los filtros actuales.
          </DialogDescription>
        </DialogHeader>

        {isExporting ? (
          <div className="space-y-4 py-4">
            <Progress value={progress} className="h-2" />
            <p className="text-center text-sm text-muted-foreground">
              {progress < 50
                ? "Obteniendo datos de clientes..."
                : progress < 90
                  ? "Generando archivo CSV..."
                  : "Completando exportación..."}
            </p>
          </div>
        ) : (
          <div className="py-4">
            <p className="text-sm">El archivo CSV incluirá la siguiente información:</p>
            <ul className="list-disc list-inside text-sm mt-2 space-y-1">
              <li>Información personal (nombre, email, teléfono)</li>
              <li>Datos de compras (número de pedidos, total gastado)</li>
              <li>Dirección predeterminada</li>
              <li>DNI (si está registrado)</li>
              <li>Etiquetas</li>
            </ul>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isExporting}>
            Cancelar
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
