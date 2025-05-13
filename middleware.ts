import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ["/login", "/", "/docs"]
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))

  // Rutas de API que no requieren verificación de autenticación
  const isApiAuthRoute = pathname.startsWith("/api/auth")

  // Si es una ruta pública o de autenticación, permitir acceso
  if (isPublicRoute || isApiAuthRoute) {
    return NextResponse.next()
  }

  // Verificar token de autenticación
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Si no hay token y no es una ruta pública, redirigir a login
  if (!token) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", encodeURI(request.url))
    return NextResponse.redirect(url)
  }

  // Si hay token, permitir acceso
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto:
     * 1. /api/auth (rutas de NextAuth.js)
     * 2. /_next (archivos estáticos de Next.js)
     * 3. /favicon.ico, /sitemap.xml, /robots.txt (archivos estáticos comunes)
     */
    "/((?!_next/static|_next/image|favicon.ico|site.webmanifest|android-chrome-192x192.png|android-chrome-512x512.png|apple-touch-icon.png|favicon-16x16.png|favicon-32x32.png).*)",
  ],
}
