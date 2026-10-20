import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { applicationsQuery, coursesQuery, feeLabel } from "@/lib/api";
import { isCurrentUserAdmin, statusLabel, statusTone } from "@/components/admin/AdminData";
import { ApplicationsAdmin, PaymentsAdmin } from "@/components/admin/ApplicationsAdmin";
import { CoursesAdmin } from "@/components/admin/CoursesAdmin";
import { CategoriesAdmin, InstructorsAdmin } from "@/components/admin/TaxonomyAdmin";
import { SettingsAdmin } from "@/components/admin/SettingsAdmin";
import { UsersAdmin } from "@/components/admin/UsersAdmin";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/site/BrandLogo";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "অ্যাডমিন প্যানেল — Green Bangla Learning Academy" },
      { name: "description", content: "কোর্স, বিভাগ, শিক্ষক, আবেদন ও পেমেন্ট ব্যবস্থাপনা।" },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "অ্যাডমিন প্যানেল" },
      { property: "og:description", content: "Green Bangla Learning Academy ব্যবস্থাপনা।" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ["is-admin"],
    queryFn: isCurrentUserAdmin,
  });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (isLoading) {
    return <div className="container-page py-20"><div className="h-40 animate-pulse rounded-2xl bg-muted" /></div>;
  }

  if (!isAdmin) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-semibold">প্রবেশাধিকার নেই</h1>
        <p className="mt-3 max-w-md text-sm text-muted-foreground">
          এই অ্যাকাউন্টটি অ্যাডমিন হিসেবে নিবন্ধিত নয়। অনুগ্রহ করে অ্যাডমিন অ্যাকাউন্ট দিয়ে লগইন করুন।
        </p>
        <div className="mt-6 flex gap-3">
          <Button onClick={signOut}>লগআউট</Button>
          <Button asChild variant="outline"><Link to="/">হোমে ফিরুন</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-surface">
        <div className="container-page flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <BrandLogo className="h-11 w-auto" priority />
            <span className="text-sm font-semibold">অ্যাডমিন প্যানেল</span>
          </Link>
          <Button variant="outline" size="sm" onClick={signOut}>
            <LogOut className="size-4" /> লগআউট
          </Button>
        </div>
      </header>

      <main className="container-page py-8">
        <Tabs defaultValue="dashboard">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
            <TabsTrigger value="dashboard"><LayoutDashboard className="size-4" /> ড্যাশবোর্ড</TabsTrigger>
            <TabsTrigger value="applications"><ClipboardList className="size-4" /> আবেদন</TabsTrigger>
            <TabsTrigger value="courses"><BookOpen className="size-4" /> কোর্স</TabsTrigger>
            <TabsTrigger value="categories">বিভাগ</TabsTrigger>
            <TabsTrigger value="instructors"><Users className="size-4" /> শিক্ষক</TabsTrigger>
            <TabsTrigger value="payments"><CreditCard className="size-4" /> পেমেন্ট</TabsTrigger>
            <TabsTrigger value="settings"><Settings className="size-4" /> সাইট তথ্য</TabsTrigger>
            <TabsTrigger value="admins"><ShieldCheck className="size-4" /> অ্যাডমিন</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="pt-6"><Dashboard /></TabsContent>
          <TabsContent value="applications" className="pt-6"><ApplicationsAdmin /></TabsContent>
          <TabsContent value="courses" className="pt-6"><CoursesAdmin /></TabsContent>
          <TabsContent value="categories" className="pt-6"><CategoriesAdmin /></TabsContent>
          <TabsContent value="instructors" className="pt-6"><InstructorsAdmin /></TabsContent>
          <TabsContent value="payments" className="pt-6"><PaymentsAdmin /></TabsContent>
          <TabsContent value="settings" className="pt-6"><SettingsAdmin /></TabsContent>
          <TabsContent value="admins" className="pt-6"><UsersAdmin /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function Dashboard() {
  const { data: applications = [] } = useQuery(applicationsQuery);
  const { data: courses = [] } = useQuery(coursesQuery());

  const stats = [
    { label: "মোট কোর্স", value: courses.length },
    { label: "মোট আবেদন", value: applications.length },
    { label: "অপেক্ষমাণ", value: applications.filter((a) => a.status === "pending").length },
    { label: "ভর্তি সম্পন্ন", value: applications.filter((a) => a.status === "enrolled").length },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-6">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-3xl font-semibold text-primary">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-base font-semibold">সাম্প্রতিক আবেদন</h2>
          <ul className="mt-4 space-y-3">
            {applications.slice(0, 6).map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium">{a.full_name}</p>
                  <p className="text-xs text-muted-foreground">{a.courses?.title_bn}</p>
                </div>
                <span className={cn("rounded-full px-2.5 py-1 text-xs", statusTone[a.status])}>
                  {statusLabel[a.status]}
                </span>
              </li>
            ))}
            {applications.length === 0 ? (
              <li className="text-sm text-muted-foreground">এখনো কোনো আবেদন আসেনি।</li>
            ) : null}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-base font-semibold">কোর্স সারসংক্ষেপ</h2>
          <ul className="mt-4 space-y-3">
            {courses.slice(0, 6).map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium">{c.title_bn}</p>
                  <p className="text-xs text-muted-foreground">{c.categories?.name_bn}</p>
                </div>
                <span className="text-sm font-semibold text-primary">{feeLabel(c)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
