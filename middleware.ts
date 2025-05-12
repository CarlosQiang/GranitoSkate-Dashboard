import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Detectar URLs de promociones con formato Shopify gid
  if (pathname.includes("/promociones/gid:")) {
    // Extraer el ID numérico del final de la URL
    const matches = pathname.match(/\/(\d+)$/)
    if (matches && matches[1]) {
      const numericId = matches[1]
      // Redirigir a la ruta correcta usando solo el ID numérico
      return NextResponse.redirect(new URL(`/dashboard/promociones/${numericId}`, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/promociones/:path*"],
}
