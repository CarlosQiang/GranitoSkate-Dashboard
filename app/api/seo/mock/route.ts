import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({ success: true, message: "SEO API mock is working" })
}

export async function POST(request: Request) {
  try {
    // Simular un pequeño retraso para que parezca una operación real
    await new Promise((resolve) => setTimeout(resolve, 500))

    // No necesitamos procesar los datos, simplemente devolvemos éxito
    return NextResponse.json({ success: true, message: "Data saved successfully" })
  } catch (error) {
    console.error("Error in SEO mock API:", error)
    return NextResponse.json({ success: false, message: "Error processing request" }, { status: 500 })
  }
}
