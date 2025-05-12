"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { deleteProduct } from "@/lib/api/products"

export function ProductDeleteSection({ product }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (confirmText !== product.title) {
      toast({
        title: "Confirmación incorrecta",
        description: "El texto de confirmación no coincide con el título del producto",
        variant: "destructive",
      })
      return
    }

    try {
      setIsDeleting(true)
      await deleteProduct(product.id)
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado correctamente",
      })
      setIsOpen(false)
      router.push("/dashboard/products")
    } catch (error) {
      console.error("Error al eliminar el producto:", error)
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error al eliminar el producto",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Advertencia</AlertTitle>
        <AlertDescription>
          Las acciones en esta sección son permanentes y no se pueden deshacer. Procede con precaución.
        </AlertDescription>
      </Alert>

      <div className="border border-red-200 rounded-md p-4">
        <h3 className="text-lg font-medium text-red-600 mb-2">Eliminar producto</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Esta acción eliminará permanentemente el producto &quot;{product.title}&quot; y todos sus datos asociados.
          Esta acción no se puede deshacer.
        </p>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="gap-2">
              <Trash2 className="h-4 w-4" />
              Eliminar producto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>¿Estás seguro?</DialogTitle>
              <DialogDescription>
                Esta acción no se puede deshacer. Esto eliminará permanentemente el producto &quot;{product.title}&quot;
                y todos sus datos asociados.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="confirm" className="text-sm font-medium">
                Para confirmar, escribe el nombre del producto: <span className="font-bold">{product.title}</span>
              </Label>
              <Input
                id="confirm"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="mt-2"
                placeholder={product.title}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isDeleting}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={confirmText !== product.title || isDeleting}
                className="gap-2"
              >
                {isDeleting ? "Eliminando..." : "Eliminar permanentemente"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
