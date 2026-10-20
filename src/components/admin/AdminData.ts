import { supabase } from "@/integrations/supabase/client";

export const statusLabel: Record<string, string> = {
  pending: "অপেক্ষমাণ",
  approved: "অনুমোদিত",
  rejected: "বাতিল",
  enrolled: "ভর্তি সম্পন্ন",
};

export const paymentStatusLabel: Record<string, string> = {
  pending: "অপেক্ষমাণ",
  submitted: "জমা দেওয়া",
  paid: "পরিশোধিত",
  failed: "ব্যর্থ",
  waived: "মওকুফ",
};

export const statusTone: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  approved: "bg-primary-soft text-primary",
  rejected: "bg-destructive/10 text-destructive",
  enrolled: "bg-gold/20 text-gold-foreground",
  submitted: "bg-muted text-muted-foreground",
  paid: "bg-primary-soft text-primary",
  failed: "bg-destructive/10 text-destructive",
  waived: "bg-gold/20 text-gold-foreground",
};

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60) || `course-${Date.now()}`;

export async function isCurrentUserAdmin() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return false;
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userData.user.id,
    _role: "admin",
  });
  if (error) return false;
  return Boolean(data);
}
