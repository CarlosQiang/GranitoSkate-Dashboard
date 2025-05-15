import { NextResponse } from "next/server"
import { checkExistingAdmins } from "@/lib/auth-service"

export async function GET() {
  try {
    const { count, admins } = await checkExistingAdmins()

    if (count > 0) {
      return NextResponse.json({
        success: true,
        message: `Se encontraron ${count} administradores en la base de datos.`,
        admins: admins,
      })
    } else {
      return NextResponse.json({
        success: false,
        message: "No se encontraron administradores en la base de datos.",
        admins: [],
      })
    }
  } catch (error) {
    console.error("Error al verificar administradores:", error)
    return NextResponse.json(
      { success: false, message: "Error al verificar administradores", error: String(error) },
      { status: 500 },
    )
  }
}
