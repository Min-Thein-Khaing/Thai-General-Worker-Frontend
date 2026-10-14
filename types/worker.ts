export type WorkerRecord = {
  id: string
  fullName?: string
  passportNumber?: string
  workPermitNumber?: string
  phone?: string
  reportDate?: string | null
  workPermitVisaDate?: string | null
  total?: number | string
  deposit?: number | string
  balance?: number | string
}

export type PaginationMeta = {
  current_page?: number
  last_page?: number
  per_page?: number
  total?: number
  page?: number
}

export type PaginatedResponse<T> = {
  data: T[]
  links: Record<string, string | null>
  meta: PaginationMeta
}

export type WorkerListParams = {
  page: number
  per_page: number
  search?: string
  sort_by: string
  sort_order: "asc" | "desc"
}

export type FinancialSummary = {
  workerCount: number
  total: number
  deposit: number
  balance: number
}
