import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sincronizarTutorialConShopify } from "@/lib/api/tutoriales"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const id = Number.parseInt(params.id)
    await sincronizarTutorialConShopify(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al sincronizar tutorial:", error)
    return NextResponse.json({ error: "Error al sincronizar tutorial con Shopify" }, { status: 500 })
  }
}
