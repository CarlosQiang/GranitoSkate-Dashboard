import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const id = params.id
    if (!id) {
      return NextResponse.json({ error: "ID de promoción no proporcionado" }, { status: 400 })
    }

    // Obtener promoción de la base de datos local
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/db/promociones/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Promoción no encontrada" }, { status: 404 })
      }
      throw new Error(`Error obteniendo promoción: ${response.status}`)
    }

    const promocion = await response.json()
    return NextResponse.json(promocion)
  } catch (error) {
    console.error("Error obteniendo promoción:", error)
    return NextResponse.json({ error: "Error al obtener promoción", details: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const id = params.id
    if (!id) {
      return NextResponse.json({ error: "ID de promoción no proporcionado" }, { status: 400 })
    }

    const data = await request.json()

    // Actualizar promoción en la base de datos local
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/db/promociones/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Error actualizando promoción: ${response.status}`)
    }

    const promocion = await response.json()
    return NextResponse.json({
      success: true,
      data: promocion,
      message: "Promoción actualizada correctamente",
    })
  } catch (error) {
    console.error("Error actualizando promoción:", error)
    return NextResponse.json({ error: "Error al actualizar promoción", details: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const id = params.id
    if (!id) {
      return NextResponse.json({ error: "ID de promoción no proporcionado" }, { status: 400 })
    }

    // Eliminar promoción de la base de datos local
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/db/promociones/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Error eliminando promoción: ${response.status}`)
    }

    return NextResponse.json({
      success: true,
      message: "Promoción eliminada correctamente",
    })
  } catch (error) {
    console.error("Error eliminando promoción:", error)
    return NextResponse.json({ error: "Error al eliminar promoción", details: error.message }, { status: 500 })
  }
}
