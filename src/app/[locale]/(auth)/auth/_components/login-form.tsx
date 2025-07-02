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
import { signIn } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface ErrorResponse {
  error: string;
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const email = String(formData.get("email"));
    if (!email) return toast.error("Email is required");

    const password = String(formData.get("password"));
    if (!password) return toast.error("Password is required");

    await signIn.email(
      { email, password },
      {
        onRequest: () => {
          setIsPending(true);
        },
        onResponse: () => setIsPending(false),
        onError: (ctx) => {
          let errorMsg = "An error occurred during sign in";

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
          toast.success("Signed in successfully");
          router.push("/");
        },
      }
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  placeholder="m@example.com"
                  required
                  type="email"
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    href="/auth/forgot-password"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input id="password" name="password" required type="password" />
              </div>
              <Button className="w-full" disabled={isPending} type="submit">
                {isPending ? "Signing in..." : "Login"}
              </Button>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <a
                  className="underline underline-offset-4"
                  href="/auth/register"
                >
                  Sign up
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
