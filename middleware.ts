import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// Configuración para Next-Auth
const authConfig = {
  pages: {
    signIn: "/login",
  },
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Manejar CORS para rutas API
  if (pathname.startsWith("/api/")) {
    // Manejar preflight requests
    if (request.method === "OPTIONS") {
      return NextResponse.json(
        {},
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, X-CSRF-Token",
            "Access-Control-Max-Age": "86400",
          },
        },
      )
    }

    // Configurar headers CORS para todas las respuestas API
    const response = NextResponse.next()
    response.headers.set("Access-Control-Allow-Origin", "*")
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-CSRF-Token")

    return response
  }

  // Proteger rutas del dashboard
  if (pathname.startsWith("/dashboard")) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

    // Redirigir a login si no hay token
    if (!token) {
      const url = new URL("/login", request.url)
      url.searchParams.set("callbackUrl", encodeURI(request.url))
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

// Configurar en qué rutas se ejecuta el middleware
export const config = {
  matcher: [
    // Rutas API
    "/api/:path*",
    // Rutas protegidas
    "/dashboard/:path*",
  ],
}
