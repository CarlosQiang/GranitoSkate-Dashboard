import { NextResponse } from "next/server"
import { saveThemeAsset, getThemeAsset, deleteThemeAsset } from "@/lib/db/repositories/theme-repository"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// Función auxiliar para obtener el shopId
async function getShopId() {
  try {
    const session = await getServerSession(authOptions)
    return session?.user?.email || "default-shop"
  } catch (error) {
    console.error("Error al obtener la sesión:", error)
    return "default-shop"
  }
}

export async function POST(request: Request) {
  try {
    const shopId = await getShopId()

    // Procesar el formulario multipart
    const formData = await request.formData()
    const file = formData.get("file") as File
    const assetType = formData.get("assetType") as string

    if (!file || !assetType) {
      return NextResponse.json({ error: "Se requiere un archivo y un tipo de asset" }, { status: 400 })
    }

    // Validar el tipo de archivo
    const validTypes = ["image/jpeg", "image/png", "image/svg+xml", "image/gif", "image/webp", "image/x-icon"]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de archivo no válido. Se permiten: JPG, PNG, SVG, GIF, WEBP, ICO" },
        { status: 400 },
      )
    }

    // Validar el tamaño del archivo (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "El archivo es demasiado grande. Máximo 5MB" }, { status: 400 })
    }

    // Crear un nombre de archivo único
    const fileExtension = file.name.split(".").pop()
    const fileName = `${assetType}-${Date.now()}.${fileExtension}`
    const publicPath = `/${fileName}`

    // Convertir el archivo a buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // En un entorno real, aquí guardarías el archivo físicamente
    // Por ahora, simularemos que se guarda correctamente
    console.log(`Archivo ${fileName} guardado en ${publicPath}`)

    // Guardar la información del asset en la base de datos
    const asset = await saveThemeAsset(shopId, assetType, fileName, publicPath, file.type, file.size)

    if (asset) {
      return NextResponse.json({ success: true, asset })
    } else {
      return NextResponse.json({ error: "Error al guardar el asset" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error al procesar el archivo:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud: " + (error as Error).message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const shopId = await getShopId()
    const { searchParams } = new URL(request.url)
    const assetType = searchParams.get("type")

    if (!assetType) {
      return NextResponse.json({ error: "Se requiere un tipo de asset" }, { status: 400 })
    }

    const asset = await getThemeAsset(shopId, assetType)

    if (asset) {
      return NextResponse.json({ asset })
    } else {
      return NextResponse.json({ error: "Asset no encontrado" }, { status: 404 })
    }
  } catch (error) {
    console.error("Error al obtener el asset:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud: " + (error as Error).message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const shopId = await getShopId()
    const { searchParams } = new URL(request.url)
    const assetType = searchParams.get("type")

    if (!assetType) {
      return NextResponse.json({ error: "Se requiere un tipo de asset" }, { status: 400 })
    }

    const success = await deleteThemeAsset(shopId, assetType)

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Error al eliminar el asset" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error al eliminar el asset:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud: " + (error as Error).message }, { status: 500 })
  }
}
