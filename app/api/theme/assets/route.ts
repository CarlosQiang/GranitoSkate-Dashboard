import { NextResponse } from "next/server"
import {
  saveThemeAsset,
  getThemeAsset,
  deleteThemeAsset,
  createThemeTablesIfNotExist,
} from "@/lib/db/repositories/theme-repository"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"

// Función auxiliar para obtener el shopId
async function getShopId() {
  const session = await getServerSession(authOptions)
  return session?.user?.email || "default-shop"
}

// Función para asegurar que un directorio existe
async function ensureDirectoryExists(directory: string) {
  try {
    await mkdir(directory, { recursive: true })
  } catch (error) {
    console.error(`Error al crear el directorio ${directory}:`, error)
    throw error
  }
}

export async function POST(request: Request) {
  try {
    // Asegurarse de que las tablas existen
    await createThemeTablesIfNotExist()

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
    const fileName = `${uuidv4()}.${fileExtension}`

    // Definir la ruta donde se guardará el archivo
    const uploadDir = path.join(process.cwd(), "public", "uploads", shopId)

    // Asegurarse de que el directorio existe
    await ensureDirectoryExists(uploadDir)

    const filePath = path.join(uploadDir, fileName)

    // Guardar el archivo
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)

    // Guardar la información del asset en la base de datos
    const publicPath = `/uploads/${shopId}/${fileName}`
    const asset = await saveThemeAsset(shopId, assetType, file.name, publicPath, file.type, file.size)

    if (asset) {
      return NextResponse.json({ success: true, asset })
    } else {
      return NextResponse.json({ error: "Error al guardar el asset" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error al procesar el archivo:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
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
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
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
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
