"use client"

import { useState } from "react"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DocumentsPanel } from "@/modules/document/components/documents-panel"
import { useWorkers } from "@/modules/worker/hooks/use-workers"
import { useAuthStore } from "@/store/auth-store"

export default function DocumentsPage() {
  const user = useAuthStore((state) => state.user)
  const role = user?.role
  const isWorker = role === "GENERAL_WORKER"

  const [workerId, setWorkerId] = useState("")
  const [selectedWorkerId, setSelectedWorkerId] = useState("")

  const workerListQuery = useWorkers(
    { page: 1, per_page: 5, search: user?.email || user?.fullName || undefined, sort_by: "createdAt", sort_order: "desc" },
    isWorker
  )
  const myWorker = workerListQuery.data?.data?.find((w) => w.userId === user?.id) ?? workerListQuery.data?.data?.[0]
  const activeWorkerId = isWorker ? (myWorker?.id ?? "") : selectedWorkerId

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-muted-foreground">{isWorker ? "My Files" : "Worker files"}</p>
        <h2 className="text-2xl font-semibold">{isWorker ? "My Documents" : "Documents"}</h2>
      </div>

      {!isWorker ? (
        <form
          className="flex max-w-xl gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            setSelectedWorkerId(workerId.trim())
          }}
        >
          <Input
            value={workerId}
            onChange={(event) => setWorkerId(event.target.value)}
            placeholder="Enter a worker ID"
            aria-label="Worker ID"
            required
          />
          <Button type="submit">
            <Search className="mr-2 size-4" />
            Find
          </Button>
        </form>
      ) : null}

      {activeWorkerId ? (
        <DocumentsPanel workerId={activeWorkerId} canManage={role === "ADMIN"} />
      ) : isWorker && workerListQuery.isLoading ? (
        <div className="h-48 animate-pulse rounded-2xl bg-muted" />
      ) : (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          {isWorker
            ? "No worker record linked to this account yet."
            : "Enter a worker ID to view its documents."}
        </div>
      )}
    </div>
  )
}

