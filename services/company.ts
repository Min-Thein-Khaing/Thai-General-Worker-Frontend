import { api } from "@/lib/axios"
import type {
  AdminResourceListResponse,
  AdminResourceParams,
  AdminResourcePayload,
  AdminResourceRecord,
} from "@/types/admin-resource"

export async function getCompanies(params: AdminResourceParams) {
  const response = await api.get<AdminResourceListResponse>("/api/company", { params })
  return response.data
}

export async function getCompany(id: string | number) {
  const response = await api.get<AdminResourceRecord>(`/api/company/${id}`)
  return response.data
}

export async function createCompany(payload: AdminResourcePayload) {
  const response = await api.post<AdminResourceRecord>("/api/company", payload)
  return response.data
}

export async function updateCompany(id: string | number, payload: AdminResourcePayload) {
  const response = await api.patch<AdminResourceRecord>(`/api/company/${id}`, payload)
  return response.data
}

export async function deleteCompany(id: string | number) {
  await api.delete(`/api/company/${id}`)
}
