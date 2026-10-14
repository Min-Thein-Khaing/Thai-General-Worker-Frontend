"use client"

import useSWR from "swr"
import { useSWRConfig } from "swr"
import { toast } from "sonner"

import {
  deleteWorkerDocument,
  getWorkerDocuments,
  uploadWorkerDocuments,
} from "@/services/document"
import type { DocumentUploadFile } from "@/types/document"

export function useWorkerDocuments(workerId: string) {
  const { mutate } = useSWRConfig()
  const key = workerId ? ["worker-documents", workerId] : null
  const query = useSWR(key, () => getWorkerDocuments(workerId), {
    revalidateOnFocus: false,
  })

  const upload = async (files: DocumentUploadFile[]) => {
    await uploadWorkerDocuments(workerId, files)
    await mutate(key)
    toast.success("Documents uploaded")
  }

  const remove = async (documentId: string | number) => {
    await deleteWorkerDocument(documentId)
    await mutate(key)
    toast.success("Document deleted")
  }

  return { ...query, upload, remove }
}
