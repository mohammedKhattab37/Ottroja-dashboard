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
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const t = useTranslations("Auth.Register");
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const name = String(formData.get("name"));
    if (!name) return toast.error(t("errors.nameRequired"));

    const email = String(formData.get("email"));
    if (!email) return toast.error(t("errors.emailRequired"));

    const password = String(formData.get("password"));
    if (!password) return toast.error(t("errors.passwordRequired"));

    const confirmPassword = String(formData.get("confirmPassword"));
    if (!confirmPassword)
      return toast.error(t("errors.confirmPasswordRequired"));
    if (password !== confirmPassword)
      return toast.error(t("errors.passwordsDoNotMatch"));

    await signUp.email(
      { name, email, password },
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
                <Label htmlFor="name">{t("fullName")}</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder={t("fullNamePlaceholder")}
                  required
                  type="text"
                />
              </div>
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
                <Label htmlFor="password">{t("password")}</Label>
                <Input id="password" name="password" required type="password" />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  required
                  type="password"
                />
              </div>
              <Button className="w-full" disabled={isPending} type="submit">
                {isPending ? t("creatingAccount") : t("createAccount")}
              </Button>
              <div className="text-center text-sm">
                {t("alreadyHaveAccount")}{" "}
                <Link
                  className="underline underline-offset-4"
                  href="/auth/login"
                >
                  {t("signIn")}
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
