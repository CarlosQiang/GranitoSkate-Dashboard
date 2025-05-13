import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ["/", "/login", "/docs"]
  if (publicRoutes.some((route) => pathname === route)) {
    return NextResponse.next()
  }

  // Rutas de API que no requieren verificación de middleware
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  // Verificar token de autenticación
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Si no hay token y la ruta no es pública, redirigir al login
  if (!token && !publicRoutes.includes(pathname)) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", encodeURI(request.url))
    return NextResponse.redirect(url)
  }

  // Verificar acceso a rutas de administrador
  if (pathname.startsWith("/dashboard/administradores") && token?.role !== "superadmin") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
