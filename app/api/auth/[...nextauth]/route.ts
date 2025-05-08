// Archivo simplificado para evitar dependencias de next-auth
import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({ message: "Auth API temporalmente deshabilitada" }, { status: 200 })
}

export async function POST() {
  return NextResponse.json({ message: "Auth API temporalmente deshabilitada" }, { status: 200 })
}
