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
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";

interface ErrorResponse {
  error: string;
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const t = useTranslations("Auth.Login");
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const email = String(formData.get("email"));
    if (!email) return toast.error(t("errors.emailRequired"));

    const password = String(formData.get("password"));
    if (!password) return toast.error(t("errors.passwordRequired"));

    await signIn.email(
      { email, password },
      {
        onRequest: () => {
          setIsPending(true);
        },
        onResponse: () => setIsPending(false),
        onError: (ctx) => {
          let errorMsg = t("errors.defaultError");

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
          toast.success(t("success"));
          router.push("/");
        },
      }
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  name="email"
                  placeholder={t("emailPlaceholder")}
                  required
                  type="email"
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">{t("password")}</Label>
                  <Link
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    href="/auth/forgot-password"
                  >
                    {t("forgotPassword")}
                  </Link>
                </div>
                <Input id="password" name="password" required type="password" />
              </div>
              <Button className="w-full" disabled={isPending} type="submit">
                {isPending ? t("signingIn") : t("login")}
              </Button>
              <div className="text-center text-sm">
                {t("dontHaveAccount")}{" "}
                <Link
                  className="underline underline-offset-4"
                  href="/auth/register"
                >
                  {t("signUp")}
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
