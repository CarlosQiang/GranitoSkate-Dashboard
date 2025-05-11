"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Home, Building, Trash2 } from "lucide-react"
import { deleteCustomerAddress, setDefaultCustomerAddress } from "@/lib/api/customers"
import { useToast } from "@/components/ui/use-toast"
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

interface CustomerAddressCardProps {
  address: any
  customerId: string
  isDefault?: boolean
  onUpdate?: () => void
}

export default function CustomerAddressCard({
  address,
  customerId,
  isDefault = false,
  onUpdate,
}: CustomerAddressCardProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSetDefault = async () => {
    if (isDefault) return

    setLoading(true)
    try {
      await setDefaultCustomerAddress(customerId, address.id)
      toast({
        title: "Dirección actualizada",
        description: "La dirección ha sido establecida como predeterminada.",
        variant: "success",
      })
      if (onUpdate) onUpdate()
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo establecer la dirección como predeterminada: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      await deleteCustomerAddress(customerId, address.id)
      toast({
        title: "Dirección eliminada",
        description: "La dirección ha sido eliminada correctamente.",
        variant: "success",
      })
      if (onUpdate) onUpdate()
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo eliminar la dirección: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-[380px]">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {address.alias}
          {isDefault && (
            <Badge variant="secondary">
              <Home className="mr-1 h-4 w-4" />
              Predeterminada
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-[25px_1fr] items-start gap-2">
          <MapPin className="row-start-1 h-4 w-4 text-muted-foreground" />
          <div>
            {address.address1} {address.address2}
          </div>
        </div>
        <div className="grid grid-cols-[25px_1fr] items-start gap-2">
          <Building className="row-start-1 h-4 w-4 text-muted-foreground" />
          <div>
            {address.city}, {address.state} {address.zipCode}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleSetDefault} disabled={loading || isDefault}>
          {isDefault ? "Predeterminada" : "Establecer como predeterminada"}
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={loading}>
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>Esta acción eliminará la dirección permanentemente.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={loading}>
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  )
}
