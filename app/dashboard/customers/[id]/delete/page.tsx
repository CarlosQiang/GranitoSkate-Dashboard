"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { deleteCustomer } from "@/lib/api/customers"
import { ArrowLeft, Loader2, Trash2 } from "lucide-react"
import Link from "next/link"

export default function DeleteCustomerPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await deleteCustomer(params.id)

      toast({
        title: "Cliente eliminado",
        description: "El cliente ha sido eliminado correctamente",
      })

      // Redirigir a la lista de clientes
      router.push("/dashboard/customers")
    } catch (error) {
      console.error("Error deleting customer:", error)
      toast({
        title: "Error",
        description: `No se pudo eliminar el cliente: ${(error as Error).message}`,
        variant: "destructive",
      })
      setIsDeleting(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-4">
        <Button variant="outline" size="icon" asChild className="mr-2">
          <Link href={`/dashboard/customers/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Eliminar cliente</h1>
      </div>

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Confirmar eliminación
          </CardTitle>
          <CardDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente este cliente y todos sus datos asociados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">¿Estás seguro de que deseas eliminar este cliente? Esta acción eliminará:</p>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>Información personal del cliente</li>
            <li>Direcciones registradas</li>
            <li>Metadatos asociados (DNI, etc.)</li>
            <li>Etiquetas y notas</li>
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            Nota: Los pedidos asociados a este cliente no se eliminarán, pero perderán su asociación con el cliente.
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/customers/${params.id}`}>Cancelar</Link>
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar cliente
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
