import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PUBLIC_PATHS = ["/", "/login"]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  const accessToken = request.cookies.get("accessToken")?.value
  const isAuthenticated = Boolean(accessToken)
  const isPublicPath = PUBLIC_PATHS.includes(pathname)

  const protectedResourcePaths = [
    "/workers",
    "/users",
    "/companies",
    "/managers",
    "/years",
    "/documents",
  ]
  const isProtectedPath =
    pathname.startsWith("/dashboard") ||
    protectedResourcePaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))

  if (isProtectedPath) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  if (pathname === "/login" && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  if (pathname === "/" && isPublicPath) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/dashboard/:path*",
    "/workers/:path*",
    "/users/:path*",
    "/companies/:path*",
    "/managers/:path*",
    "/years/:path*",
    "/documents/:path*",
  ],
}
