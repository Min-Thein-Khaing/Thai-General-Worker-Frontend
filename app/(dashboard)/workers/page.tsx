"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Edit2,
  FilePlus,
  FileSpreadsheet,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UsersRound,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { UploadDocumentDialog } from "@/modules/document/components/upload-document-dialog"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useWorkers } from "@/modules/worker/hooks/use-workers"
import { createWorker, updateWorker, deleteWorker } from "@/services/worker"
import { useAuthStore } from "@/store/auth-store"
import type { WorkerRecord } from "@/types/worker"

const PAGE_SIZE_OPTIONS = [10, 20, 40, 50, 100]

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return "Unable to load workers. Please try again."
}

function displayValue(value: string | number | null | undefined) {
  return value === null || value === undefined || value === "" ? "—" : String(value)
}

function formatCurrency(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return "—"
  return new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(Number(value))
}

const sortableColumns = [
  ["passportNumber", "Passport"],
  ["workPermitNumber", "Work Permit"],
  ["phone", "Phone"],
  ["reportDate", "Report Date"],
  ["workPermitVisaDate", "Visa Date"],
  ["total", "Total"],
  ["deposit", "Deposit"],
  ["balance", "Balance"],
] as const

function WorkersContent() {
  const role = useAuthStore((state) => state.user?.role ?? "GENERAL_WORKER")
  const currentUser = useAuthStore((state) => state.user)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const page = Math.max(1, Number(searchParams.get("page") ?? 1))
  const perPageParam = Number(searchParams.get("per_page") ?? 10)
  const perPage = PAGE_SIZE_OPTIONS.includes(perPageParam) ? perPageParam : 10
  const sortBy = searchParams.get("sort_by") ?? "createdAt"
  const sortOrder: "asc" | "desc" = searchParams.get("sort_order") === "asc" ? "asc" : "desc"

  const [search, setSearch] = useState(searchParams.get("search") ?? "")
  const [debouncedSearch, setDebouncedSearch] = useState(search)

  const [editorOpen, setEditorOpen] = useState(false)
  const [editingWorker, setEditingWorker] = useState<WorkerRecord | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState("")

  const [deletingWorker, setDeletingWorker] = useState<WorkerRecord | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [selectedWorkerForDoc, setSelectedWorkerForDoc] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(search.trim()), 400)
    return () => window.clearTimeout(timeout)
  }, [search])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (debouncedSearch) params.set("search", debouncedSearch)
    else params.delete("search")
    params.delete("page")
    const query = params.toString()
    const currentSearch = searchParams.get("search") ?? ""
    const currentPage = searchParams.get("page") ?? "1"
    if (currentSearch !== debouncedSearch || currentPage !== "1") {
      router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false })
    }
  }, [debouncedSearch, pathname, router, searchParams])

  const params = useMemo(
    () => ({
      page,
      per_page: perPage,
      search: debouncedSearch || undefined,
      sort_by: sortBy,
      sort_order: sortOrder,
    }),
    [page, perPage, debouncedSearch, sortBy, sortOrder]
  )

  const canViewWorkers = role === "ADMIN" || role === "MANAGER"
  const { data, error, isLoading, mutate } = useWorkers(params, canViewWorkers)
  const currentPage = data?.meta?.current_page ?? data?.meta?.page ?? page
  const lastPage = data?.meta?.last_page
  const totalWorkers = data?.meta?.total
  const canGoNext = lastPage !== undefined ? currentPage < lastPage : (data?.data.length ?? 0) === perPage

  const navigateWithParams = (updates: Record<string, string | null>) => {
    const q = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) q.delete(key)
      else q.set(key, value)
    })
    const serialized = q.toString()
    router.push(`${pathname}${serialized ? `?${serialized}` : ""}`, { scroll: false })
  }

  const handlePerPageChange = (newPerPage: number) => {
    navigateWithParams({ per_page: String(newPerPage), page: "1" })
  }

  const handleSort = (column: string) => {
    const nextOrder = sortBy === column && sortOrder === "asc" ? "desc" : "asc"
    navigateWithParams({ sort_by: column, sort_order: nextOrder, page: "1" })
  }

  const openCreate = () => {
    setEditingWorker(null)
    setFormData({
      userId: currentUser?.id ?? "",
      managerId: "",
      companyId: "",
      yearId: "",
      passportNumber: "",
      workPermitNumber: "",
      ciNumber: "",
      typeOfBook: "PJ",
      gender: "MALE",
      phone: "",
      total: 0,
      deposit: 0,
      renewalDecision: "UNDECIDED",
      workPermitVisaDate: "",
      reportDate: "",
    })
    setFormError("")
    setEditorOpen(true)
  }

  const openEdit = (worker: WorkerRecord) => {
    setEditingWorker(worker)
    setFormData({
      userId: worker.userId ?? currentUser?.id ?? "",
      managerId: worker.managerId ?? "",
      companyId: worker.companyId ?? "",
      yearId: worker.yearId ?? "",
      passportNumber: worker.passportNumber ?? "",
      workPermitNumber: worker.workPermitNumber ?? "",
      ciNumber: worker.ciNumber ?? "",
      typeOfBook: worker.typeOfBook ?? "PJ",
      gender: worker.gender ?? "MALE",
      phone: worker.phone ?? "",
      total: worker.total ?? 0,
      deposit: worker.deposit ?? 0,
      renewalDecision: worker.renewalDecision ?? "UNDECIDED",
      workPermitVisaDate: worker.workPermitVisaDate ? String(worker.workPermitVisaDate).split("T")[0] : "",
      reportDate: worker.reportDate ? String(worker.reportDate).split("T")[0] : "",
    })
    setFormError("")
    setEditorOpen(true)
  }

  const handleFormChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const saveWorker = async () => {
    setSaving(true)
    setFormError("")
    try {
      const payload: Record<string, any> = { ...formData }
      if (payload.total !== undefined) payload.total = Number(payload.total)
      if (payload.deposit !== undefined) payload.deposit = Number(payload.deposit)
      if (!payload.workPermitVisaDate) delete payload.workPermitVisaDate
      if (!payload.reportDate) delete payload.reportDate

      if (editingWorker?.id) {
        await updateWorker(editingWorker.id, payload)
        toast.success("Worker updated successfully")
      } else {
        await createWorker(payload)
        toast.success("Worker created successfully")
      }
      setEditorOpen(false)
      mutate()
    } catch (err: any) {
      setFormError(err.response?.data?.message ?? err.message ?? "Failed to save worker record.")
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deletingWorker?.id) return
    setDeleting(true)
    setFormError("")
    try {
      await deleteWorker(deletingWorker.id)
      toast.success("Worker deleted successfully")
      setDeletingWorker(null)
      mutate()
    } catch (err: any) {
      setFormError(err.response?.data?.message ?? err.message ?? "Failed to delete worker record.")
    } finally {
      setDeleting(false)
    }
  }

  if (!canViewWorkers) {
    return (
      <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">
        Worker directory access is available to administrators and managers.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Workers</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage worker work permits, visas, reporting dates, and financial records.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => mutate()}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          {role === "ADMIN" && (
            <Button type="button" onClick={openCreate} className="gap-2 shadow-sm">
              <Plus className="size-4" />
              Add Worker
            </Button>
          )}
        </div>
      </div>

      {/* Search & Page Size Filter Card */}
      <Card className="border-border/70 shadow-xs">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search workers by passport, permit, phone..."
                className="pl-9 pr-9"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <label htmlFor="per-page-worker" className="text-xs font-medium text-muted-foreground">
                Rows per page:
              </label>
              <select
                id="per-page-worker"
                value={perPage}
                onChange={(e) => handlePerPageChange(Number(e.target.value))}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Banner */}
      {error && (
        <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {getErrorMessage(error)}
        </div>
      )}

      {/* Workers Table Card */}
      <Card className="border-border/70 shadow-xs">
        <CardContent className="p-0">
          {isLoading && (!data || data.data.length === 0) ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 w-full animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : data?.data && data.data.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden overflow-x-auto lg:block">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold text-foreground">Worker</TableHead>
                      {sortableColumns.map(([key, label]) => (
                        <TableHead key={key} className="font-semibold text-foreground">
                          <button
                            type="button"
                            onClick={() => handleSort(key)}
                            className="inline-flex items-center gap-1.5 hover:text-primary focus:outline-none"
                          >
                            <span>{label}</span>
                            {sortBy === key ? (
                              sortOrder === "asc" ? <ArrowUp className="size-3.5 text-primary" /> : <ArrowDown className="size-3.5 text-primary" />
                            ) : (
                              <ArrowUpDown className="size-3.5 opacity-40" />
                            )}
                          </button>
                        </TableHead>
                      ))}
                      {role === "ADMIN" && (
                        <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.data.map((worker) => (
                      <TableRow key={worker.id} className="hover:bg-muted/30">
                        <TableCell>
                          <Link
                            className="font-medium text-primary underline-offset-4 hover:underline"
                            href={`/dashboard/workers/${encodeURIComponent(worker.id)}`}
                          >
                            {worker.fullName ?? worker.passportNumber ?? `Worker ${worker.id.slice(0, 8)}`}
                          </Link>
                          {worker.gender && (
                            <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
                              {worker.gender}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{displayValue(worker.passportNumber)}</TableCell>
                        <TableCell>{displayValue(worker.workPermitNumber)}</TableCell>
                        <TableCell>{displayValue(worker.phone)}</TableCell>
                        <TableCell>{displayValue(worker.reportDate)}</TableCell>
                        <TableCell>{displayValue(worker.workPermitVisaDate)}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(worker.total)}</TableCell>
                        <TableCell className="text-emerald-600">{formatCurrency(worker.deposit)}</TableCell>
                        <TableCell className="font-semibold text-primary">{formatCurrency(worker.balance)}</TableCell>

                        {role === "ADMIN" && (
                          <TableCell className="space-x-1.5 text-right">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedWorkerForDoc({ id: worker.id, name: worker.fullName ?? worker.passportNumber ?? `Worker ${worker.id.slice(0, 8)}` })}
                              className="h-8 gap-1 px-2.5 text-xs text-primary hover:text-primary"
                            >
                              <FilePlus className="size-3.5" />
                              Document
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => openEdit(worker)}
                              className="h-8 gap-1 px-2.5 text-xs"
                            >
                              <Edit2 className="size-3.5" />
                              Edit
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => setDeletingWorker(worker)}
                              className="h-8 px-2.5 text-xs"
                            >
                              <Trash2 className="size-3.5" />
                              Delete
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="space-y-3 p-4 lg:hidden">
                {data.data.map((worker) => (
                  <article key={worker.id} className="rounded-xl border border-border bg-card p-4 shadow-2xs">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          href={`/dashboard/workers/${encodeURIComponent(worker.id)}`}
                          className="font-semibold text-primary hover:underline"
                        >
                          {worker.fullName ?? worker.passportNumber ?? `Worker ${worker.id.slice(0, 8)}`}
                        </Link>
                        <p className="text-xs text-muted-foreground">Passport: {displayValue(worker.passportNumber)}</p>
                      </div>
                      {role === "ADMIN" && (
                        <div className="flex flex-wrap gap-1.5">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedWorkerForDoc({ id: worker.id, name: worker.fullName ?? worker.passportNumber ?? `Worker ${worker.id.slice(0, 8)}` })}
                            className="h-8 gap-1 px-2 text-xs text-primary"
                          >
                            <FilePlus className="size-3.5" />
                            Document
                          </Button>
                          <Button type="button" size="sm" variant="outline" onClick={() => openEdit(worker)} className="h-8 px-2 text-xs">
                            Edit
                          </Button>
                          <Button type="button" size="sm" variant="destructive" onClick={() => setDeletingWorker(worker)} className="h-8 px-2 text-xs">
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border/50 pt-3 text-xs">
                      <div>
                        <span className="text-muted-foreground">Permit No:</span> {displayValue(worker.workPermitNumber)}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Phone:</span> {displayValue(worker.phone)}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Visa Date:</span> {displayValue(worker.workPermitVisaDate)}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Report Date:</span> {displayValue(worker.reportDate)}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Deposit:</span> {formatCurrency(worker.deposit)}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Balance:</span> {formatCurrency(worker.balance)}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : !error ? (
            <div className="px-4 py-16 text-center">
              <UsersRound className="mx-auto size-10 text-muted-foreground/60" />
              <h3 className="mt-3 font-semibold text-foreground">No workers found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a different search query or add a new worker.
              </p>
              {role === "ADMIN" && (
                <Button type="button" onClick={openCreate} className="mt-4 gap-2">
                  <Plus className="size-4" />
                  Add Worker
                </Button>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Pagination Footer */}
      <div className="flex flex-col items-center justify-between gap-4 py-2 sm:flex-row">
        <p className="text-xs text-muted-foreground sm:text-sm">
          Showing page <span className="font-semibold text-foreground">{currentPage}</span>
          {lastPage ? <> of <span className="font-semibold text-foreground">{lastPage}</span></> : ""}
          {totalWorkers !== undefined ? <> · <span className="font-semibold text-foreground">{totalWorkers}</span> total workers</> : ""}
          <span className="ml-2 text-xs opacity-75">({perPage} items per page)</span>
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1 || isLoading}
            onClick={() => navigateWithParams({ page: currentPage > 2 ? String(currentPage - 1) : null })}
            className="gap-1.5"
          >
            <ChevronLeft className="size-4" />
            Previous
          </Button>
          <div className="flex items-center gap-1 px-1 text-sm font-medium">
            Page {currentPage}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={!canGoNext || isLoading}
            onClick={() => navigateWithParams({ page: String(currentPage + 1) })}
            className="gap-1.5"
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Worker Create / Edit Modal Dialog */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingWorker ? "Edit Worker Record" : "Register New Worker"}</DialogTitle>
            <DialogDescription>
              {editingWorker ? "Update worker identification, permit dates, and payments." : "Enter worker details and assign to company & manager."}
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">User ID (Worker Login ID) *</label>
              <Input
                value={formData.userId ?? ""}
                onChange={(e) => handleFormChange("userId", e.target.value)}
                placeholder="User UUID"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Company ID *</label>
              <Input
                value={formData.companyId ?? ""}
                onChange={(e) => handleFormChange("companyId", e.target.value)}
                placeholder="Company UUID"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Manager ID *</label>
              <Input
                value={formData.managerId ?? ""}
                onChange={(e) => handleFormChange("managerId", e.target.value)}
                placeholder="Manager UUID"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Year ID (Contract/Batch) *</label>
              <Input
                value={formData.yearId ?? ""}
                onChange={(e) => handleFormChange("yearId", e.target.value)}
                placeholder="Year UUID"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Passport Number</label>
              <Input
                value={formData.passportNumber ?? ""}
                onChange={(e) => handleFormChange("passportNumber", e.target.value)}
                placeholder="e.g. MD123456"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Work Permit Number</label>
              <Input
                value={formData.workPermitNumber ?? ""}
                onChange={(e) => handleFormChange("workPermitNumber", e.target.value)}
                placeholder="e.g. WP-98765432"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">CI Number (Certificate of Identity)</label>
              <Input
                value={formData.ciNumber ?? ""}
                onChange={(e) => handleFormChange("ciNumber", e.target.value)}
                placeholder="e.g. CI-445566"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Type of Book</label>
              <Input
                value={formData.typeOfBook ?? ""}
                onChange={(e) => handleFormChange("typeOfBook", e.target.value)}
                placeholder="e.g. PJ or PV"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Gender *</label>
              <select
                value={formData.gender ?? "MALE"}
                onChange={(e) => handleFormChange("gender", e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Phone</label>
              <Input
                value={formData.phone ?? ""}
                onChange={(e) => handleFormChange("phone", e.target.value)}
                placeholder="+66 82 345 6789"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Work Permit Visa Expiry Date</label>
              <Input
                type="date"
                value={formData.workPermitVisaDate ?? ""}
                onChange={(e) => handleFormChange("workPermitVisaDate", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">90-Day Report Date</label>
              <Input
                type="date"
                value={formData.reportDate ?? ""}
                onChange={(e) => handleFormChange("reportDate", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Total Fee (THB)</label>
              <Input
                type="number"
                min="0"
                value={formData.total ?? 0}
                onChange={(e) => handleFormChange("total", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Deposit Paid (THB)</label>
              <Input
                type="number"
                min="0"
                value={formData.deposit ?? 0}
                onChange={(e) => handleFormChange("deposit", e.target.value)}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-foreground">Renewal Decision</label>
              <select
                value={formData.renewalDecision ?? "UNDECIDED"}
                onChange={(e) => handleFormChange("renewalDecision", e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="UNDECIDED">Undecided</option>
                <option value="EXTENDED">Extended</option>
                <option value="NOT_EXTENDED">Not Extended</option>
              </select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => setEditorOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={saving}
              onClick={saveWorker}
              className="gap-2"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              {saving ? "Saving..." : "Save Worker"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deletingWorker} onOpenChange={(open) => !open && setDeletingWorker(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Delete worker {deletingWorker?.fullName ?? deletingWorker?.passportNumber ?? deletingWorker?.id}?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this worker record? All associated document references may be affected.
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              {formError}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={deleting}
              onClick={() => setDeletingWorker(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={confirmDelete}
              className="gap-2"
            >
              {deleting ? <Loader2 className="size-4 animate-spin" /> : null}
              {deleting ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Document Modal */}
      <UploadDocumentDialog
        workerId={selectedWorkerForDoc?.id ?? null}
        workerName={selectedWorkerForDoc?.name}
        open={Boolean(selectedWorkerForDoc)}
        onOpenChange={(open) => !open && setSelectedWorkerForDoc(null)}
        canManage={role === "ADMIN"}
      />
    </div>
  )
}

export default function WorkersPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-muted" />}>
      <WorkersContent />
    </Suspense>
  )
}
