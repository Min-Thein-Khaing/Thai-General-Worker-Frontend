export type UserRole = "ADMIN" | "MANAGER" | "GENERAL_WORKER"

export type AuthUser = {
  id: string
  fullName: string
  email: string
  role: UserRole | string
  imageUrl?: string | null
}

export type LoginResponse = {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

export type RefreshTokenResponse = {
  accessToken: string
  refreshToken?: string
}

export type ApiErrorPayload = {
  message?: string
  errors?: Record<string, string[]>
}
