import type { PaginatedResponse } from "@/types/worker"

export type AdminResourceRecord = Record<string, unknown> & {
  id?: string | number
  fullName?: string | null
  email?: string | null
  name?: string | null
  companyName?: string | null
  userId?: string | number | null
  companyId?: string | number | null
  user?: {
    fullName?: string | null
    name?: string | null
    email?: string | null
  } | null
  company?: {
    companyName?: string | null
    name?: string | null
  } | null
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
