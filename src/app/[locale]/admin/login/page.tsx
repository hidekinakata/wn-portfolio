import { Suspense } from "react";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { redirect } from "@/i18n/navigation";
import { authConfigured, getAdmin } from "@/lib/admin/auth";
import { LoginForm } from "@/components/admin/login-form";

export default function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  return <Suspense fallback={<div className="admin-loading" aria-busy="true" />}><LoginContent params={params} /></Suspense>;
}

async function LoginContent({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  if (await getAdmin()) redirect({ href: "/admin", locale });
  return <LoginForm locale={locale} configured={authConfigured()} />;
}
