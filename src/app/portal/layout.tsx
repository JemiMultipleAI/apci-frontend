'use client';

import { AppShell } from '@/components/app-shell';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Portal layout - authentication is handled by:
  // 1. Next.js proxy middleware (server-side cookie check)
  // 2. API client interceptor (client-side 401 redirect)
  // No need for explicit auth check here to avoid blocking navigation
  return <AppShell>{children}</AppShell>;
}
