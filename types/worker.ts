export type WorkerRecord = {
  id: string
  userId?: string
  managerId?: string
  companyId?: string
  yearId?: string
  fullName?: string
  passportNumber?: string
  workPermitNumber?: string
  ciNumber?: string
  typeOfBook?: string
  gender?: "MALE" | "FEMALE" | string
  phone?: string
  type?: "OLD" | "NEW" | string
  total?: number | string
  deposit?: number | string
  balance?: number | string
  renewalDecision?: "UNDECIDED" | "EXTENDED" | "NOT_EXTENDED" | string
  reportDate?: string | null
  workPermitVisaDate?: string | null
  imageUrl?: string | null
  createdAt?: string
  updatedAt?: string
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
