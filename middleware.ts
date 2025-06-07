import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const token = request.nextauth.token
  const isAuth = !!token
  const pathname = request.nextUrl.pathname

  console.log(`🔍 Middleware: ${pathname}, Auth: ${isAuth}`)

  // Agregar los encabezados CORS a todas las respuestas
  const response = NextResponse.next()
  response.headers.set("Access-Control-Allow-Credentials", "true")
  response.headers.set("Access-Control-Allow-Origin", "*") // Permitir cualquier origen
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  response.headers.set(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
  )

  // Rutas que no requieren autenticación
  const publicPaths = [
    "/",
    "/login",
    "/api/auth/signin",
    "/api/auth/callback",
    "/api/auth/session",
    "/api/auth/providers",
    "/api/auth/csrf",
    "/docs",
    "/health",
  ]

  // Permitir todas las rutas de API de NextAuth
  if (pathname.startsWith("/api/auth/")) {
    return response
  }

  // Permitir rutas públicas
  if (publicPaths.some((path) => pathname === path || pathname.startsWith(path))) {
    return response
  }

  // Si está en login y ya autenticado, redirigir al dashboard
  if (pathname === "/login" && isAuth) {
    console.log("🔄 Redirigiendo usuario autenticado al dashboard")
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Si no está autenticado y trata de acceder a rutas protegidas, redirigir a login
  if (!isAuth && pathname.startsWith("/dashboard")) {
    console.log("🔄 Redirigiendo usuario no autenticado al login")
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)"],
}
