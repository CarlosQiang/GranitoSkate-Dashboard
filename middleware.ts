import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Si el usuario intenta acceder a la ruta raíz, redirigir al dashboard
  if (path === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Si el usuario intenta acceder a rutas protegidas sin estar autenticado
  const isAuthenticated =
    request.cookies.has("next-auth.session-token") || request.cookies.has("__Secure-next-auth.session-token")

  const isAuthPage = path === "/login"

  if (!isAuthenticated && !isAuthPage && path.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
