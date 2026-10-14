"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { setAuthCookies } from "@/lib/cookies"
import { loginWithEmail } from "@/services/auth"
import { useAuthStore } from "@/store/auth-store"
import type { ApiErrorPayload } from "@/types/auth"

import { loginSchema, type LoginFormValues } from "@/modules/auth/schemas/login-schema"

export function useLoginForm() {
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const data = await loginWithEmail(values.email, values.password)

      setAuth({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      })
      setAuthCookies(data.accessToken, data.refreshToken)

      toast.success("Login successful")
      router.push("/dashboard")
      router.refresh()
    } catch (error: unknown) {
      const maybeApiError = error as {
        response?: {
          data?: ApiErrorPayload
        }
      }

      const serverMessage = maybeApiError.response?.data?.message
      const fieldErrors = maybeApiError.response?.data?.errors ?? {}

      if (serverMessage) {
        toast.error(serverMessage)
      }

      Object.entries(fieldErrors).forEach(([field, messages]) => {
        if (field in form.getValues()) {
          form.setError(field as keyof LoginFormValues, {
            type: "server",
            message: messages[0],
          })
        }
      })

      if (!serverMessage && !Object.keys(fieldErrors).length) {
        toast.error("Unable to log in. Please try again.")
      }
    }
  }

  return {
    form,
    onSubmit,
  }
}
