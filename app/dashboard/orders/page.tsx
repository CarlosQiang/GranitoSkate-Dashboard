import type { Metadata } from "next"
import OrdersClientPage from "./OrdersClientPage"

export const metadata: Metadata = {
  title: "Pedidos | GestionGranito",
  description: "Gestiona los pedidos de tu tienda Shopify",
}

export default function OrdersPage() {
  return <OrdersClientPage />
}
