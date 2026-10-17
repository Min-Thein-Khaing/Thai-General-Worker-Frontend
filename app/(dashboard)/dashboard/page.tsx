"use client"

import { useState } from "react"
import {
  ArrowDownRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Calendar,
  CircleAlert,
  CreditCard,
  FilePlus,
  FileText,
  Landmark,
  Phone,
  ShieldCheck,
  UserCheck,
} from "lucide-react"
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { useFinancialSummary } from "@/modules/worker/hooks/use-financial-summary"
import { useReportNotifications } from "@/modules/worker/hooks/use-report-notifications"
import { useWorkers } from "@/modules/worker/hooks/use-workers"
import { DocumentsPanel } from "@/modules/document/components/documents-panel"
import { UploadDocumentDialog } from "@/modules/document/components/upload-document-dialog"
import { useAuthStore } from "@/store/auth-store"
import type { WorkerRecord } from "@/types/worker"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(value)
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return "Unable to load dashboard data."
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const role = user?.role ?? "GENERAL_WORKER"
  const canViewFinancials = role === "ADMIN" || role === "MANAGER"
  const isWorker = role === "GENERAL_WORKER"

  const { data, error, isLoading } = useFinancialSummary(canViewFinancials)
  const notifications = useReportNotifications(role === "ADMIN")
  
  // For worker login: fetch current worker record
  const workerListQuery = useWorkers(
    { page: 1, per_page: 5, search: user?.email || user?.fullName || undefined, sort_by: "createdAt", sort_order: "desc" },
    isWorker
  )
  const myWorker = workerListQuery.data?.data?.find((w) => w.userId === user?.id) ?? workerListQuery.data?.data?.[0]

  const [selectedWorkerForDoc, setSelectedWorkerForDoc] = useState<{ id: string; name: string } | null>(null)

  const metrics = [
    { label: "Workers", value: data ? data.workerCount.toLocaleString() : "—", icon: BriefcaseBusiness },
    { label: "Total", value: data ? formatCurrency(Number(data.total)) : "—", icon: Landmark },
    { label: "Deposit paid", value: data ? formatCurrency(Number(data.deposit)) : "—", icon: ArrowDownRight },
    { label: "Remaining balance", value: data ? formatCurrency(Number(data.balance)) : "—", icon: ArrowUpRight },
  ]
  const chartData = data
    ? [
        { name: "Total", amount: Number(data.total) },
        { name: "Deposit", amount: Number(data.deposit) },
        { name: "Balance", amount: Number(data.balance) },
      ]
    : []

  return (
    <div className="space-y-6">
      <Card className="border-border/70 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <CardDescription>Welcome back</CardDescription>
            <CardTitle className="text-2xl font-bold tracking-tight">{user?.fullName ?? "Operations team"}</CardTitle>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {role.replaceAll("_", " ")}
          </span>
        </CardHeader>
      </Card>

      {canViewFinancials ? (
        <>
          {error ? (
            <div role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              {getErrorMessage(error)}
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => {
              const Icon = metric.icon

              return (
                <Card key={metric.label} className="border-border/70">
                  <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{metric.label}</CardTitle>
                    <Icon className="size-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold tracking-tight">
                      {isLoading ? <Skeleton className="h-7 w-24" /> : metric.value}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>Financial overview</CardTitle>
              <p className="text-sm text-muted-foreground">Totals returned by the worker financial summary endpoint.</p>
            </CardHeader>
            <CardContent>
              {error ? (
                <div className="flex h-[280px] items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
                  Financial chart unavailable.
                </div>
              ) : isLoading ? (
                <Skeleton className="h-[280px] w-full rounded-xl" />
              ) : (
                <ChartContainer aria-label="Bar chart of total, deposit, and balance amounts">
                  <BarChart data={chartData} margin={{ top: 12, right: 12, bottom: 4, left: 8 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      width={72}
                      tickFormatter={(value: number) => new Intl.NumberFormat("th-TH", { notation: "compact" }).format(value)}
                    />
                    <Tooltip
                      formatter={(value) => [formatCurrency(Number(value)), "Amount"]}
                      contentStyle={{
                        borderRadius: 12,
                        borderColor: "var(--border)",
                        background: "var(--card)",
                        color: "var(--card-foreground)",
                      }}
                    />
                    <Bar dataKey="amount" fill="var(--color-primary)" radius={[8, 8, 0, 0]} maxBarSize={72} />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </>
      ) : isWorker ? (
        /* Worker Dashboard Layout */
        <div className="space-y-6">
          <Card className="border-border/70 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserCheck className="size-5 text-primary" />
                My Worker Profile
              </CardTitle>
              <CardDescription>Your registered work permit, visa, and status in Thailand</CardDescription>
            </CardHeader>
            <CardContent>
              {workerListQuery.isLoading ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-xl" />
                  ))}
                </div>
              ) : myWorker ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl border border-border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">Passport Number</p>
                    <p className="mt-1 font-semibold text-foreground">{myWorker.passportNumber || "—"}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">Work Permit Number</p>
                    <p className="mt-1 font-semibold text-foreground">{myWorker.workPermitNumber || "—"}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">Visa Stamp Date</p>
                    <p className="mt-1 font-semibold text-foreground">{myWorker.workPermitVisaDate || "—"}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">Report Deadline</p>
                    <p className="mt-1 font-semibold text-amber-600 dark:text-amber-400">{myWorker.reportDate || "—"}</p>
                  </div>
                  {myWorker.phone && (
                    <div className="rounded-xl border border-border bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="mt-1 font-medium text-foreground">{myWorker.phone}</p>
                    </div>
                  )}
                  {myWorker.ciNumber && (
                    <div className="rounded-xl border border-border bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground">CI Number</p>
                      <p className="mt-1 font-medium text-foreground">{myWorker.ciNumber}</p>
                    </div>
                  )}
                  {myWorker.balance !== undefined && (
                    <div className="rounded-xl border border-border bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground">Remaining Balance</p>
                      <p className="mt-1 font-semibold text-primary">{formatCurrency(Number(myWorker.balance))}</p>
                    </div>
                  )}
                  {myWorker.renewalDecision && (
                    <div className="rounded-xl border border-border bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground">Renewal Status</p>
                      <span className="mt-1 inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                        {myWorker.renewalDecision}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  No worker profile has been linked to this account yet.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Worker Documents Section */}
          {myWorker?.id ? (
            <DocumentsPanel workerId={myWorker.id} canManage={false} />
          ) : null}
        </div>
      ) : null}

      {role === "ADMIN" ? (
        <Card className="border-border/70 shadow-xs">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2">
                <CircleAlert className="size-4 text-amber-500" />
                Report notifications
              </CardTitle>
              {notifications.data?.length ? (
                <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  {notifications.data.length} due in 7 days
                </span>
              ) : null}
            </div>
            <CardDescription>
              Workers whose 90-day report deadline is exactly 7 days from today in Thailand time.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.error ? (
              <p role="alert" className="text-sm text-destructive">{getErrorMessage(notifications.error)}</p>
            ) : notifications.isLoading ? (
              <Skeleton className="h-16 w-full rounded-xl" />
            ) : notifications.data?.length ? (
              notifications.data.map((worker: WorkerRecord) => {
                const workerDisplayName = worker.fullName ?? worker.passportNumber ?? `Worker ${worker.id}`
                return (
                  <div key={worker.id} className="flex flex-col justify-between gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/10 sm:flex-row sm:items-center">
                    <div>
                      <span className="font-semibold text-foreground">{workerDisplayName}</span>
                      <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                        <span>Report deadline: <strong className="text-amber-600 dark:text-amber-400">{worker.reportDate ?? "Not provided"}</strong></span>
                        {worker.passportNumber ? <span>Passport: {worker.passportNumber}</span> : null}
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedWorkerForDoc({ id: worker.id, name: workerDisplayName })}
                      className="gap-1.5 self-start text-xs font-medium sm:self-auto"
                    >
                      <FilePlus className="size-3.5 text-primary" />
                      Create Document
                    </Button>
                  </div>
                )
              })
            ) : (
              <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                No workers were returned for the report reminder window.
              </p>
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* Document Upload Dialog for Notification Worker */}
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

