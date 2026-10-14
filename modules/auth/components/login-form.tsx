"use client"

import { Loader2 } from "lucide-react"
import { Controller } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useLoginForm } from "@/modules/auth/hooks/use-login-form"

export function LoginForm() {
  const { form, onSubmit } = useLoginForm()

  return (
    <Card className="w-full max-w-md border-border/70 bg-card/80 shadow-xl shadow-primary/5">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-semibold">Welcome back</CardTitle>
        <CardDescription>Sign in to the Thai General Worker dashboard.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="email"
                  placeholder="name@company.com"
                  autoComplete="email"
                  aria-invalid={fieldState.invalid}
                  aria-describedby={fieldState.error ? `${field.name}-error` : undefined}
                />
                <FieldError
                  errors={[fieldState.error]}
                  id={`${field.name}-error`}
                  className="empty:hidden"
                />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  aria-invalid={fieldState.invalid}
                  aria-describedby={fieldState.error ? `${field.name}-error` : undefined}
                />
                <FieldError
                  errors={[fieldState.error]}
                  id={`${field.name}-error`}
                  className="empty:hidden"
                />
              </Field>
            )}
          />

          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            {form.formState.isSubmitting ? "Signing in..." : "Login"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
