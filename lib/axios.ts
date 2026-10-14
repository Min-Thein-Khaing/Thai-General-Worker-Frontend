import axios from "axios"
import { toast } from "sonner"

import { clearAuthCookies } from "@/lib/cookies"
import { useAuthStore } from "@/store/auth-store"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
})

let isRefreshing = false
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: unknown) => void }> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error)
      return
    }

    promise.resolve(token)
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
  const token = useAuthStore.getState().accessToken

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => api(originalRequest))
          .catch((queueError) => Promise.reject(queueError))
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

        useAuthStore.getState().setAuth({
          accessToken: refreshedToken,
          refreshToken: response.data.refreshToken ?? refreshToken,
          user: useAuthStore.getState().user,
        })

        processQueue(null, refreshedToken)

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${refreshedToken}`
        }

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
    // ignore logout API failures and clear state locally
  }

  store.clearAuth()
  clearAuthCookies()

  if (typeof window !== "undefined") {
    window.location.href = "/login"
  }
}
