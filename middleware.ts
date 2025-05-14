import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  // Archivos estáticos y rutas de API que no requieren verificación
  if (
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/api/auth") ||
    request.nextUrl.pathname.includes(".") ||
    request.nextUrl.pathname === "/api/health"
  ) {
    return NextResponse.next()
  }

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ["/", "/login"]
  if (publicRoutes.includes(request.nextUrl.pathname)) {
    return NextResponse.next()
  }

  // Verificar autenticación para rutas protegidas
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Redirigir a login si no está autenticado
  if (!token && request.nextUrl.pathname.startsWith("/dashboard")) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", encodeURI(request.url))
    return NextResponse.redirect(url)
  }

  // Redirigir a dashboard si está autenticado e intenta acceder a /docs
  if (token && request.nextUrl.pathname.startsWith("/docs")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg).*)"],
}
