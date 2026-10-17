import { api } from "@/lib/axios"
import type {
  AdminResourceListResponse,
  AdminResourceParams,
  AdminResourcePayload,
  AdminResourceRecord,
} from "@/types/admin-resource"

export async function getUsers(params: AdminResourceParams) {
  const response = await api.get<AdminResourceListResponse>("/api/user", { params })
  return response.data
}

export async function getUser(id: string | number) {
  const response = await api.get<AdminResourceRecord>(`/api/user/${id}`)
  return response.data
}

export async function createUser(payload: AdminResourcePayload) {
  const response = await api.post<AdminResourceRecord>("/api/user", payload)
  return response.data
}

export async function updateUser(id: string | number, payload: AdminResourcePayload) {
  const response = await api.patch<AdminResourceRecord>(`/api/user/${id}`, payload)
  return response.data
}

export async function deleteUser(id: string | number) {
  await api.delete(`/api/user/${id}`)
}
