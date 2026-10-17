"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Edit2,
  FileSpreadsheet,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react"

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
import { useAuthStore } from "@/store/auth-store"
import type { AdminResourceName } from "@/modules/admin-resources/hooks/use-admin-resource-list"
import { useCompanies } from "@/modules/company/hooks/use-companies"
import { useCompanyMutations } from "@/modules/company/hooks/use-company-mutations"
import { useManagers } from "@/modules/manager/hooks/use-managers"
import { useManagerMutations } from "@/modules/manager/hooks/use-manager-mutations"
import { useYears } from "@/modules/year/hooks/use-years"
import { useYearMutations } from "@/modules/year/hooks/use-year-mutations"
import { useUsers } from "@/modules/user/hooks/use-users"
import { useUserMutations } from "@/modules/user/hooks/use-user-mutations"
import type { AdminResourceRecord } from "@/types/admin-resource"

const PAGE_SIZE_OPTIONS = [10, 20, 40, 50, 100]
const EMPTY_ROWS: AdminResourceRecord[] = []

type AdminResourceListProps = {
  resource: AdminResourceName
  title: string
  description: string
}

function formatCell(
  key: string,
  value: unknown,
  row?: AdminResourceRecord,
  userMap?: Map<string, string>,
  companyMap?: Map<string, string>
) {
  if (key === "user" || key === "managerName") {
    return (
      row?.user?.fullName ??
      (row?.userId ? userMap?.get(String(row.userId)) : undefined) ??
      (value ? String(value) : "—")
    )
  }
  if (key === "company" || key === "companyName") {
    return (
      row?.company?.companyName ??
      (row?.companyId ? companyMap?.get(String(row.companyId)) : undefined) ??
      (value ? String(value) : "—")
    )
  }
  if (value === null || value === undefined || value === "") return "—"
  if (typeof value === "boolean") {
    return value ? (
      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600">Yes</span>
    ) : (
      <span className="inline-flex items-center rounded-full bg-neutral-500/10 px-2 py-0.5 text-xs font-medium text-neutral-500">No</span>
    )
  }
  if (key.toLowerCase().includes("date") || key === "createdAt" || key === "updatedAt") {
    const d = new Date(String(value))
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    }
  }
  if (key === "role") {
    return (
      <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
        {String(value)}
      </span>
    )
  }
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}

function recordLabel(record: AdminResourceRecord, userMap?: Map<string, string>) {
  if (record.userId && userMap?.has(String(record.userId))) {
    return userMap.get(String(record.userId))!
  }
  return String(record.companyName ?? record.fullName ?? record.name ?? record.email ?? record.id ?? "Record")
}

function ResourceListContent({ resource, title, description }: AdminResourceListProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const page = Math.max(1, Number(searchParams.get("page") ?? 1))
  const perPageParam = Number(searchParams.get("per_page") ?? 10)
  const perPage = PAGE_SIZE_OPTIONS.includes(perPageParam) ? perPageParam : 10
  const sortBy = searchParams.get("sort_by") ?? ""
  const sortOrder: "asc" | "desc" = searchParams.get("sort_order") === "asc" ? "asc" : "desc"

  const [search, setSearch] = useState(searchParams.get("search") ?? "")
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<AdminResourceRecord | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [payloadError, setPayloadError] = useState("")
  const [saving, setSaving] = useState(false)
  const [deletingRecord, setDeletingRecord] = useState<AdminResourceRecord | null>(null)
  const [deleting, setDeleting] = useState(false)

  const currentUser = useAuthStore((state) => state.user)
  const role = currentUser?.role

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
    if (
      (searchParams.get("search") ?? "") !== debouncedSearch ||
      (searchParams.get("page") ?? "1") !== "1"
    ) {
      router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false })
    }
  }, [debouncedSearch, pathname, router, searchParams])

  const query = useMemo(
    () => ({
      page,
      per_page: perPage,
      search: debouncedSearch || undefined,
      sort_by: sortBy || undefined,
      sort_order: sortBy ? sortOrder : undefined,
    }),
    [page, perPage, debouncedSearch, sortBy, sortOrder]
  )

  const companies = useCompanies(query, role === "ADMIN" && resource === "companies")
  const managers = useManagers(query, role === "ADMIN" && resource === "managers")
  const years = useYears(query, role === "ADMIN" && resource === "years")
  const users = useUsers(query, role === "ADMIN" && resource === "users")

  // For manager creation & name lookup
  const allUsers = useUsers(
    { page: 1, per_page: 100, sort_by: "fullName", sort_order: "asc" },
    role === "ADMIN" && (resource === "managers" || resource === "companies" || resource === "years")
  )
  const allCompanies = useCompanies(
    { page: 1, per_page: 100, sort_by: "companyName", sort_order: "asc" },
    role === "ADMIN" && resource === "managers"
  )

  const userMap = useMemo(() => {
    const map = new Map<string, string>()
    allUsers.data?.data?.forEach((u) => {
      map.set(String(u.id), String(u.fullName ?? u.name ?? u.email))
    })
    return map
  }, [allUsers.data?.data])

  const companyMap = useMemo(() => {
    const map = new Map<string, string>()
    allCompanies.data?.data?.forEach((c) => {
      map.set(String(c.id), String(c.companyName ?? c.name ?? `Company ${c.id}`))
    })
    return map
  }, [allCompanies.data?.data])

  const activeList =
    resource === "companies"
      ? companies
      : resource === "managers"
      ? managers
      : resource === "years"
      ? years
      : users

  const companyMutations = useCompanyMutations()
  const managerMutations = useManagerMutations()
  const yearMutations = useYearMutations()
  const userMutations = useUserMutations()

  const crud =
    resource === "companies"
      ? companyMutations
      : resource === "managers"
      ? managerMutations
      : resource === "years"
      ? yearMutations
      : userMutations

  const { data, error, isLoading, mutate } = activeList
  const currentPage = data?.meta?.current_page ?? data?.meta?.page ?? page
  const lastPage = data?.meta?.last_page
  const totalRecords = data?.meta?.total
  const rows = data?.data ?? EMPTY_ROWS

  const columns = useMemo(() => {
    if (resource === "companies") {
      return ["companyName", "address", "phone", "contactEmail", "createdAt"]
    }
    if (resource === "years") {
      return ["startYear", "endYear", "createdAt"]
    }
    if (resource === "managers") {
      return ["user", "company", "gender", "phone", "createdAt"]
    }
    if (resource === "users") {
      return ["fullName", "email", "role", "createdAt"]
    }
    const keys = new Set<string>()
    rows.forEach((row) =>
      Object.keys(row).forEach((key) => {
        if (!["password", "refreshToken"].includes(key)) keys.add(key)
      })
    )
    return [...keys]
  }, [resource, rows])

  const canGoNext = lastPage !== undefined ? currentPage < lastPage : rows.length === perPage

  const navigateWithParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) params.delete(key)
      else params.set(key, value)
    })
    const queryString = params.toString()
    router.push(`${pathname}${queryString ? `?${queryString}` : ""}`, { scroll: false })
  }

  const handlePerPageChange = (newPerPage: number) => {
    navigateWithParams({ per_page: String(newPerPage), page: "1" })
  }

  const handleSort = (column: string) => {
    const nextOrder = sortBy === column && sortOrder === "asc" ? "desc" : "asc"
    navigateWithParams({ sort_by: column, sort_order: nextOrder, page: "1" })
  }

  const openCreate = () => {
    setEditingRecord(null)
    const initial: Record<string, any> = {}
    if (resource === "companies") {
      initial.companyName = ""
      initial.address = ""
      initial.phone = ""
      initial.contactEmail = ""
      initial.userId = currentUser?.id ?? ""
    } else if (resource === "years") {
      initial.startYear = new Date().toISOString().split("T")[0]
      initial.endYear = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split("T")[0]
      initial.userId = currentUser?.id ?? ""
    } else if (resource === "managers") {
      initial.companyId = ""
      initial.userId = currentUser?.id ?? ""
      initial.gender = "MALE"
      initial.phone = ""
    } else if (resource === "users") {
      initial.fullName = ""
      initial.email = ""
      initial.password = ""
      initial.role = "GENERAL_WORKER"
    }
    setFormData(initial)
    setPayloadError("")
    setEditorOpen(true)
  }

  const openEdit = (record: AdminResourceRecord) => {
    setEditingRecord(record)
    const sanitized = { ...record }
    delete sanitized.password
    delete sanitized.refreshToken
    setFormData(sanitized)
    setPayloadError("")
    setEditorOpen(true)
  }

  const handleFormChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const saveRecord = async () => {
    setSaving(true)
    setPayloadError("")
    try {
      const payload: Record<string, any> = { ...formData }

      delete payload.id
      delete payload.createdAt
      delete payload.updatedAt

      if (editingRecord?.id) {
        if (resource === "users" && !payload.password) {
          delete payload.password
        }
        await crud.update(editingRecord.id, payload)
      } else {
        await crud.create(payload)
      }
      setEditorOpen(false)
      mutate()
    } catch (err: any) {
      setPayloadError(err.response?.data?.message ?? err.message ?? "Failed to save record.")
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deletingRecord?.id) return
    setDeleting(true)
    setPayloadError("")
    try {
      await crud.remove(deletingRecord.id)
      setDeletingRecord(null)
      mutate()
    } catch (err: any) {
      setPayloadError(err.response?.data?.message ?? err.message ?? "Failed to delete record.")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
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
          <Button
            type="button"
            onClick={openCreate}
            className="gap-2 shadow-sm"
          >
            <Plus className="size-4" />
            Add {title.slice(0, -1)}
          </Button>
        </div>
      </div>

      {/* Filter and Page Size Bar */}
      <Card className="border-border/70 shadow-xs">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${title.toLowerCase()}...`}
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
              <label htmlFor="per-page-select" className="text-xs font-medium text-muted-foreground">
                Rows per page:
              </label>
              <select
                id="per-page-select"
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

      {/* Error state */}
      {error && (
        <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load data."}
        </div>
      )}

      {/* Main Table */}
      <Card className="border-border/70 shadow-xs">
        <CardContent className="p-0">
          {isLoading && rows.length === 0 ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 w-full animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : rows.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      {columns.map((col) => (
                        <TableHead key={col} className="font-semibold text-foreground">
                          <button
                            type="button"
                            onClick={() => handleSort(col)}
                            className="inline-flex items-center gap-1.5 hover:text-primary focus:outline-none"
                          >
                            <span className="capitalize">{col.replace(/([A-Z])/g, " $1")}</span>
                            {sortBy === col ? (
                              sortOrder === "asc" ? <ArrowUp className="size-3.5 text-primary" /> : <ArrowDown className="size-3.5 text-primary" />
                            ) : (
                              <ArrowUpDown className="size-3.5 opacity-40" />
                            )}
                          </button>
                        </TableHead>
                      ))}
                      <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row, idx) => (
                      <TableRow key={String(row.id ?? idx)} className="hover:bg-muted/30">
                        {columns.map((col) => (
                          <TableCell key={col} className="max-w-xs truncate text-sm">
                            {formatCell(col, row[col], row, userMap, companyMap)}
                          </TableCell>
                        ))}
                        <TableCell className="space-x-1.5 text-right">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => openEdit(row)}
                            className="h-8 gap-1 px-2.5 text-xs"
                          >
                            <Edit2 className="size-3.5" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeletingRecord(row)}
                            className="h-8 px-2.5 text-xs"
                          >
                            <Trash2 className="size-3.5" />
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="space-y-3 p-4 md:hidden">
                {rows.map((row, idx) => (
                  <article key={String(row.id ?? idx)} className="rounded-xl border border-border bg-card p-4 shadow-2xs">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-foreground">{recordLabel(row, userMap)}</h4>
                      <div className="flex gap-1.5">
                        <Button type="button" size="sm" variant="outline" onClick={() => openEdit(row)}>
                          Edit
                        </Button>
                        <Button type="button" size="sm" variant="destructive" onClick={() => setDeletingRecord(row)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                    <dl className="mt-3 grid grid-cols-1 gap-2 border-t border-border/50 pt-3 text-sm">
                      {columns.map((col) => (
                        <div key={col} className="flex justify-between gap-2">
                          <dt className="text-xs font-medium text-muted-foreground capitalize">{col.replace(/([A-Z])/g, " $1")}:</dt>
                          <dd className="truncate text-right">{formatCell(col, row[col], row, userMap, companyMap)}</dd>
                        </div>
                      ))}
                    </dl>
                  </article>
                ))}
              </div>
            </>
          ) : !error ? (
            <div className="px-4 py-16 text-center">
              <FileSpreadsheet className="mx-auto size-10 text-muted-foreground/60" />
              <h3 className="mt-3 font-semibold text-foreground">No {title.toLowerCase()} found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Get started by clicking &quot;Add {title.slice(0, -1)}&quot; or try a different search.
              </p>
              <Button type="button" onClick={openCreate} className="mt-4 gap-2">
                <Plus className="size-4" />
                Add {title.slice(0, -1)}
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Pagination Footer */}
      <div className="flex flex-col items-center justify-between gap-4 py-2 sm:flex-row">
        <p className="text-xs text-muted-foreground sm:text-sm">
          Showing page <span className="font-semibold text-foreground">{currentPage}</span>
          {lastPage ? <> of <span className="font-semibold text-foreground">{lastPage}</span></> : ""}
          {totalRecords !== undefined ? <> · <span className="font-semibold text-foreground">{totalRecords}</span> total records</> : ""}
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

      {/* Create / Edit Dialog */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingRecord ? `Edit ${title.slice(0, -1)}` : `Create New ${title.slice(0, -1)}`}
            </DialogTitle>
            <DialogDescription>
              {editingRecord ? "Update record details." : "Fill out the fields to add a new record to the system."}
            </DialogDescription>
          </DialogHeader>

          {payloadError && (
            <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              {payloadError}
            </div>
          )}

          <div className="space-y-4 py-2">
            <div className="grid gap-4">
              {/* Specific form fields per model */}
              {resource === "companies" && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Company Name *</label>
                    <Input
                      value={formData.companyName ?? ""}
                      onChange={(e) => handleFormChange("companyName", e.target.value)}
                      placeholder="e.g. Siam Logistics Co., Ltd."
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">User ID (Owner) *</label>
                    <Input
                      value={formData.userId ?? ""}
                      onChange={(e) => handleFormChange("userId", e.target.value)}
                      placeholder="UUID of associated user"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Address</label>
                    <Input
                      value={formData.address ?? ""}
                      onChange={(e) => handleFormChange("address", e.target.value)}
                      placeholder="Bangkok, Thailand"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Phone</label>
                      <Input
                        value={formData.phone ?? ""}
                        onChange={(e) => handleFormChange("phone", e.target.value)}
                        placeholder="+66 81 234 5678"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Contact Email</label>
                      <Input
                        type="email"
                        value={formData.contactEmail ?? ""}
                        onChange={(e) => handleFormChange("contactEmail", e.target.value)}
                        placeholder="hr@company.co.th"
                      />
                    </div>
                  </div>
                </>
              )}

              {resource === "years" && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">User ID (Owner) *</label>
                    <Input
                      value={formData.userId ?? ""}
                      onChange={(e) => handleFormChange("userId", e.target.value)}
                      placeholder="User UUID"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Start Year / Date *</label>
                      <Input
                        type="date"
                        value={formData.startYear ? String(formData.startYear).split("T")[0] : ""}
                        onChange={(e) => handleFormChange("startYear", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">End Year / Date *</label>
                      <Input
                        type="date"
                        value={formData.endYear ? String(formData.endYear).split("T")[0] : ""}
                        onChange={(e) => handleFormChange("endYear", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {resource === "managers" && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">User Name (Manager Account) *</label>
                    <select
                      value={formData.userId ?? ""}
                      onChange={(e) => handleFormChange("userId", e.target.value)}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      required
                    >
                      <option value="">-- Select a User --</option>
                      {allUsers.data?.data?.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.fullName || u.email} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Company Name *</label>
                    <select
                      value={formData.companyId ?? ""}
                      onChange={(e) => handleFormChange("companyId", e.target.value)}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      required
                    >
                      <option value="">-- Select a Company --</option>
                      {allCompanies.data?.data?.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.companyName || `Company ${c.id}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Gender</label>
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
                        placeholder="+66 89 000 1122"
                      />
                    </div>
                  </div>
                </>
              )}

              {resource === "users" && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Full Name *</label>
                    <Input
                      value={formData.fullName ?? ""}
                      onChange={(e) => handleFormChange("fullName", e.target.value)}
                      placeholder="Ko Min Thein"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Email Address *</label>
                    <Input
                      type="email"
                      value={formData.email ?? ""}
                      onChange={(e) => handleFormChange("email", e.target.value)}
                      placeholder="worker@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Password {editingRecord ? "(Leave blank to keep unchanged)" : "*"}
                    </label>
                    <Input
                      type="password"
                      value={formData.password ?? ""}
                      onChange={(e) => handleFormChange("password", e.target.value)}
                      placeholder="••••••••"
                      required={!editingRecord}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Role</label>
                    <select
                      value={formData.role ?? "GENERAL_WORKER"}
                      onChange={(e) => handleFormChange("role", e.target.value)}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="GENERAL_WORKER">General Worker</option>
                      <option value="MANAGER">Manager</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                </>
              )}
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
              onClick={saveRecord}
              className="gap-2"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              {saving ? "Saving..." : "Save Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingRecord} onOpenChange={(open) => !open && setDeletingRecord(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete {recordLabel(deletingRecord ?? {})}?</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {payloadError && (
            <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              {payloadError}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={deleting}
              onClick={() => setDeletingRecord(null)}
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
    </div>
  )
}

export function AdminResourceList(props: AdminResourceListProps) {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-muted" />}>
      <ResourceListContent {...props} />
    </Suspense>
  )
}
