import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/neon"
import { productos } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const result = await db.select().from(productos).where(eq(productos.id, id)).limit(1)

    if (result.length === 0) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ producto: result[0] })
  } catch (error) {
    console.error("Error al obtener producto:", error)
    return NextResponse.json(
      {
        error: "Error al obtener producto",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const body = await req.json()

    // Verificar si el producto existe
    const existingProduct = await db.select().from(productos).where(eq(productos.id, id)).limit(1)

    if (existingProduct.length === 0) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    // Actualizar producto
    const [result] = await db
      .update(productos)
      .set({
        nombre: body.nombre !== undefined ? body.nombre : existingProduct[0].nombre,
        descripcion: body.descripcion !== undefined ? body.descripcion : existingProduct[0].descripcion,
        precio: body.precio !== undefined ? body.precio : existingProduct[0].precio,
        sku: body.sku !== undefined ? body.sku : existingProduct[0].sku,
        inventario: body.inventario !== undefined ? body.inventario : existingProduct[0].inventario,
        imagen_url: body.imagen_url !== undefined ? body.imagen_url : existingProduct[0].imagen_url,
        activo: body.activo !== undefined ? body.activo : existingProduct[0].activo,
        meta_titulo: body.meta_titulo !== undefined ? body.meta_titulo : existingProduct[0].meta_titulo,
        meta_descripcion:
          body.meta_descripcion !== undefined ? body.meta_descripcion : existingProduct[0].meta_descripcion,
        meta_keywords: body.meta_keywords !== undefined ? body.meta_keywords : existingProduct[0].meta_keywords,
        ultima_actualizacion: new Date(),
      })
      .where(eq(productos.id, id))
      .returning()

    return NextResponse.json({ success: true, producto: result })
  } catch (error) {
    console.error("Error al actualizar producto:", error)
    return NextResponse.json(
      {
        error: "Error al actualizar producto",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    // Verificar si el producto existe
    const existingProduct = await db.select().from(productos).where(eq(productos.id, id)).limit(1)

    if (existingProduct.length === 0) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    // Eliminar producto
    await db.delete(productos).where(eq(productos.id, id))

    return NextResponse.json({ success: true, message: "Producto eliminado correctamente" })
  } catch (error) {
    console.error("Error al eliminar producto:", error)
    return NextResponse.json(
      {
        error: "Error al eliminar producto",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
