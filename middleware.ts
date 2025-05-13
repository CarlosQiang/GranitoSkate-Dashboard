import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Páginas públicas que no requieren autenticación
  const publicPages = ["/", "/login", "/docs"]

  // Verificar si la página actual es pública
  const isPublicPage = publicPages.some((page) => pathname === page || pathname.startsWith("/api/auth"))

  // Si es una página pública, permitir el acceso
  if (isPublicPage) {
    return NextResponse.next()
  }

  // Verificar si el usuario está autenticado
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Si no hay token, redirigir al login
  if (!token) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", encodeURI(request.url))
    return NextResponse.redirect(url)
  }

  // Verificar acceso a rutas protegidas por rol
  if (pathname.startsWith("/dashboard/administradores") && token.role !== "superadmin") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Permitir el acceso
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/auth/* (authentication routes)
     * 2. /_next/* (Next.js internals)
     * 3. /fonts/* (static assets)
     * 4. /favicon.ico, /site.webmanifest (static assets)
     */
    "/((?!_next|fonts|favicon.ico|site.webmanifest).*)",
  ],
}
