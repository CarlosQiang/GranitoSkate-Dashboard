"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { setDefaultCustomerAddress, deleteCustomerAddress } from "@/lib/api/customers"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Home, Star, Trash2 } from "lucide-react"

interface CustomerAddressCardProps {
  customerId: string
  address: {
    id: string
    address1: string
    address2?: string
    city: string
    province: string
    zip: string
    country: string
    phone?: string
  }
  isDefault?: boolean
  onAddressUpdated: () => void
}

export function CustomerAddressCard({ customerId, address, isDefault, onAddressUpdated }: CustomerAddressCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSetDefault = async () => {
    try {
      setIsLoading(true)
      await setDefaultCustomerAddress(customerId, address.id)
      toast({
        title: "Dirección actualizada",
        description: "La dirección se ha establecido como predeterminada.",
      })
      onAddressUpdated()
    } catch (error) {
      console.error("Error setting default address:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Error al establecer la dirección predeterminada",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsLoading(true)
      await deleteCustomerAddress(address.id)
      toast({
        title: "Dirección eliminada",
        description: "La dirección se ha eliminado correctamente.",
      })
      onAddressUpdated()
    } catch (error) {
      console.error("Error deleting address:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar la dirección",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className={isDefault ? "border-brand" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2">
            <Home className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">{address.address1}</p>
              {address.address2 && <p className="text-sm text-muted-foreground">{address.address2}</p>}
              <p className="text-sm text-muted-foreground">
                {address.city}, {address.province} {address.zip}
              </p>
              <p className="text-sm text-muted-foreground">{address.country}</p>
              {address.phone && <p className="text-sm text-muted-foreground mt-1">{address.phone}</p>}
            </div>
          </div>
          {isDefault && (
            <div className="flex items-center text-brand">
              <Star className="h-4 w-4 mr-1" />
              <span className="text-xs font-medium">Predeterminada</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between p-4 pt-0">
        {!isDefault && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSetDefault}
            disabled={isLoading}
            className="text-brand border-brand hover:bg-brand/10"
          >
            <Star className="h-4 w-4 mr-2" />
            Establecer como predeterminada
          </Button>
        )}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará permanentemente esta dirección de la cuenta del cliente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  )
}
