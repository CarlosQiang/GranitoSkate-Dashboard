"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { fetchCustomerById } from "@/lib/api/customers"
import { CustomerForm } from "@/components/customer-form"
import { ArrowLeft } from "lucide-react"

export default function EditCustomerPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [customer, setCustomer] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getCustomer = async () => {
      setIsLoading(true)
      try {
        const data = await fetchCustomerById(params.id)
        setCustomer(data)
      } catch (error) {
        console.error("Error fetching customer:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la información del cliente",
          variant: "destructive",
        })
        router.push("/dashboard/customers")
      } finally {
        setIsLoading(false)
      }
    }

    getCustomer()
  }, [params.id, router, toast])

  const handleSuccess = () => {
    toast({
      title: "Cliente actualizado",
      description: "La información del cliente ha sido actualizada correctamente",
    })
    router.push(`/dashboard/customers/${params.id}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar cliente</h1>
          <p className="text-muted-foreground">Actualiza la información del cliente</p>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <CustomerForm
          initialData={{
            id: customer.id,
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            phone: customer.phone,
            note: customer.note,
            acceptsMarketing: customer.acceptsMarketing,
            tags: customer.tags,
          }}
          onSuccess={handleSuccess}
          isEdit={true}
        />
      )}
    </div>
  )
}
