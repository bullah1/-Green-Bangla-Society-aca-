import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { BrandLogo } from "@/components/site/BrandLogo";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "অ্যাডমিন লগইন — Green Bangla Learning Academy" },
      { name: "description", content: "Green Bangla Learning Academy অ্যাডমিন প্যানেলে প্রবেশ করুন।" },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "অ্যাডমিন লগইন — Green Bangla Learning Academy" },
      { property: "og:description", content: "অ্যাডমিন প্যানেলে প্রবেশ করুন।" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  async function signIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate({ to: "/admin", replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="mx-auto flex w-fit items-center gap-3">
          <BrandLogo className="h-20 w-auto" priority />
          <span className="max-w-44 font-semibold leading-tight">Green Bangla Learning Academy</span>
        </Link>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h1 className="text-xl font-semibold">অ্যাডমিন প্যানেল</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            পরিচালনার জন্য আপনার অ্যাকাউন্টে প্রবেশ করুন।
          </p>

          <form onSubmit={signIn} className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="si-email">ইমেইল</Label>
              <Input id="si-email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="si-pass">পাসওয়ার্ড</Label>
              <Input id="si-pass" name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "অপেক্ষা করুন..." : "লগইন"}
            </Button>
            <p className="text-xs leading-relaxed text-muted-foreground">
              অ্যাকাউন্ট না থাকলে বিদ্যমান অ্যাডমিনের সাথে যোগাযোগ করুন — নতুন অ্যাকাউন্ট শুধু অ্যাডমিন প্যানেল থেকে তৈরি করা যায়।
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
