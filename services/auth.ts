import { api } from "@/lib/axios"
import type { LoginResponse } from "@/types/auth"

export async function loginWithEmail(email: string, password: string) {
  const response = await api.post<LoginResponse>("/api/auth/login", { email, password })
  return response.data
}

export async function logoutFromApi(accessToken?: string | null) {
  if (!accessToken) return

  await api.post("/api/auth/logout", {}, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

export async function refreshAccessToken(refreshToken: string) {
  const response = await api.post<{ accessToken: string; refreshToken?: string }>(
    "/api/auth/refresh-token",
    {},
    {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    }
  )

  return response.data
}
