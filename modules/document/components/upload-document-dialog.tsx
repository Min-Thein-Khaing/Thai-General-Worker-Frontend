"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DocumentsPanel } from "./documents-panel"

type UploadDocumentDialogProps = {
  workerId: string | null
  workerName?: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  canManage?: boolean
}

export function UploadDocumentDialog({
  workerId,
  workerName,
  open,
  onOpenChange,
  canManage = true,
}: UploadDocumentDialogProps) {
  if (!workerId) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {canManage ? "Worker Documents & Upload" : "Worker Documents"}
          </DialogTitle>
          <DialogDescription>
            {workerName ? `Managing documents for ${workerName}` : `Worker ID: ${workerId}`}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <DocumentsPanel workerId={workerId} canManage={canManage} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
