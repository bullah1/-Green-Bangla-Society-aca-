import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createAdminUser, listAdminUsers } from "@/lib/admin-users.functions";

type AdminRow = { id: string; full_name: string; email: string; created_at: string };

export function UsersAdmin() {
  const qc = useQueryClient();
  const { data: admins = [] } = useQuery<AdminRow[]>({
    queryKey: ["admin-users"],
    queryFn: () => listAdminUsers() as Promise<AdminRow[]>,
  });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });

  const create = useMutation({
    mutationFn: () => createAdminUser({ data: form }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setOpen(false);
      setForm({ full_name: "", email: "", password: "" });
      toast.success("নতুন অ্যাডমিন অ্যাকাউন্ট তৈরি হয়েছে।");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">অ্যাডমিন অ্যাকাউন্ট</h2>
          <p className="text-sm text-muted-foreground">
            নতুন অ্যাডমিন অ্যাকাউন্ট শুধু এখান থেকেই তৈরি করা যায়।
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" /> নতুন অ্যাডমিন
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <ul className="divide-y divide-border">
          {admins.map((a) => (
            <li key={a.id} className="flex items-center gap-3 p-4">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary-soft text-primary">
                <ShieldCheck className="size-5" />
              </span>
              <div>
                <p className="text-sm font-medium">{a.full_name || "—"}</p>
                <p className="text-xs text-muted-foreground">{a.email}</p>
              </div>
            </li>
          ))}
          {admins.length === 0 ? (
            <li className="p-4 text-sm text-muted-foreground">কোনো অ্যাডমিন পাওয়া যায়নি।</li>
          ) : null}
        </ul>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>নতুন অ্যাডমিন তৈরি করুন</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="na-name">নাম</Label>
              <Input
                id="na-name"
                value={form.full_name}
                onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="na-email">ইমেইল</Label>
              <Input
                id="na-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="na-pass">পাসওয়ার্ড</Label>
              <Input
                id="na-pass"
                type="password"
                minLength={8}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                এই ইমেইল ও পাসওয়ার্ড দিয়েই নতুন অ্যাডমিন লগইন করবেন।
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>বাতিল</Button>
            <Button
              onClick={() => create.mutate()}
              disabled={create.isPending || !form.full_name || !form.email || form.password.length < 8}
            >
              {create.isPending ? "অপেক্ষা করুন..." : "তৈরি করুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
