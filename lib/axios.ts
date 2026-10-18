import axios, { AxiosError, InternalAxiosRequestConfig } from "axios"
import { toast } from "sonner"

import { clearAuthCookies, setAuthCookies } from "@/lib/cookies"
import { useAuthStore } from "@/store/auth-store"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
})

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

type QueuedRequest = {
  resolve: (token: string) => void
  reject: (reason?: unknown) => void
}

let isRefreshing = false
let failedQueue: QueuedRequest[] = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((request) => {
    if (error) {
      request.reject(error)
    } else if (token) {
      request.resolve(token)
    } else {
      request.reject(new Error("Token refresh completed without an access token"))
    }
  })

  failedQueue = []
}

async function refreshRequest(refreshToken: string) {
  return api.post<{ accessToken: string; refreshToken?: string }>(
    "/api/auth/refresh-token",
    {},
    {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    }
  )
}

async function logoutRequest(accessToken?: string | null) {
  if (!accessToken) return

  await api.post(
    "/api/auth/logout",
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )
}

const clearSession = () => {
  useAuthStore.getState().clearAuth()
  clearAuthCookies()

  if (typeof window !== "undefined") {
    window.location.href = "/login"
  }

  toast.error("Session expired. Please sign in again.")
}

api.interceptors.request.use((config) => {
  const isRefreshRequest = config.url?.includes("/api/auth/refresh-token")
  const token = useAuthStore.getState().accessToken

  if (!isRefreshRequest && token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined
    const requestUrl = originalRequest?.url ?? ""
    const isRefreshRequest = requestUrl.includes("/api/auth/refresh-token")
    const isLoginRequest = requestUrl.includes("/api/auth/login")

    if (error.response?.status === 401 && isRefreshRequest) {
      return Promise.reject(error)
    }

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !isLoginRequest &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        originalRequest._retry = true

        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = useAuthStore.getState().refreshToken

        if (!refreshToken) {
          clearSession()
          return Promise.reject(error)
        }

        const response = await refreshRequest(refreshToken)
        const refreshedToken = response.data.accessToken

        if (!refreshedToken) {
          throw new Error("Token refresh response did not include an access token")
        }

        const refreshedRefreshToken = response.data.refreshToken ?? refreshToken
        const currentUser = useAuthStore.getState().user

        useAuthStore.getState().setAuth({
          accessToken: refreshedToken,
          refreshToken: refreshedRefreshToken,
          user: currentUser,
        })
        setAuthCookies(refreshedToken, refreshedRefreshToken)

        processQueue(null, refreshedToken)

        originalRequest.headers.Authorization = `Bearer ${refreshedToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError)
        clearSession()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export { api }

export async function logoutAndRedirect() {
  const store = useAuthStore.getState()

  try {
    await logoutRequest(store.accessToken)
  } catch {
    // Ignore logout API failures and clear state locally.
  }

  store.clearAuth()
  clearAuthCookies()

  if (typeof window !== "undefined") {
    window.location.href = "/login"
  }
}
