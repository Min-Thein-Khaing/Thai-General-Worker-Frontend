"use client"

import { useState } from "react"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DocumentsPanel } from "@/modules/document/components/documents-panel"
import { useAuthStore } from "@/store/auth-store"

export default function DocumentsPage() {
  const role = useAuthStore((state) => state.user?.role)
  const [workerId, setWorkerId] = useState("")
  const [selectedWorkerId, setSelectedWorkerId] = useState("")

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-muted-foreground">Worker files</p>
        <h2 className="text-2xl font-semibold">Documents</h2>
      </div>
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
      {selectedWorkerId ? (
        <DocumentsPanel workerId={selectedWorkerId} canManage={role === "ADMIN"} />
      ) : (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Enter a worker ID to view its documents.
        </div>
      )}
    </div>
  )
}
