"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Search, UsersRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useWorkers } from "@/modules/worker/hooks/use-workers"
import { useAuthStore } from "@/store/auth-store"
import type { WorkerRecord } from "@/types/worker"

const PAGE_SIZE = 10

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return "Unable to load workers. Please try again."
}

function displayValue(value: string | number | null | undefined) {
  return value === null || value === undefined || value === "" ? "—" : String(value)
}

function WorkerSummary({ worker }: { worker: WorkerRecord }) {
  return (
    <div className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <p className="font-semibold">{worker.fullName ?? worker.passportNumber ?? `Worker ${worker.id}`}</p>
        <p className="text-sm text-muted-foreground">Passport: {displayValue(worker.passportNumber)}</p>
      </div>
      <p className="text-sm text-muted-foreground">Work permit: {displayValue(worker.workPermitNumber)}</p>
      <p className="text-sm text-muted-foreground">Phone: {displayValue(worker.phone)}</p>
      <p className="text-sm text-muted-foreground">Report date: {displayValue(worker.reportDate)}</p>
      <p className="text-sm text-muted-foreground">Visa date: {displayValue(worker.workPermitVisaDate)}</p>
      {worker.balance !== undefined ? (
        <p className="text-sm text-muted-foreground">Balance: {displayValue(worker.balance)}</p>
      ) : null}
    </div>
  )
}

const sortableColumns = [
  ["passportNumber", "Passport"],
  ["workPermitNumber", "Work permit"],
  ["phone", "Phone"],
  ["reportDate", "Report date"],
  ["workPermitVisaDate", "Visa date"],
  ["total", "Total"],
  ["deposit", "Deposit"],
  ["balance", "Balance"],
] as const

function WorkersContent() {
  const role = useAuthStore((state) => state.user?.role ?? "GENERAL_WORKER")
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const page = Math.max(1, Number(searchParams.get("page") ?? 1))
  const [search, setSearch] = useState(searchParams.get("search") ?? "")
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const sortBy = searchParams.get("sort_by") ?? "createdAt"
  const sortOrder: "asc" | "desc" = searchParams.get("sort_order") === "asc" ? "asc" : "desc"

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
      per_page: PAGE_SIZE,
      search: debouncedSearch || undefined,
      sort_by: sortBy,
      sort_order: sortOrder,
    }),
    [page, debouncedSearch, sortBy, sortOrder]
  )
  const canViewWorkers = role === "ADMIN" || role === "MANAGER"
  const { data, error, isLoading } = useWorkers(params, canViewWorkers)
  const currentPage = data?.meta.current_page ?? data?.meta.page ?? page
  const lastPage = data?.meta.last_page
  const canGoNext = lastPage !== undefined ? currentPage < lastPage : (data?.data.length ?? 0) === PAGE_SIZE

  const setPage = (nextPage: number) => {
    const query = new URLSearchParams(searchParams.toString())
    if (nextPage <= 1) query.delete("page")
    else query.set("page", String(nextPage))
    const serialized = query.toString()
    router.push(`${pathname}${serialized ? `?${serialized}` : ""}`, { scroll: false })
  }

  const setSort = (column: string) => {
    const query = new URLSearchParams(searchParams.toString())
    const nextOrder = sortBy === column && sortOrder === "asc" ? "desc" : "asc"
    query.set("sort_by", column)
    query.set("sort_order", nextOrder)
    query.delete("page")
    router.push(`${pathname}?${query.toString()}`, { scroll: false })
  }

  if (!canViewWorkers) {
    return (
      <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">
        Worker directory access is available to administrators and managers.
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-muted-foreground">Worker records</p>
          <h2 className="text-2xl font-semibold">Workers</h2>
        </div>
        <label className="relative block w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search workers..."
            className="pl-9"
            aria-label="Search workers"
          />
        </label>
      </div>

      {error ? (
        <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {getErrorMessage(error)}
        </div>
      ) : null}

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersRound className="size-4 text-primary" />
            Worker directory
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-xl bg-muted" />
            ))
          ) : data?.data.length ? (
            <>
              <div className="hidden lg:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Worker</TableHead>
                      {sortableColumns.map(([key, label]) => (
                        <TableHead key={key}>
                          <button
                            type="button"
                            className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            onClick={() => setSort(key)}
                            aria-label={`Sort by ${label}`}
                          >
                            {label}{sortBy === key ? (sortOrder === "asc" ? " ↑" : " ↓") : ""}
                          </button>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.data.map((worker) => (
                      <TableRow key={worker.id}>
                        <TableCell>
                          <Link className="font-medium text-primary underline-offset-4 hover:underline" href={`/dashboard/workers/${encodeURIComponent(worker.id)}`}>
                            {worker.fullName ?? worker.passportNumber ?? `Worker ${worker.id}`}
                          </Link>
                        </TableCell>
                        {sortableColumns.map(([key]) => (
                          <TableCell key={key}>{displayValue(worker[key])}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="space-y-3 lg:hidden">
                {data.data.map((worker) => (
                  <Link key={worker.id} href={`/dashboard/workers/${encodeURIComponent(worker.id)}`} className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <WorkerSummary worker={worker} />
                  </Link>
                ))}
              </div>
            </>
          ) : !error ? (
            <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center">
              <UsersRound className="mx-auto size-8 text-muted-foreground" />
              <p className="mt-3 font-medium">No workers found</p>
              <p className="mt-1 text-sm text-muted-foreground">Try a different search term or check back later.</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Page {currentPage}{lastPage ? ` of ${lastPage}` : ""}</p>
        <div className="flex gap-2">
          <Button variant="outline" disabled={currentPage <= 1 || isLoading} onClick={() => setPage(currentPage - 1)}>
            Previous
          </Button>
          <Button variant="outline" disabled={!canGoNext || isLoading} onClick={() => setPage(currentPage + 1)}>
            Next
          </Button>
        </div>
      </div>
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
