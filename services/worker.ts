import { api } from "@/lib/axios"
import type {
  FinancialSummary,
  PaginatedResponse,
  WorkerListParams,
  WorkerRecord,
} from "@/types/worker"

export async function getWorkers(params: WorkerListParams) {
  const response = await api.get<PaginatedResponse<WorkerRecord>>("/api/worker", { params })
  return response.data
}

export async function getWorker(id: string) {
  const response = await api.get<WorkerRecord & Record<string, unknown>>(`/api/worker/${id}`)
  return response.data
}

export async function getFinancialSummary() {
  const response = await api.get<FinancialSummary>("/api/worker/financial-summary")
  return response.data
}

export async function getReportNotifications() {
  const response = await api.get<WorkerRecord[]>("/api/worker/report-notifications")
  return response.data
}
