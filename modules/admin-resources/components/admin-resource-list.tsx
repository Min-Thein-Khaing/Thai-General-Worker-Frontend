"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ArrowDown, ArrowUp, ArrowUpDown, Plus, Search, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuthStore } from "@/store/auth-store"
import type { AdminResourceName } from "@/modules/admin-resources/hooks/use-admin-resource-list"
import { useCompanies } from "@/modules/company/hooks/use-companies"
import { useCompanyMutations } from "@/modules/company/hooks/use-company-mutations"
import { useManagers } from "@/modules/manager/hooks/use-managers"
import { useManagerMutations } from "@/modules/manager/hooks/use-manager-mutations"
import { useYears } from "@/modules/year/hooks/use-years"
import { useYearMutations } from "@/modules/year/hooks/use-year-mutations"
import type { AdminResourceRecord } from "@/types/admin-resource"

const PAGE_SIZE = 10
const EMPTY_ROWS: AdminResourceRecord[] = []

type AdminResourceListProps = {
  resource: AdminResourceName
  title: string
  description: string
}

function formatCell(value: unknown) {
  if (value === null || value === undefined || value === "") return "—"
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }
  return JSON.stringify(value)
}

function recordLabel(record: AdminResourceRecord) {
  return String(record.name ?? record.fullName ?? record.title ?? record.id ?? "Record")
}

function ResourceListContent({ resource, title, description }: AdminResourceListProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const page = Math.max(1, Number(searchParams.get("page") ?? 1))
  const sortBy = searchParams.get("sort_by") ?? ""
  const sortOrder: "asc" | "desc" = searchParams.get("sort_order") === "asc" ? "asc" : "desc"
  const [search, setSearch] = useState(searchParams.get("search") ?? "")
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<AdminResourceRecord | null>(null)
  const [payloadText, setPayloadText] = useState("{\n  \n}")
  const [payloadError, setPayloadError] = useState("")
  const [saving, setSaving] = useState(false)
  const [deletingRecord, setDeletingRecord] = useState<AdminResourceRecord | null>(null)
  const [deleting, setDeleting] = useState(false)
  const role = useAuthStore((state) => state.user?.role)

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
      per_page: PAGE_SIZE,
      search: debouncedSearch || undefined,
      sort_by: sortBy || undefined,
      sort_order: sortBy ? sortOrder : undefined,
    }),
    [page, debouncedSearch, sortBy, sortOrder]
  )
  const companies = useCompanies(query, role === "ADMIN" && resource === "companies")
  const managers = useManagers(query, role === "ADMIN" && resource === "managers")
  const years = useYears(query, role === "ADMIN" && resource === "years")
  const activeList = resource === "companies" ? companies : resource === "managers" ? managers : years
  const companyMutations = useCompanyMutations()
  const managerMutations = useManagerMutations()
  const yearMutations = useYearMutations()
  const crud = resource === "companies"
    ? companyMutations
    : resource === "managers"
      ? managerMutations
      : yearMutations
  const { data, error, isLoading } = activeList
  const currentPage = data?.meta.current_page ?? data?.meta.page ?? page
  const lastPage = data?.meta.last_page
  const rows = data?.data ?? EMPTY_ROWS
  const columns = useMemo(() => {
    const keys = new Set<string>()
    rows.forEach((row) => Object.keys(row).forEach((key) => keys.add(key)))
    return [...keys]
  }, [rows])
  const canGoNext = lastPage !== undefined ? currentPage < lastPage : rows.length === PAGE_SIZE

  const navigateWithParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) params.delete(key)
      else params.set(key, value)
    })
    const queryString = params.toString()
    router.push(`${pathname}${queryString ? `?${queryString}` : ""}`, { scroll: false })
  }

  const toggleSort = (column: string) => {
    const nextOrder = sortBy === column && sortOrder === "asc" ? "desc" : "asc"
    navigateWithParams({ sort_by: column, sort_order: nextOrder, page: null })
  }

  const openCreate = () => {
    setEditingRecord(null)
    setPayloadText("{\n  \n}")
    setPayloadError("")
    setEditorOpen(true)
  }

  const openEdit = (record: AdminResourceRecord) => {
    setEditingRecord(record)
    setPayloadText(JSON.stringify(record, null, 2))
    setPayloadError("")
    setEditorOpen(true)
  }

  const saveRecord = async () => {
    let parsed: unknown
    try {
      parsed = JSON.parse(payloadText)
      if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
        setPayloadError("Enter a JSON object.")
        return
      }
    } catch {
      setPayloadError("Enter valid JSON.")
      return
    }

    setSaving(true)
    setPayloadError("")
    try {
      if (editingRecord) {
        if (editingRecord.id === undefined) {
          setPayloadError("This record has no id, so it cannot be updated.")
          return
        }
        await crud.update(editingRecord.id, parsed as Record<string, unknown>)
      } else {
        await crud.create(parsed as Record<string, unknown>)
      }
      setEditorOpen(false)
    } catch (saveError) {
      setPayloadError(saveError instanceof Error ? saveError.message : "Could not save this record.")
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (deletingRecord?.id === undefined) return
    setDeleting(true)
    try {
      await crud.remove(deletingRecord.id)
      setDeletingRecord(null)
    } catch {
      setPayloadError("Could not delete this record.")
    } finally {
      setDeleting(false)
    }
  }

  if (role !== "ADMIN") {
    return (
      <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">
        Administrator access is required to manage {title.toLowerCase()}.
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-muted-foreground">Administration</p>
          <h2 className="text-2xl font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative block w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Search ${title.toLowerCase()}...`}
              className="pl-9"
              aria-label={`Search ${title.toLowerCase()}`}
            />
          </label>
          <Button type="button" onClick={openCreate}>
            <Plus className="mr-2 size-4" />
            Add {title.slice(0, -1)}
          </Button>
        </div>
      </div>

      {error ? (
        <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error instanceof Error ? error.message : `Unable to load ${title.toLowerCase()}.`}
        </div>
      ) : null}

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="h-12 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : rows.length ? (
            <>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columns.map((column) => (
                        <TableHead key={column}>
                          <button
                            type="button"
                            onClick={() => toggleSort(column)}
                            className="inline-flex items-center gap-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {column}
                            {sortBy === column ? (
                              sortOrder === "asc" ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />
                            ) : (
                              <ArrowUpDown className="size-3.5 opacity-50" />
                            )}
                          </button>
                        </TableHead>
                      ))}
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row, index) => (
                      <TableRow key={String(row.id ?? index)}>
                        {columns.map((column) => (
                          <TableCell key={column} className="max-w-xs truncate">
                            {formatCell(row[column])}
                          </TableCell>
                        ))}
                        <TableCell className="space-x-2 text-right">
                          <Button type="button" size="sm" variant="outline" onClick={() => openEdit(row)}>Edit</Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            disabled={row.id === undefined}
                            aria-label={`Delete ${recordLabel(row)}`}
                            onClick={() => setDeletingRecord(row)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={columns.length + 1} className="text-xs text-muted-foreground">
                        Create and edit use a JSON payload because the API field schemas are not documented in AGENTS.md.
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              <div className="space-y-3 md:hidden">
                {rows.map((row, index) => (
                  <article key={String(row.id ?? index)} className="rounded-xl border border-border p-4">
                    <h3 className="mb-3 font-semibold">{recordLabel(row)}</h3>
                    <dl className="grid grid-cols-1 gap-2">
                      {columns.filter((column) => column !== "id").map((column) => (
                        <div key={column} className="flex justify-between gap-3 text-sm">
                          <dt className="text-muted-foreground">{column}</dt>
                          <dd className="max-w-[60%] truncate text-right">{formatCell(row[column])}</dd>
                        </div>
                      ))}
                    </dl>
                    <div className="mt-4 flex gap-2">
                      <Button type="button" size="sm" variant="outline" onClick={() => openEdit(row)}>Edit</Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        disabled={row.id === undefined}
                        onClick={() => setDeletingRecord(row)}
                      >
                        <Trash2 className="mr-2 size-4" />
                        Delete
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : !error ? (
            <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center">
              <p className="font-medium">No {title.toLowerCase()} found</p>
              <p className="mt-1 text-sm text-muted-foreground">Try a different search term or check back later.</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {currentPage}{lastPage ? ` of ${lastPage}` : ""}
          {data?.meta.total !== undefined ? ` · ${data.meta.total} records` : ""}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={currentPage <= 1 || isLoading}
            onClick={() => navigateWithParams({ page: currentPage > 2 ? String(currentPage - 1) : null })}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={!canGoNext || isLoading}
            onClick={() => navigateWithParams({ page: String(currentPage + 1) })}
          >
            Next
          </Button>
        </div>

        {editorOpen ? (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" role="presentation">
            <section role="dialog" aria-modal="true" aria-labelledby="resource-editor-title" className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-xl">
              <h3 id="resource-editor-title" className="text-lg font-semibold">
                {editingRecord ? `Edit ${title.slice(0, -1)}` : `Add ${title.slice(0, -1)}`}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter the fields expected by the backend as a JSON object.
              </p>
              <textarea
                value={payloadText}
                onChange={(event) => setPayloadText(event.target.value)}
                spellCheck={false}
                aria-label={`${title.slice(0, -1)} JSON payload`}
                className="mt-4 min-h-64 w-full rounded-lg border border-input bg-background p-3 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              {payloadError ? <p role="alert" className="mt-2 text-sm text-destructive">{payloadError}</p> : null}
              <div className="mt-5 flex justify-end gap-2">
                <Button type="button" variant="outline" disabled={saving} onClick={() => setEditorOpen(false)}>Cancel</Button>
                <Button type="button" disabled={saving} onClick={() => void saveRecord()}>{saving ? "Saving..." : "Save"}</Button>
              </div>
            </section>
          </div>
        ) : null}

        {deletingRecord ? (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" role="presentation">
            <section role="alertdialog" aria-modal="true" aria-labelledby="resource-delete-title" className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
              <h3 id="resource-delete-title" className="text-lg font-semibold">Delete {recordLabel(deletingRecord)}?</h3>
              <p className="mt-2 text-sm text-muted-foreground">This action cannot be undone.</p>
              {payloadError ? <p role="alert" className="mt-2 text-sm text-destructive">{payloadError}</p> : null}
              <div className="mt-5 flex justify-end gap-2">
                <Button type="button" variant="outline" disabled={deleting} onClick={() => setDeletingRecord(null)}>Cancel</Button>
                <Button type="button" variant="destructive" disabled={deleting} onClick={() => void confirmDelete()}>{deleting ? "Deleting..." : "Delete"}</Button>
              </div>
            </section>
          </div>
        ) : null}
      </div>
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
