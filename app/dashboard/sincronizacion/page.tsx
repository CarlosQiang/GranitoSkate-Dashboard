import type { Metadata } from "next"
import SincronizacionClientPage from "./page.client"

export const metadata: Metadata = {
  title: "Sincronización | GestionGranito",
  description: "Gestiona la sincronización de datos con Shopify",
}

export default async function SincronizacionPage() {
  return <SincronizacionClientPage />
}
