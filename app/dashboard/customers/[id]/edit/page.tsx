import { fetchCustomerById } from "@/lib/api/customers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface EditCustomerPageProps {
  params: {
    id: string
  }
}

export default async function EditCustomerPage({ params }: EditCustomerPageProps) {
  const customer = await fetchCustomerById(params.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/dashboard/customers/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Volver</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Editar cliente</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del cliente</CardTitle>
          <CardDescription>Actualiza los datos del cliente</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium">
                  Nombre
                </label>
                <input
                  id="firstName"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  defaultValue={customer.firstName}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium">
                  Apellidos
                </label>
                <input
                  id="lastName"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  defaultValue={customer.lastName}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                defaultValue={customer.email}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Teléfono
              </label>
              <input
                id="phone"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                defaultValue={customer.phone}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="note" className="text-sm font-medium">
                Notas
              </label>
              <textarea
                id="note"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                rows={4}
                defaultValue={customer.note}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                Guardar cambios
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
