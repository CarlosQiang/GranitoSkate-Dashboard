import type { Metadata } from "next"
import BaseDatosClientPage from "./BaseDatosClientPage"

export const metadata: Metadata = {
  title: "Documentación de Base de Datos - GranitoSkate",
  description: "Documentación completa del sistema de base de datos y API",
}

export default function BaseDatosPage() {
  return <BaseDatosClientPage />
}
