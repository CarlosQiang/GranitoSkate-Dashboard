import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  // Archivos estáticos que deben ser accesibles sin autenticación
  const publicFiles = [
    "/favicon.ico",
    "/site.webmanifest",
    "/android-chrome-192x192.png",
    "/android-chrome-512x512.png",
    "/apple-touch-icon.png",
    "/favicon-16x16.png",
    "/favicon-32x32.png",
  ]

  // Comprobar si la ruta es un archivo estático público
  if (publicFiles.some((file) => request.nextUrl.pathname === file)) {
    return NextResponse.next()
  }

  // Rutas públicas que no requieren autenticación
  const publicPaths = ["/login", "/api/auth"]

  // Comprobar si la ruta es pública
  if (publicPaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Comprobar si el usuario está autenticado
  const token = await getToken({ req: request })

  // Si no hay token y la ruta no es pública, redirigir a login
  if (!token && !publicPaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
