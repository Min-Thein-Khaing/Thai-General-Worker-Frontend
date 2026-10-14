import { api } from "@/lib/axios"
import type { DocumentListResponse, DocumentUploadFile } from "@/types/document"

export async function getWorkerDocuments(workerId: string) {
  const response = await api.get<DocumentListResponse>(`/api/documents/worker/${encodeURIComponent(workerId)}`)
  return Array.isArray(response.data) ? response.data : response.data.data
}

export async function uploadWorkerDocuments(workerId: string, entries: DocumentUploadFile[]) {
  const formData = new FormData()
  formData.append("workerId", workerId)

  for (const entry of entries) {
    formData.append("files", entry.file)
    formData.append("documentTypes", entry.documentType)
  }

  const response = await api.post("/api/documents/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return response.data
}

export async function downloadWorkerDocument(documentId: string | number) {
  const response = await api.get<Blob>(`/api/documents/${encodeURIComponent(String(documentId))}/download`, {
    responseType: "blob",
  })
  return response.data
}

export async function deleteWorkerDocument(documentId: string | number) {
  await api.delete(`/api/documents/${encodeURIComponent(String(documentId))}`)
}
