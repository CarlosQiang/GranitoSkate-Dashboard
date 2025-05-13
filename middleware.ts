import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  const isAuthPage = request.nextUrl.pathname.startsWith("/login")
  const isPublicPage =
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.startsWith("/docs") ||
    request.nextUrl.pathname.startsWith("/api/health")

  // Si es una página pública, permitir acceso
  if (isPublicPage) {
    return NextResponse.next()
  }

  // Redirigir a login si no hay token y no es una página de autenticación
  if (!token && !isAuthPage) {
    const url = new URL(`/login`, request.url)
    url.searchParams.set("callbackUrl", encodeURI(request.nextUrl.pathname))
    return NextResponse.redirect(url)
  }

  // Redirigir al dashboard si hay token y es una página de autenticación
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
