import type { PaginatedResponse } from "@/types/worker"

export type AdminResourceRecord = Record<string, unknown> & {
  id?: string | number
}

export type AdminResourceParams = {
  page: number
  per_page: number
  search?: string
  sort_by?: string
  sort_order?: "asc" | "desc"
}

export type AdminResourceListResponse = PaginatedResponse<AdminResourceRecord>

export type AdminResourcePayload = Record<string, unknown>
