import { api } from "@/lib/axios"
import type {
  AdminResourceListResponse,
  AdminResourceParams,
  AdminResourcePayload,
  AdminResourceRecord,
} from "@/types/admin-resource"

export async function getManagers(params: AdminResourceParams) {
  const response = await api.get<AdminResourceListResponse>("/api/manager", { params })
  return response.data
}

export async function getManager(id: string | number) {
  const response = await api.get<AdminResourceRecord>(`/api/manager/${id}`)
  return response.data
}

export async function createManager(payload: AdminResourcePayload) {
  const response = await api.post<AdminResourceRecord>("/api/manager", payload)
  return response.data
}

export async function updateManager(id: string | number, payload: AdminResourcePayload) {
  const response = await api.patch<AdminResourceRecord>(`/api/manager/${id}`, payload)
  return response.data
}

export async function deleteManager(id: string | number) {
  await api.delete(`/api/manager/${id}`)
}
