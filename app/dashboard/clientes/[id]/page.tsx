import { Suspense } from "react"
import { CustomerForm } from "@/components/customers/customer-form"
import { CustomerFormSkeleton } from "@/components/customers/customer-form-skeleton"

export default function CustomerPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Detalles del Cliente</h1>
        <p className="text-muted-foreground">Información detallada del cliente</p>
      </div>

      <Suspense fallback={<CustomerFormSkeleton />}>
        <CustomerForm customerId={params.id} />
      </Suspense>
    </div>
  )
}
