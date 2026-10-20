import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { applicationsQuery, type Application } from "@/lib/api";
import { paymentStatusLabel, statusLabel, statusTone } from "./AdminData";
import { cn } from "@/lib/utils";

const filters = [
  { key: "all", label: "সব" },
  { key: "pending", label: "অপেক্ষমাণ" },
  { key: "approved", label: "অনুমোদিত" },
  { key: "rejected", label: "বাতিল" },
  { key: "enrolled", label: "ভর্তি সম্পন্ন" },
];

export function ApplicationsAdmin() {
  const qc = useQueryClient();
  const { data: applications = [], isLoading } = useQuery(applicationsQuery);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Application | null>(null);
  const [notes, setNotes] = useState("");

  const review = useMutation({
    mutationFn: async ({
      app,
      status,
      adminNotes,
    }: {
      app: Application;
      status: Application["status"];
      adminNotes: string;
    }) => {
      const { error } = await supabase
        .from("applications")
        .update({ status, admin_notes: adminNotes, reviewed_at: new Date().toISOString() })
        .eq("id", app.id);
      if (error) throw error;

      const course = app.courses;
      const free =
        !course || course.is_free || course.is_scholarship || Number(course.fee) <= 0;

      if (status === "approved") {
        const { error: payErr } = await supabase.from("payments").upsert(
          {
            application_id: app.id,
            amount: free ? 0 : Number(course?.fee ?? 0),
            status: free ? "waived" : "pending",
          },
          { onConflict: "application_id", ignoreDuplicates: true },
        );
        if (payErr) throw payErr;
        if (free) {
          const { error: enrollErr } = await supabase
            .from("applications")
            .update({ status: "enrolled" })
            .eq("id", app.id);
          if (enrollErr) throw enrollErr;
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applications"] });
      qc.invalidateQueries({ queryKey: ["payments"] });
      setSelected(null);
      toast.success("আবেদনের অবস্থা হালনাগাদ হয়েছে।");
    },
    onError: () => toast.error("হালনাগাদ করা যায়নি।"),
  });

  const rows = applications.filter((a) => filter === "all" || a.status === filter);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm transition-colors",
              filter === f.key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:bg-accent",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="h-40 animate-pulse rounded-2xl bg-muted" />
      ) : rows.length === 0 ? (
        <p className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">
          কোনো আবেদন নেই।
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-border text-left text-xs text-muted-foreground">
              <tr>
                <th className="p-4">রেফারেন্স</th>
                <th className="p-4">আবেদনকারী</th>
                <th className="p-4">কোর্স</th>
                <th className="p-4">অবস্থা</th>
                <th className="p-4">তারিখ</th>
                <th className="p-4" />
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className="border-b border-border last:border-0">
                  <td className="p-4 font-mono text-xs">{a.reference_code}</td>
                  <td className="p-4">
                    <p className="font-medium">{a.full_name}</p>
                    <p className="text-xs text-muted-foreground">{a.email} · {a.phone}</p>
                  </td>
                  <td className="p-4">{a.courses?.title_bn ?? "—"}</td>
                  <td className="p-4">
                    <span className={cn("rounded-full px-2.5 py-1 text-xs", statusTone[a.status])}>
                      {statusLabel[a.status]}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-muted-foreground">
                    {new Date(a.created_at).toLocaleDateString("bn-BD")}
                  </td>
                  <td className="p-4 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelected(a);
                        setNotes(a.admin_notes ?? "");
                      }}
                    >
                      পর্যালোচনা
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={Boolean(selected)} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>আবেদন পর্যালোচনা</DialogTitle>
          </DialogHeader>
          {selected ? (
            <div className="space-y-4 text-sm">
              <div className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-2">
                <Field label="নাম" value={selected.full_name} />
                <Field label="ইমেইল" value={selected.email} />
                <Field label="ফোন" value={selected.phone} />
                <Field label="ঠিকানা" value={selected.address ?? "—"} />
                <Field label="শিক্ষাগত যোগ্যতা" value={selected.education ?? "—"} />
                <Field label="কোর্স" value={selected.courses?.title_bn ?? "—"} />
              </div>
              {selected.message ? (
                <div className="rounded-xl border border-border p-4">
                  <p className="text-xs text-muted-foreground">আবেদনকারীর বার্তা</p>
                  <p className="mt-1 leading-relaxed">{selected.message}</p>
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="notes">অ্যাডমিন নোট</Label>
                <Textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>

              <DialogFooter className="gap-2 sm:justify-between">
                <Button
                  variant="outline"
                  className="text-destructive"
                  disabled={review.isPending}
                  onClick={() =>
                    review.mutate({ app: selected, status: "rejected", adminNotes: notes })
                  }
                >
                  বাতিল করুন
                </Button>
                <Button
                  disabled={review.isPending}
                  onClick={() =>
                    review.mutate({ app: selected, status: "approved", adminNotes: notes })
                  }
                >
                  অনুমোদন করুন
                </Button>
              </DialogFooter>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-medium">{value}</p>
    </div>
  );
}

export function PaymentsAdmin() {
  const qc = useQueryClient();
  const { data: applications = [] } = useQuery(applicationsQuery);
  const { data: payments = [] } = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  const [editing, setEditing] = useState<string | null>(null);
  const [ref, setRef] = useState("");
  const [method, setMethod] = useState("");

  const markPaid = useMutation({
    mutationFn: async (paymentId: string) => {
      const payment = payments.find((p) => p.id === paymentId);
      const { error } = await supabase
        .from("payments")
        .update({
          status: "paid",
          method: method || null,
          transaction_ref: ref || null,
          paid_at: new Date().toISOString(),
        })
        .eq("id", paymentId);
      if (error) throw error;
      if (payment) {
        const { error: enrollErr } = await supabase
          .from("applications")
          .update({ status: "enrolled" })
          .eq("id", payment.application_id);
        if (enrollErr) throw enrollErr;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["applications"] });
      setEditing(null);
      setRef("");
      setMethod("");
      toast.success("পেমেন্ট রেকর্ড হালনাগাদ হয়েছে।");
    },
    onError: () => toast.error("হালনাগাদ করা যায়নি।"),
  });

  if (payments.length === 0) {
    return (
      <p className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">
        এখনো কোনো পেমেন্ট রেকর্ড নেই। আবেদন অনুমোদনের পর পেমেন্ট রেকর্ড তৈরি হয়।
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="border-b border-border text-left text-xs text-muted-foreground">
          <tr>
            <th className="p-4">আবেদনকারী</th>
            <th className="p-4">পরিমাণ</th>
            <th className="p-4">অবস্থা</th>
            <th className="p-4">ট্রানজেকশন</th>
            <th className="p-4" />
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => {
            const app = applications.find((a) => a.id === p.application_id);
            return (
              <tr key={p.id} className="border-b border-border last:border-0 align-top">
                <td className="p-4">
                  <p className="font-medium">{app?.full_name ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">{app?.courses?.title_bn}</p>
                </td>
                <td className="p-4">৳ {Number(p.amount).toLocaleString("bn-BD")}</td>
                <td className="p-4">
                  <span className={cn("rounded-full px-2.5 py-1 text-xs", statusTone[p.status])}>
                    {paymentStatusLabel[p.status] ?? p.status}
                  </span>
                </td>
                <td className="p-4 text-xs text-muted-foreground">
                  {p.transaction_ref ? `${p.method ?? ""} ${p.transaction_ref}` : "—"}
                </td>
                <td className="p-4">
                  {p.status === "pending" ? (
                    editing === p.id ? (
                      <div className="flex flex-col gap-2">
                        <Input placeholder="মাধ্যম (bKash/Nagad)" value={method} onChange={(e) => setMethod(e.target.value)} />
                        <Input placeholder="ট্রানজেকশন আইডি" value={ref} onChange={(e) => setRef(e.target.value)} />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => markPaid.mutate(p.id)} disabled={markPaid.isPending}>
                            নিশ্চিত করুন
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
                            বাতিল
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setEditing(p.id)}>
                        পেমেন্ট রেকর্ড করুন
                      </Button>
                    )
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
