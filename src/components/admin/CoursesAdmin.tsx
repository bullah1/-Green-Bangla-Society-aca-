import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { categoriesQuery, coursesQuery, feeLabel, instructorsQuery, type Course } from "@/lib/api";
import { slugify } from "./AdminData";
import { ImageUpload } from "./ImageUpload";

type FormState = Partial<Course> & { id?: string };

const empty: FormState = {
  title_bn: "",
  title_en: "",
  short_description_bn: "",
  description_bn: "",
  duration_bn: "৩ মাস",
  total_classes: 12,
  level_bn: "শিক্ষানবিস",
  fee: 0,
  is_free: false,
  is_scholarship: false,
  is_featured: false,
  is_published: true,
  image_url: "",
  seo_title: "",
  seo_description: "",
};

export function CoursesAdmin() {
  const qc = useQueryClient();
  const { data: courses = [] } = useQuery(coursesQuery());
  const { data: categories = [] } = useQuery(categoriesQuery);
  const { data: instructors = [] } = useQuery(instructorsQuery);
  const [form, setForm] = useState<FormState | null>(null);
  const [deleting, setDeleting] = useState<Course | null>(null);

  const save = useMutation({
    mutationFn: async (values: FormState) => {
      const payload = {
        title_bn: values.title_bn ?? "",
        title_en: values.title_en || values.title_bn || "",
        slug: values.slug || slugify(values.title_en || values.title_bn || ""),
        category_id: values.category_id ?? null,
        instructor_id: values.instructor_id ?? null,
        short_description_bn: values.short_description_bn ?? null,
        description_bn: values.description_bn ?? null,
        image_url: values.image_url || null,
        duration_bn: values.duration_bn ?? null,
        total_classes: Number(values.total_classes ?? 0),
        level_bn: values.level_bn ?? null,
        fee: Number(values.fee ?? 0),
        is_free: Boolean(values.is_free),
        is_scholarship: Boolean(values.is_scholarship),
        is_featured: Boolean(values.is_featured),
        is_published: values.is_published ?? true,
        seo_title: values.seo_title || null,
        seo_description: values.seo_description || null,
      };
      if (values.id) {
        const { error } = await supabase.from("courses").update(payload).eq("id", values.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("courses").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["courses"] });
      setForm(null);
      toast.success("কোর্স সংরক্ষিত হয়েছে।");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["courses"] });
      setDeleting(null);
      toast.success("কোর্স মুছে ফেলা হয়েছে।");
    },
    onError: (e: { code?: string }) => {
      setDeleting(null);
      if (e?.code === "23503") {
        toast.error("এই কোর্সে আবেদন আছে — মুছে না ফেলে 'প্রকাশিত' বন্ধ করুন।");
      } else {
        toast.error("মুছে ফেলা যায়নি।");
      }
    },
  });

  const update = (patch: FormState) => setForm((f) => ({ ...(f ?? {}), ...patch }));

  return (
    <div className="space-y-5">
      <div className="flex justify-between">
        <h2 className="text-lg font-semibold">কোর্স ব্যবস্থাপনা</h2>
        <Button onClick={() => setForm({ ...empty })}>
          <Plus className="size-4" /> নতুন কোর্স
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="border-b border-border text-left text-xs text-muted-foreground">
            <tr>
              <th className="p-4">কোর্স</th>
              <th className="p-4">বিভাগ</th>
              <th className="p-4">ফি</th>
              <th className="p-4">অবস্থা</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0">
                <td className="p-4">
                  <p className="font-medium">{c.title_bn}</p>
                  <p className="text-xs text-muted-foreground">/{c.slug}</p>
                </td>
                <td className="p-4">{c.categories?.name_bn ?? "—"}</td>
                <td className="p-4">{feeLabel(c)}</td>
                <td className="p-4 text-xs">
                  {c.is_published ? "প্রকাশিত" : "খসড়া"}
                  {c.is_featured ? " · ফিচার্ড" : ""}
                </td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <Button size="icon" variant="outline" onClick={() => setForm({ ...c })}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="text-destructive"
                      onClick={() => setDeleting(c)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AlertDialog open={Boolean(deleting)} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>কোর্সটি মুছে ফেলবেন?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleting?.title_bn}" স্থায়ীভাবে মুছে যাবে। এই কোর্সে কোনো আবেদন থাকলে মোছা যাবে না —
              সেক্ষেত্রে 'প্রকাশিত' বন্ধ করে দিন।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={remove.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (deleting) remove.mutate(deleting.id);
              }}
            >
              মুছে ফেলুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={Boolean(form)} onOpenChange={(o) => !o && setForm(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{form?.id ? "কোর্স সম্পাদনা" : "নতুন কোর্স"}</DialogTitle>
          </DialogHeader>
          {form ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>কোর্সের নাম (বাংলা)</Label>
                <Input value={form.title_bn ?? ""} onChange={(e) => update({ title_bn: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Course title (English)</Label>
                <Input value={form.title_en ?? ""} onChange={(e) => update({ title_en: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>স্লাগ (URL)</Label>
                <Input value={form.slug ?? ""} onChange={(e) => update({ slug: e.target.value })} placeholder="auto" />
              </div>
              <div className="space-y-2">
                <Label>বিভাগ</Label>
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={form.category_id ?? ""}
                  onChange={(e) => update({ category_id: e.target.value || null })}
                >
                  <option value="">নির্বাচন করুন</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name_bn}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>শিক্ষক</Label>
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={form.instructor_id ?? ""}
                  onChange={(e) => update({ instructor_id: e.target.value || null })}
                >
                  <option value="">নির্বাচন করুন</option>
                  {instructors.map((i) => (
                    <option key={i.id} value={i.id}>{i.name_bn}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>সংক্ষিপ্ত বিবরণ</Label>
                <Input
                  value={form.short_description_bn ?? ""}
                  onChange={(e) => update({ short_description_bn: e.target.value })}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>বিস্তারিত বিবরণ</Label>
                <Textarea
                  rows={4}
                  value={form.description_bn ?? ""}
                  onChange={(e) => update({ description_bn: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <ImageUpload
                  label="কোর্সের ছবি"
                  folder="courses"
                  value={form.image_url ?? ""}
                  onChange={(url) => update({ image_url: url })}
                />
              </div>
              <div className="space-y-2">
                <Label>সময়কাল</Label>
                <Input value={form.duration_bn ?? ""} onChange={(e) => update({ duration_bn: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>মোট ক্লাস</Label>
                <Input
                  type="number"
                  value={form.total_classes ?? 0}
                  onChange={(e) => update({ total_classes: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>লেভেল</Label>
                <Input value={form.level_bn ?? ""} onChange={(e) => update({ level_bn: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>কোর্স ফি (৳)</Label>
                <Input
                  type="number"
                  value={form.fee ?? 0}
                  onChange={(e) => update({ fee: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>SEO শিরোনাম</Label>
                <Input value={form.seo_title ?? ""} onChange={(e) => update({ seo_title: e.target.value })} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>SEO বিবরণ</Label>
                <Textarea
                  rows={2}
                  value={form.seo_description ?? ""}
                  onChange={(e) => update({ seo_description: e.target.value })}
                />
              </div>

              <div className="grid gap-3 sm:col-span-2 sm:grid-cols-2">
                <ToggleRow label="ফ্রি কোর্স" checked={Boolean(form.is_free)} onChange={(v) => update({ is_free: v })} />
                <ToggleRow label="স্কলারশিপ" checked={Boolean(form.is_scholarship)} onChange={(v) => update({ is_scholarship: v })} />
                <ToggleRow label="ফিচার্ড" checked={Boolean(form.is_featured)} onChange={(v) => update({ is_featured: v })} />
                <ToggleRow label="প্রকাশিত" checked={form.is_published ?? true} onChange={(v) => update({ is_published: v })} />
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setForm(null)}>বাতিল</Button>
            <Button onClick={() => form && save.mutate(form)} disabled={save.isPending}>
              সংরক্ষণ করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-xl border border-border p-3 text-sm">
      {label}
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}
