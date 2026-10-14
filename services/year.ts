import { api } from "@/lib/axios"
import type {
  AdminResourceListResponse,
  AdminResourceParams,
  AdminResourcePayload,
  AdminResourceRecord,
} from "@/types/admin-resource"

export async function getYears(params: AdminResourceParams) {
  const response = await api.get<AdminResourceListResponse>("/api/year", { params })
  return response.data
}

export async function getYear(id: string | number) {
  const response = await api.get<AdminResourceRecord>(`/api/year/${id}`)
  return response.data
}

export async function createYear(payload: AdminResourcePayload) {
  const response = await api.post<AdminResourceRecord>("/api/year", payload)
  return response.data
}

export async function updateYear(id: string | number, payload: AdminResourcePayload) {
  const response = await api.patch<AdminResourceRecord>(`/api/year/${id}`, payload)
  return response.data
}

export async function deleteYear(id: string | number) {
  await api.delete(`/api/year/${id}`)
}
