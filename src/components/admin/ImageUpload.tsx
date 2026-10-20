import { useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { StorageImage } from "@/components/site/StorageImage";

type Props = {
  label?: string;
  folder?: string;
  value: string;
  onChange: (url: string) => void;
};

export function ImageUpload({ label = "ছবি", folder = "uploads", value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("শুধু ছবি ফাইল আপলোড করা যাবে।");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("ছবির আকার সর্বোচ্চ ৫ MB হতে পারে।");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${folder}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("media").upload(path, file, {
        cacheControl: "31536000",
        upsert: false,
      });
      if (error) throw error;
      onChange(`media:${path}`);
      toast.success("ছবি আপলোড হয়েছে।");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "আপলোড করা যায়নি।");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-start gap-3">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
          {value ? (
            <>
              <StorageImage src={value} alt="ছবির প্রিভিউ" className="size-full object-cover" />
              <button
                type="button"
                onClick={() => onChange("")}
                className="absolute right-1 top-1 rounded-full bg-background/90 p-1 text-destructive"
                aria-label="ছবি সরান"
              >
                <X className="size-3" />
              </button>
            </>
          ) : (
            <span className="flex size-full items-center justify-center text-xs text-muted-foreground">
              নেই
            </span>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            {uploading ? "আপলোড হচ্ছে..." : "ছবি আপলোড করুন"}
          </Button>
          <Input
            placeholder="অথবা ছবির লিংক দিন"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
