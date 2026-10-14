export type WorkerDocument = Record<string, unknown> & {
  id: string | number
}

export type DocumentListResponse = WorkerDocument[] | { data: WorkerDocument[] }

export type DocumentUploadFile = {
  file: File
  documentType: string
}

export const allowedDocumentMimeTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const

export const allowedDocumentExtensions = [".pdf", ".jpg", ".jpeg", ".png", ".webp"] as const
export const maximumDocumentFiles = 10
