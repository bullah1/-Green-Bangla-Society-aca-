import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Save, Trash2 } from "lucide-react";
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
import { settingsQuery, type SiteSetting } from "@/lib/api";
import { ImageUpload } from "./ImageUpload";

const groupLabel: Record<string, string> = {
  general: "সাধারণ তথ্য",
  hero: "হোম পেজ হিরো",
  home: "হোম পেজ সেকশন",
  contact: "যোগাযোগের তথ্য",
};

export function SettingsAdmin() {
  const qc = useQueryClient();
  const { data: settings = [] } = useQuery(settingsQuery);
  const [values, setValues] = useState<Record<string, string>>({});
  const [newItem, setNewItem] = useState<Partial<SiteSetting> | null>(null);

  useEffect(() => {
    setValues(Object.fromEntries(settings.map((s) => [s.key, s.value])));
  }, [settings]);

  const save = useMutation({
    mutationFn: async () => {
      const changed = settings.filter((s) => (values[s.key] ?? s.value) !== s.value);
      for (const s of changed) {
        const { error } = await supabase
          .from("site_settings")
          .update({ value: values[s.key] ?? "" })
          .eq("id", s.id);
        if (error) throw error;
      }
      return changed.length;
    },
    onSuccess: (count) => {
      qc.invalidateQueries({ queryKey: ["site-settings"] });
      toast.success(count ? `${count} টি তথ্য সংরক্ষিত হয়েছে।` : "কোনো পরিবর্তন ছিল না।");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const create = useMutation({
    mutationFn: async (item: Partial<SiteSetting>) => {
      const { error } = await supabase.from("site_settings").insert({
        key: (item.key ?? "").trim(),
        value: item.value ?? "",
        label: item.label || item.key || "",
        group_name: item.group_name || "general",
        input_type: item.input_type || "text",
        sort_order: Number(item.sort_order ?? 99),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site-settings"] });
      setNewItem(null);
      toast.success("নতুন তথ্য যুক্ত হয়েছে।");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("site_settings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site-settings"] });
      toast.success("মুছে ফেলা হয়েছে।");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const groups = Array.from(new Set(settings.map((s) => s.group_name)));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">সাইট তথ্য ব্যবস্থাপনা</h2>
          <p className="text-sm text-muted-foreground">
            এখানে পরিবর্তন করলে সাথে সাথেই ওয়েবসাইটে দেখা যাবে।
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setNewItem({ group_name: "general", input_type: "text" })}>
            <Plus className="size-4" /> নতুন ফিল্ড
          </Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            <Save className="size-4" /> সব সংরক্ষণ
          </Button>
        </div>
      </div>

      {groups.map((g) => (
        <div key={g} className="rounded-2xl border border-border bg-card p-6">
          <h3 className="text-base font-semibold">{groupLabel[g] ?? g}</h3>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {settings
              .filter((s) => s.group_name === g)
              .map((s) => (
                <div key={s.id} className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor={s.key}>{s.label || s.key}</Label>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7 text-destructive"
                      onClick={() => remove.mutate(s.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                  {s.input_type === "image" ? (
                    <ImageUpload
                      label=""
                      folder="site"
                      value={values[s.key] ?? ""}
                      onChange={(url) => setValues((v) => ({ ...v, [s.key]: url }))}
                    />
                  ) : s.input_type === "textarea" ? (
                    <Textarea
                      id={s.key}
                      rows={3}
                      value={values[s.key] ?? ""}
                      onChange={(e) => setValues((v) => ({ ...v, [s.key]: e.target.value }))}
                    />
                  ) : (
                    <Input
                      id={s.key}
                      value={values[s.key] ?? ""}
                      onChange={(e) => setValues((v) => ({ ...v, [s.key]: e.target.value }))}
                    />
                  )}
                  <p className="text-xs text-muted-foreground">{s.key}</p>
                </div>
              ))}
          </div>
        </div>
      ))}

      <Dialog open={Boolean(newItem)} onOpenChange={(o) => !o && setNewItem(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>নতুন তথ্য ফিল্ড</DialogTitle>
          </DialogHeader>
          {newItem ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>কী (ইংরেজি, ইউনিক)</Label>
                <Input
                  value={newItem.key ?? ""}
                  onChange={(e) => setNewItem((n) => ({ ...n, key: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>লেবেল</Label>
                <Input
                  value={newItem.label ?? ""}
                  onChange={(e) => setNewItem((n) => ({ ...n, label: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>গ্রুপ</Label>
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={newItem.group_name ?? "general"}
                  onChange={(e) => setNewItem((n) => ({ ...n, group_name: e.target.value }))}
                >
                  <option value="general">সাধারণ তথ্য</option>
                  <option value="hero">হোম পেজ হিরো</option>
                  <option value="home">হোম পেজ সেকশন</option>
                  <option value="contact">যোগাযোগের তথ্য</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>ধরন</Label>
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={newItem.input_type ?? "text"}
                  onChange={(e) => setNewItem((n) => ({ ...n, input_type: e.target.value }))}
                >
                  <option value="text">এক লাইন</option>
                  <option value="textarea">একাধিক লাইন</option>
                </select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>মান</Label>
                <Textarea
                  rows={2}
                  value={newItem.value ?? ""}
                  onChange={(e) => setNewItem((n) => ({ ...n, value: e.target.value }))}
                />
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNewItem(null)}>বাতিল</Button>
            <Button
              onClick={() => newItem?.key && create.mutate(newItem)}
              disabled={create.isPending}
            >
              যুক্ত করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
