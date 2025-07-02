"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { redirect } from "next/navigation";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const name = String(formData.get("name"));
    if (!name) return toast.error("Name is required");

    const email = String(formData.get("email"));
    if (!email) return toast.error("Email is required");

    const password = String(formData.get("password"));
    if (!password) return toast.error("Password is required");

    const confirmPassword = String(formData.get("confirmPassword"));
    if (!confirmPassword) return toast.error("Confirm password is required");
    if (password !== confirmPassword)
      return toast.error("Passwords do not match");

    await signUp.email(
      { name, email, password },
      {
        onRequest: () => {
          setIsPending(true);
        },
        onResponse: () => setIsPending(false),
        onError: (ctx) => {
          let errorMsg = "An error occurred during registration";

          if (typeof ctx.error === "string") {
            errorMsg = ctx.error;
          } else if (ctx.error?.message) {
            try {
              const parsed = JSON.parse(ctx.error.message);
              if (parsed?.error) errorMsg = parsed.error;
              else errorMsg = ctx.error.message;
            } catch {
              errorMsg = ctx.error.message;
            }
          } else if (ctx.error?.error) {
            errorMsg = ctx.error.error;
          }

          toast.error(errorMsg);
        },
        onSuccess: () => {
          toast.success("Account created successfully");
          redirect("/");
        },
      }
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Create your account</CardTitle>
          <CardDescription>
            Enter your information below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Ammar Ahmed"
                  required
                  type="text"
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  placeholder="ammar@example.com"
                  required
                  type="email"
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" required type="password" />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  required
                  type="password"
                />
              </div>
              <Button className="w-full" disabled={isPending} type="submit">
                {isPending ? "Creating account..." : "Create Account"}
              </Button>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <a className="underline underline-offset-4" href="/auth/login">
                  Sign in
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
