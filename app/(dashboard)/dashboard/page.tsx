"use client"

import { ArrowDownRight, ArrowUpRight, BriefcaseBusiness, CircleAlert, Landmark } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { useFinancialSummary } from "@/modules/worker/hooks/use-financial-summary"
import { useReportNotifications } from "@/modules/worker/hooks/use-report-notifications"
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
  const { data, error, isLoading } = useFinancialSummary(canViewFinancials)
  const notifications = useReportNotifications(role === "ADMIN")

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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <CardDescription>Welcome back</CardDescription>
            <CardTitle className="text-2xl">{user?.fullName ?? "Operations team"}</CardTitle>
          </div>
          <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
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
      ) : (
        <Card>
          <CardContent className="flex items-start gap-3">
            <BriefcaseBusiness className="mt-0.5 size-5 text-primary" />
            <div>
              <h3 className="font-semibold">Worker workspace</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Your role does not have access to the financial summary endpoint.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {role === "ADMIN" ? (
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CircleAlert className="size-4 text-amber-500" />
              Report notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.error ? (
              <p role="alert" className="text-sm text-destructive">{getErrorMessage(notifications.error)}</p>
            ) : notifications.isLoading ? (
              <Skeleton className="h-16 w-full rounded-xl" />
            ) : notifications.data?.length ? (
              notifications.data.map((worker: WorkerRecord) => (
                <div key={worker.id} className="flex flex-col justify-between gap-2 rounded-md border p-4 sm:flex-row sm:items-center">
                  <span className="font-medium">{worker.fullName ?? worker.passportNumber ?? `Worker ${worker.id}`}</span>
                  <span className="text-sm text-muted-foreground">Report date: {worker.reportDate ?? "Not provided"}</span>
                </div>
              ))
            ) : (
              <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                No workers were returned for the report reminder window.
              </p>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
