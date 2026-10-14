export function setAuthCookies(accessToken: string, refreshToken: string) {
  if (typeof document === "undefined") return

  const isProduction = process.env.NODE_ENV === "production"

  document.cookie = `accessToken=${encodeURIComponent(accessToken)}; path=/; max-age=${15 * 60}; sameSite=Lax; ${isProduction ? "Secure; " : ""}`
  document.cookie = `refreshToken=${encodeURIComponent(refreshToken)}; path=/; max-age=${7 * 24 * 60 * 60}; sameSite=Lax; ${isProduction ? "Secure; " : ""}`
}

export function clearAuthCookies() {
  if (typeof document === "undefined") return

  document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; sameSite=Lax"
  document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; sameSite=Lax"
}

export function getCookie(name: string) {
  if (typeof document === "undefined") return null

  const cookieString = document.cookie
  const match = cookieString.match(new RegExp(`(?:^|; )${name}=([^;]*)`))

  return match ? decodeURIComponent(match[1]) : null
}
