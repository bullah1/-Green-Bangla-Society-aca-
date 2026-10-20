import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { categoriesQuery, instructorsQuery, type Category, type Instructor } from "@/lib/api";
import { slugify } from "./AdminData";
import { ImageUpload } from "./ImageUpload";
import { StorageImage } from "@/components/site/StorageImage";

type CategoryForm = Partial<Category> & { id?: string };

export function CategoriesAdmin() {
  const qc = useQueryClient();
  const { data: categories = [] } = useQuery(categoriesQuery);
  const [form, setForm] = useState<CategoryForm | null>(null);
  const update = (patch: CategoryForm) => setForm((f) => ({ ...(f ?? {}), ...patch }));

  const save = useMutation({
    mutationFn: async (values: CategoryForm) => {
      const payload = {
        name_bn: values.name_bn ?? "",
        name_en: values.name_en || values.name_bn || "",
        slug: values.slug || slugify(values.name_en || values.name_bn || ""),
        description_bn: values.description_bn ?? null,
        color: values.color || "#2D8659",
        bg_color: values.bg_color || "#E8F5E9",
        icon: values.icon || "BookOpen",
        sort_order: Number(values.sort_order ?? 0),
        is_active: values.is_active ?? true,
      };
      if (values.id) {
        const { error } = await supabase.from("categories").update(payload).eq("id", values.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("categories").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      setForm(null);
      toast.success("বিভাগ সংরক্ষিত হয়েছে।");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success("বিভাগ মুছে ফেলা হয়েছে।");
    },
    onError: () => toast.error("মুছে ফেলা যায়নি।"),
  });

  return (
    <div className="space-y-5">
      <div className="flex justify-between">
        <h2 className="text-lg font-semibold">বিভাগ ব্যবস্থাপনা</h2>
        <Button onClick={() => setForm({ color: "#2D8659", bg_color: "#E8F5E9", icon: "BookOpen" })}>
          <Plus className="size-4" /> নতুন বিভাগ
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <div key={c.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start justify-between">
              <span
                className="rounded-full px-3 py-1 text-xs font-medium"
                style={{ backgroundColor: c.bg_color, color: c.color }}
              >
                {c.name_bn}
              </span>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => setForm({ ...c })}>
                  <Pencil className="size-4" />
                </Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove.mutate(c.id)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{c.description_bn}</p>
            <p className="mt-3 text-xs text-muted-foreground">/{c.slug} · আইকন: {c.icon}</p>
          </div>
        ))}
      </div>

      <Dialog open={Boolean(form)} onOpenChange={(o) => !o && setForm(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{form?.id ? "বিভাগ সম্পাদনা" : "নতুন বিভাগ"}</DialogTitle>
          </DialogHeader>
          {form ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>নাম (বাংলা)</Label>
                <Input value={form.name_bn ?? ""} onChange={(e) => update({ name_bn: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Name (English)</Label>
                <Input value={form.name_en ?? ""} onChange={(e) => update({ name_en: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>স্লাগ</Label>
                <Input value={form.slug ?? ""} onChange={(e) => update({ slug: e.target.value })} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>বিবরণ</Label>
                <Textarea rows={2} value={form.description_bn ?? ""} onChange={(e) => update({ description_bn: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>মূল রঙ</Label>
                <Input type="color" value={form.color ?? "#2D8659"} onChange={(e) => update({ color: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>ব্যাকগ্রাউন্ড রঙ</Label>
                <Input type="color" value={form.bg_color ?? "#E8F5E9"} onChange={(e) => update({ bg_color: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>আইকন</Label>
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={form.icon ?? "BookOpen"}
                  onChange={(e) => update({ icon: e.target.value })}
                >
                  <option value="BookOpen">BookOpen</option>
                  <option value="Briefcase">Briefcase</option>
                  <option value="Sparkles">Sparkles</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>ক্রম</Label>
                <Input
                  type="number"
                  value={form.sort_order ?? 0}
                  onChange={(e) => update({ sort_order: Number(e.target.value) })}
                />
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setForm(null)}>বাতিল</Button>
            <Button onClick={() => form && save.mutate(form)} disabled={save.isPending}>সংরক্ষণ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

type InstructorForm = Partial<Instructor> & { id?: string };

export function InstructorsAdmin() {
  const qc = useQueryClient();
  const { data: instructors = [] } = useQuery(instructorsQuery);
  const [form, setForm] = useState<InstructorForm | null>(null);
  const update = (patch: InstructorForm) => setForm((f) => ({ ...(f ?? {}), ...patch }));

  const save = useMutation({
    mutationFn: async (values: InstructorForm) => {
      const payload = {
        name_bn: values.name_bn ?? "",
        name_en: values.name_en || values.name_bn || "",
        title_bn: values.title_bn ?? null,
        bio_bn: values.bio_bn ?? null,
        photo_url: values.photo_url || null,
        email: values.email || null,
        is_active: values.is_active ?? true,
      };
      if (values.id) {
        const { error } = await supabase.from("instructors").update(payload).eq("id", values.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("instructors").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["instructors"] });
      setForm(null);
      toast.success("শিক্ষক সংরক্ষিত হয়েছে।");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("instructors").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["instructors"] });
      toast.success("শিক্ষক মুছে ফেলা হয়েছে।");
    },
    onError: () => toast.error("মুছে ফেলা যায়নি।"),
  });

  return (
    <div className="space-y-5">
      <div className="flex justify-between">
        <h2 className="text-lg font-semibold">শিক্ষক ব্যবস্থাপনা</h2>
        <Button onClick={() => setForm({})}>
          <Plus className="size-4" /> নতুন শিক্ষক
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {instructors.map((i) => (
          <div key={i.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {i.photo_url ? (
                  <StorageImage
                    src={i.photo_url}
                    alt={i.name_bn}
                    loading="lazy"
                    className="size-12 rounded-full border border-border object-cover"
                  />
                ) : null}
                <div>
                  <p className="font-semibold">{i.name_bn}</p>
                  <p className="text-xs text-primary">{i.title_bn}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => setForm({ ...i })}>
                  <Pencil className="size-4" />
                </Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove.mutate(i.id)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{i.bio_bn}</p>
          </div>
        ))}
      </div>

      <Dialog open={Boolean(form)} onOpenChange={(o) => !o && setForm(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{form?.id ? "শিক্ষক সম্পাদনা" : "নতুন শিক্ষক"}</DialogTitle>
          </DialogHeader>
          {form ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>নাম (বাংলা)</Label>
                <Input value={form.name_bn ?? ""} onChange={(e) => update({ name_bn: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Name (English)</Label>
                <Input value={form.name_en ?? ""} onChange={(e) => update({ name_en: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>পদবি</Label>
                <Input value={form.title_bn ?? ""} onChange={(e) => update({ title_bn: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>পরিচিতি</Label>
                <Textarea rows={3} value={form.bio_bn ?? ""} onChange={(e) => update({ bio_bn: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>ইমেইল</Label>
                <Input value={form.email ?? ""} onChange={(e) => update({ email: e.target.value })} />
              </div>
              <ImageUpload
                label="শিক্ষকের ছবি"
                folder="instructors"
                value={form.photo_url ?? ""}
                onChange={(url) => update({ photo_url: url })}
              />
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setForm(null)}>বাতিল</Button>
            <Button onClick={() => form && save.mutate(form)} disabled={save.isPending}>সংরক্ষণ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
