"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { deleteCustomerAddress, setDefaultCustomerAddress } from "@/lib/api/customers"
import { Pencil, Trash2, Check } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface CustomerAddressCardProps {
  address: {
    id: string
    address1: string
    address2?: string
    city: string
    province?: string
    zip: string
    country: string
    phone?: string
  }
  customerId: string
  isDefault: boolean
}

export function CustomerAddressCard({ address, customerId, isDefault }: CustomerAddressCardProps) {
  const { toast } = useToast()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSettingDefault, setIsSettingDefault] = useState(false)

  const handleSetDefaultAddress = async () => {
    if (isDefault) return

    setIsSettingDefault(true)
    try {
      await setDefaultCustomerAddress(customerId, address.id)

      toast({
        title: "Dirección actualizada",
        description: "La dirección predeterminada ha sido actualizada",
      })

      // Reload the page to reflect changes
      window.location.reload()
    } catch (error) {
      console.error("Error setting default address:", error)
      toast({
        title: "Error",
        description: "No se pudo establecer la dirección predeterminada",
        variant: "destructive",
      })
    } finally {
      setIsSettingDefault(false)
    }
  }

  const handleDeleteAddress = async () => {
    setIsDeleting(true)
    try {
      await deleteCustomerAddress(address.id)

      toast({
        title: "Dirección eliminada",
        description: "La dirección ha sido eliminada correctamente",
      })

      // Reload the page to reflect changes
      window.location.reload()
    } catch (error) {
      console.error("Error deleting address:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la dirección",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-start mb-2">
            <div className="space-y-1">
              {isDefault && <Badge className="mb-2">Dirección predeterminada</Badge>}
              <p className="font-medium">{address.address1}</p>
              {address.address2 && <p>{address.address2}</p>}
              <p>
                {address.city}
                {address.province && `, ${address.province}`} {address.zip}
              </p>
              <p>{address.country}</p>
              {address.phone && <p className="text-sm text-muted-foreground">{address.phone}</p>}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" disabled>
              <Pencil className="h-4 w-4 mr-1" />
              Editar
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsDeleteDialogOpen(true)} disabled={isDefault}>
              <Trash2 className="h-4 w-4 mr-1" />
              Eliminar
            </Button>
          </div>
          {!isDefault && (
            <Button variant="ghost" size="sm" onClick={handleSetDefaultAddress} disabled={isSettingDefault}>
              <Check className="h-4 w-4 mr-1" />
              Establecer como predeterminada
            </Button>
          )}
        </CardFooter>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La dirección será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAddress}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
