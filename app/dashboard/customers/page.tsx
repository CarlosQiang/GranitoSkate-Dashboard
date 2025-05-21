import CustomersClientPage from "./CustomersClientPage"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Clientes | GestionGranito",
  description: "Gestiona los clientes de tu tienda Shopify",
}

export default function CustomersPage() {
  return <CustomersClientPage />
}
