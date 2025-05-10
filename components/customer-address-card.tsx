"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Home, Star, Trash2 } from "lucide-react"
import { setDefaultCustomerAddress, deleteCustomerAddress } from "@/lib/api/customers"

interface CustomerAddressCardProps {
  customerId: string
  address: {
    id: string
    address1: string
    address2?: string
    city: string
    province: string
    country: string
    zip: string
    isDefault?: boolean
  }
  onAddressUpdated?: () => void
}

export function CustomerAddressCard({ customerId, address, onAddressUpdated }: CustomerAddressCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSetDefault = async () => {
    if (address.isDefault) return

    setIsLoading(true)
    try {
      await setDefaultCustomerAddress(customerId, address.id)
      if (onAddressUpdated) onAddressUpdated()
    } catch (error) {
      console.error("Error al establecer dirección predeterminada:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (address.isDefault) return

    setIsLoading(true)
    try {
      await deleteCustomerAddress(customerId, address.id)
      if (onAddressUpdated) onAddressUpdated()
    } catch (error) {
      console.error("Error al eliminar dirección:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className={`overflow-hidden ${address.isDefault ? "border-primary" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <Home className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <div className="font-medium">
                {address.address1}
                {address.address2 && `, ${address.address2}`}
              </div>
              <div className="text-sm text-muted-foreground">
                {address.city}, {address.province}
              </div>
              <div className="text-sm text-muted-foreground">
                {address.zip}, {address.country}
              </div>
              {address.isDefault && (
                <div className="mt-1 flex items-center text-xs text-primary">
                  <Star className="mr-1 h-3 w-3" />
                  Dirección predeterminada
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {!address.isDefault && (
              <>
                <Button variant="outline" size="icon" onClick={handleSetDefault} disabled={isLoading}>
                  <Star className="h-4 w-4" />
                  <span className="sr-only">Establecer como predeterminada</span>
                </Button>
                <Button variant="outline" size="icon" onClick={handleDelete} disabled={isLoading}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                  <span className="sr-only">Eliminar</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
