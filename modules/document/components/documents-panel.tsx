"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Download, File, FileImage, FileText, LoaderCircle, Trash2, UploadCloud } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useWorkerDocuments } from "@/modules/document/hooks/use-worker-documents"
import {
  allowedDocumentExtensions,
  allowedDocumentMimeTypes,
  maximumDocumentFiles,
  type DocumentUploadFile,
  type WorkerDocument,
} from "@/types/document"
import { downloadWorkerDocument } from "@/services/document"

type LocalFile = DocumentUploadFile & { key: string; previewUrl?: string }

type DocumentsPanelProps = {
  workerId: string
  canManage: boolean
}

function documentFields(document: WorkerDocument) {
  return Object.entries(document).filter(([, value]) =>
    value === null || ["string", "number", "boolean"].includes(typeof value)
  )
}

function isAllowedFile(file: File) {
  const extension = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`
  return (
    (allowedDocumentMimeTypes as readonly string[]).includes(file.type) ||
    (allowedDocumentExtensions as readonly string[]).includes(extension)
  )
}

function DocumentThumbnail({ document }: { document: WorkerDocument }) {
  const [imageUrl, setImageUrl] = useState<string | null>(
    (document.url as string) || (document.fileUrl as string) || (document.imageUrl as string) || null
  )
  const [loading, setLoading] = useState(false)

  const fileName = String(document.fileName ?? document.originalName ?? document.name ?? "")
  const mimeType = String(document.mimeType ?? "")
  const isImage = Boolean(
    mimeType.startsWith("image/") ||
    /\.(jpg|jpeg|png|webp|gif)$/i.test(fileName)
  )
  const isPdf = Boolean(
    mimeType === "application/pdf" ||
    /\.pdf$/i.test(fileName)
  )

  useEffect(() => {
    let active = true
    let blobUrl: string | null = null

    if (isImage && !imageUrl && document.id) {
      setLoading(true)
      downloadWorkerDocument(document.id)
        .then((blob) => {
          if (active && blob) {
            blobUrl = URL.createObjectURL(blob)
            setImageUrl(blobUrl)
          }
        })
        .catch(() => {})
        .finally(() => {
          if (active) setLoading(false)
        })
    }

    return () => {
      active = false
      if (blobUrl) URL.revokeObjectURL(blobUrl)
    }
  }, [document.id, isImage, imageUrl])

  if (isImage) {
    if (imageUrl) {
      return (
        <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-border bg-muted/40 shadow-2xs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt={fileName} className="size-full object-cover" />
        </div>
      )
    }
    if (loading) {
      return (
        <div className="flex size-14 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40">
          <LoaderCircle className="size-4 animate-spin text-muted-foreground" />
        </div>
      )
    }
  }

  if (isPdf) {
    return (
      <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-600">
        <FileText className="size-5" />
        <span className="text-[9px] font-bold uppercase tracking-wider">PDF</span>
      </div>
    )
  }

  return (
    <div className="flex size-14 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
      <File className="size-6" />
    </div>
  )
}

export function DocumentsPanel({ workerId, canManage }: DocumentsPanelProps) {
  const { data, error, isLoading, upload, remove } = useWorkerDocuments(workerId)
  const [files, setFiles] = useState<LocalFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | number | null>(null)
  const [documentToDelete, setDocumentToDelete] = useState<WorkerDocument | null>(null)
  const cancelDeleteRef = useRef<HTMLButtonElement>(null)
  const filesRef = useRef(files)

  useEffect(() => {
    filesRef.current = files
  }, [files])

  useEffect(() => {
    return () => filesRef.current.forEach((entry) => {
      if (entry.previewUrl) URL.revokeObjectURL(entry.previewUrl)
    })
  }, [])

  useEffect(() => {
    if (!documentToDelete) return

    cancelDeleteRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDocumentToDelete(null)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [documentToDelete])

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const selected = Array.from(incoming)
    if (!selected.length) return

    setFiles((current) => {
      const remaining = maximumDocumentFiles - current.length
      if (selected.length > remaining) {
        toast.error(`You can upload up to ${maximumDocumentFiles} files at a time.`)
      }

      const accepted: LocalFile[] = []
      selected.slice(0, Math.max(remaining, 0)).forEach((file) => {
        if (!isAllowedFile(file)) {
          toast.error(`${file.name}: choose a PDF, JPEG, PNG, or WebP file.`)
          return
        }

        accepted.push({
          file,
          documentType: "",
          key: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
          previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
        })
      })

      return [...current, ...accepted]
    })
  }, [])

  const updateType = (key: string, documentType: string) => {
    setFiles((current) => current.map((entry) => entry.key === key ? { ...entry, documentType } : entry))
  }

  const removeLocalFile = (key: string) => {
    setFiles((current) => {
      const entry = current.find((file) => file.key === key)
      if (entry?.previewUrl) URL.revokeObjectURL(entry.previewUrl)
      return current.filter((file) => file.key !== key)
    })
  }

  const uploadFiles = async () => {
    if (!workerId.trim()) {
      toast.error("A worker ID is required.")
      return
    }
    if (!files.length) {
      toast.error("Choose at least one file to upload.")
      return
    }
    if (files.some((entry) => !entry.documentType.trim())) {
      toast.error("Enter a document type for each selected file.")
      return
    }

    setIsUploading(true)
    try {
      await upload(files.map(({ file, documentType }) => ({ file, documentType: documentType.trim() })))
      files.forEach((entry) => {
        if (entry.previewUrl) URL.revokeObjectURL(entry.previewUrl)
      })
      setFiles([])
    } catch {
      toast.error("Could not upload documents. Check the file details and try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const downloadFile = async (document: WorkerDocument) => {
    try {
      const blob = await downloadWorkerDocument(document.id)
      const objectUrl = URL.createObjectURL(blob)
      const link = window.document.createElement("a")
      link.href = objectUrl
      link.download = String(document.fileName ?? document.originalName ?? `document-${document.id}`)
      link.click()
      URL.revokeObjectURL(objectUrl)
    } catch {
      toast.error("Could not download this document.")
    }
  }

  const deleteDocument = async (document: WorkerDocument) => {
    setDocumentToDelete(document)
  }

  const confirmDelete = async () => {
    if (!documentToDelete) return
    const document = documentToDelete
    setDeletingId(document.id)
    try {
      await remove(document.id)
    } catch {
      toast.error("Could not delete this document.")
    } finally {
      setDeletingId(null)
      setDocumentToDelete(null)
    }
  }

  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle>Worker documents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {canManage ? (
          <div className="space-y-4">
            <div
              onDragOver={(event) => {
                event.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(event) => {
                event.preventDefault()
                setIsDragging(false)
                addFiles(event.dataTransfer.files)
              }}
              className={`rounded-2xl border-2 border-dashed p-6 text-center transition ${
                isDragging ? "border-primary bg-primary/5" : "border-border bg-muted/20"
              }`}
            >
              <UploadCloud className="mx-auto size-8 text-primary" />
              <p className="mt-3 font-medium">Drop files here or browse</p>
              <p className="mt-1 text-sm text-muted-foreground">PDF, JPEG, PNG, or WebP · up to {maximumDocumentFiles} files</p>
              <Input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                className="mx-auto mt-4 max-w-sm"
                aria-label="Choose document files"
                onChange={(event) => {
                  if (event.currentTarget.files) addFiles(event.currentTarget.files)
                  event.currentTarget.value = ""
                }}
              />
            </div>

            {files.length ? (
              <div className="space-y-3">
                {files.map((entry) => (
                  <div key={entry.key} className="flex flex-col gap-3 rounded-xl border border-border p-3 sm:flex-row sm:items-center">
                    {entry.previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={entry.previewUrl} alt={`Preview of ${entry.file.name}`} className="size-14 rounded-lg object-cover" />
                    ) : entry.file.type === "application/pdf" ? (
                      <FileText className="size-8 text-primary" />
                    ) : (
                      <FileImage className="size-8 text-primary" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{entry.file.name}</p>
                      <p className="text-xs text-muted-foreground">{Math.ceil(entry.file.size / 1024)} KB</p>
                    </div>
                    <label className="flex-1 space-y-1 sm:max-w-xs">
                      <span className="text-xs font-medium text-muted-foreground">Document type</span>
                      <Input
                        value={entry.documentType}
                        onChange={(event) => updateType(entry.key, event.target.value)}
                        placeholder="Enter the backend document type"
                        aria-label={`Document type for ${entry.file.name}`}
                      />
                    </label>
                    <Button type="button" variant="outline" onClick={() => removeLocalFile(entry.key)} aria-label={`Remove ${entry.file.name}`}>
                      Remove
                    </Button>
                  </div>
                ))}
                <Button type="button" disabled={isUploading} onClick={uploadFiles} className="w-full sm:w-auto">
                  {isUploading ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : null}
                  {isUploading ? "Uploading..." : "Upload documents"}
                </Button>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
            Document uploads and deletion are available to administrators.
          </p>
        )}

        {error ? (
          <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {error instanceof Error ? error.message : "Unable to load worker documents."}
          </p>
        ) : isLoading ? (
          <div className="h-20 animate-pulse rounded-xl bg-muted" />
        ) : data?.length ? (
          <div className="space-y-3">
            {data.map((document) => {
              const fields = documentFields(document)
              const name = String(document.fileName ?? document.originalName ?? document.name ?? `Document ${document.id}`)
              const docType = String(document.documentType ?? "")

              return (
                <article key={String(document.id)} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/10 sm:flex-row sm:items-center">
                  <DocumentThumbnail document={document} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-medium text-foreground">{name}</h3>
                      {docType && (
                        <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {docType}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      {fields.filter(([key]) => !["id", "fileName", "originalName", "name", "documentType", "url", "fileUrl", "imageUrl"].includes(key)).slice(0, 4).map(([key, value]) => (
                        <span key={key}>{key}: {typeof value === "string" || typeof value === "number" ? value : String(value ?? "—")}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Button type="button" variant="outline" size="sm" onClick={() => void downloadFile(document)} className="gap-1.5 font-medium shadow-2xs">
                      <Download className="size-4 text-primary" />
                      Download
                    </Button>
                    {canManage ? (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={deletingId === document.id}
                        onClick={() => void deleteDocument(document)}
                        aria-label={`Delete ${name}`}
                        className="size-8 p-0"
                      >
                        {deletingId === document.id ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                      </Button>
                    ) : null}
                  </div>
                </article>
              )
            })}
          </div>
        ) : !error ? (
          <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
            <FileText className="mx-auto size-7 text-muted-foreground" />
            <p className="mt-2 font-medium">No documents yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Documents attached to this worker will appear here.</p>
          </div>
        ) : null}
      </CardContent>
      {documentToDelete ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDocumentToDelete(null)
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-document-title"
            aria-describedby="delete-document-description"
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl"
          >
            <h2 id="delete-document-title" className="text-lg font-semibold">Delete document?</h2>
            <p id="delete-document-description" className="mt-2 text-sm text-muted-foreground">
              This will permanently delete the selected document. This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                ref={cancelDeleteRef}
                type="button"
                variant="outline"
                disabled={deletingId !== null}
                onClick={() => setDocumentToDelete(null)}
              >
                Cancel
              </Button>
              <Button type="button" variant="destructive" disabled={deletingId !== null} onClick={() => void confirmDelete()}>
                {deletingId !== null ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : null}
                Delete document
              </Button>
            </div>
          </section>
        </div>
      ) : null}
    </Card>
  )
}
