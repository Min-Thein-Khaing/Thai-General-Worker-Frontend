"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, BriefcaseBusiness } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DocumentsPanel } from "@/modules/document/components/documents-panel"
import { useWorker } from "@/modules/worker/hooks/use-worker"
import { useAuthStore } from "@/store/auth-store"

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "—"
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }
  return "—"
}

export default function WorkerDetailPage() {
  const params = useParams<{ id: string }>()
  const workerId = params.id
  const role = useAuthStore((state) => state.user?.role)
  const { data: worker, error, isLoading } = useWorker(workerId)
  const canManageDocuments = role === "ADMIN"

  return (
    <div className="space-y-5">
      <Link href="/dashboard/workers">
        <Button variant="outline">
          <ArrowLeft className="mr-2 size-4" />
          Back to workers
        </Button>
      </Link>

      {error ? (
        <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error instanceof Error ? error.message : "Unable to load this worker."}
        </div>
      ) : isLoading ? (
        <div className="h-48 animate-pulse rounded-2xl bg-muted" />
      ) : worker ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BriefcaseBusiness className="size-5 text-primary" />
              {String(worker.fullName ?? worker.passportNumber ?? `Worker ${workerId}`)}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(worker)
              .filter(([key]) => key !== "image")
              .map(([key, value]) => (
                <div key={key} className="rounded-xl bg-muted/40 p-3">
                  <p className="text-xs capitalize text-muted-foreground">{key.replace(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`)}</p>
                  <p className="mt-1 break-words text-sm font-medium">{displayValue(value)}</p>
                </div>
              ))}
          </CardContent>
        </Card>
      ) : null}

      <DocumentsPanel workerId={workerId} canManage={canManageDocuments} />
    </div>
  )
}
