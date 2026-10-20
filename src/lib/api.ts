import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

import quranImg from "@/assets/course-quran.jpg";
import businessImg from "@/assets/course-business.jpg";
import personalImg from "@/assets/course-personal.jpg";

export type Category = {
  id: string;
  slug: string;
  name_bn: string;
  name_en: string;
  description_bn: string | null;
  description_en: string | null;
  color: string;
  bg_color: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
};

export type Instructor = {
  id: string;
  name_bn: string;
  name_en: string;
  title_bn: string | null;
  title_en: string | null;
  bio_bn: string | null;
  bio_en: string | null;
  photo_url: string | null;
  email: string | null;
  is_active: boolean;
};

export type Course = {
  id: string;
  slug: string;
  category_id: string | null;
  instructor_id: string | null;
  title_bn: string;
  title_en: string;
  short_description_bn: string | null;
  short_description_en: string | null;
  description_bn: string | null;
  description_en: string | null;
  image_url: string | null;
  duration_bn: string | null;
  duration_en: string | null;
  total_classes: number;
  level_bn: string | null;
  level_en: string | null;
  fee: number;
  is_free: boolean;
  is_scholarship: boolean;
  is_featured: boolean;
  is_published: boolean;
  seo_title: string | null;
  seo_description: string | null;
  sort_order: number;
  categories?: Category | null;
  instructors?: Instructor | null;
};

export type Application = {
  id: string;
  reference_code: string;
  course_id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string | null;
  education: string | null;
  message: string | null;
  status: "pending" | "approved" | "rejected" | "enrolled";
  admin_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
  courses?: Pick<Course, "id" | "title_bn" | "slug" | "fee" | "is_free" | "is_scholarship"> | null;
};

export type Payment = {
  id: string;
  application_id: string;
  amount: number;
  method: string | null;
  transaction_ref: string | null;
  status: "pending" | "submitted" | "paid" | "failed" | "waived";
  paid_at: string | null;
  created_at: string;
};

export type SiteSetting = {
  id: string;
  key: string;
  value: string;
  group_name: string;
  label: string;
  input_type: string;
  sort_order: number;
};

export const settingsQuery = queryOptions({
  queryKey: ["site-settings"],
  queryFn: async (): Promise<SiteSetting[]> => {
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .order("group_name")
      .order("sort_order");
    if (error) throw error;
    return (data ?? []) as SiteSetting[];
  },
});

export const settingsMap = (rows: SiteSetting[] | undefined) => {
  const map = new Map((rows ?? []).map((r) => [r.key, r.value]));
  return (key: string, fallback = "") => {
    const v = map.get(key);
    return v === undefined || v === "" ? fallback : v;
  };
};

const COURSE_SELECT =
  "*, categories:category_id(*), instructors:instructor_id(*)";

export const fallbackImage = (categorySlug?: string | null) => {
  switch (categorySlug) {
    case "business-education":
      return businessImg;
    case "personal-development":
      return personalImg;
    default:
      return quranImg;
  }
};

export const courseImage = (course: Course) =>
  course.image_url || fallbackImage(course.categories?.slug);

export const isFreeCourse = (course: Pick<Course, "fee" | "is_free" | "is_scholarship">) =>
  course.is_free || course.is_scholarship || Number(course.fee) <= 0;

export const feeLabel = (course: Pick<Course, "fee" | "is_free" | "is_scholarship">) => {
  if (course.is_scholarship) return "স্কলারশিপ";
  if (isFreeCourse(course)) return "ফ্রি";
  return `৳ ${Number(course.fee).toLocaleString("bn-BD")}`;
};

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order");
    if (error) throw error;
    return (data ?? []) as Category[];
  },
});

export const coursesQuery = (categorySlug?: string) =>
  queryOptions({
    queryKey: ["courses", categorySlug ?? "all"],
    queryFn: async (): Promise<Course[]> => {
      let q = supabase.from("courses").select(COURSE_SELECT).order("sort_order");
      const { data, error } = await q;
      if (error) throw error;
      const rows = (data ?? []) as unknown as Course[];
      return categorySlug
        ? rows.filter((c) => c.categories?.slug === categorySlug)
        : rows;
    },
  });

export const courseQuery = (slug: string) =>
  queryOptions({
    queryKey: ["course", slug],
    queryFn: async (): Promise<Course | null> => {
      const { data, error } = await supabase
        .from("courses")
        .select(COURSE_SELECT)
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as Course) ?? null;
    },
  });

export const curriculumQuery = (courseId: string | undefined) =>
  queryOptions({
    queryKey: ["curriculum", courseId],
    queryFn: async () => {
      if (!courseId) return [];
      const { data, error } = await supabase
        .from("curriculum_items")
        .select("*")
        .eq("course_id", courseId)
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
    enabled: Boolean(courseId),
  });

export const outcomesQuery = (courseId: string | undefined) =>
  queryOptions({
    queryKey: ["outcomes", courseId],
    queryFn: async () => {
      if (!courseId) return [];
      const { data, error } = await supabase
        .from("learning_outcomes")
        .select("*")
        .eq("course_id", courseId)
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
    enabled: Boolean(courseId),
  });

export const instructorsQuery = queryOptions({
  queryKey: ["instructors"],
  queryFn: async (): Promise<Instructor[]> => {
    const { data, error } = await supabase.from("instructors").select("*");
    if (error) throw error;
    return (data ?? []) as Instructor[];
  },
});

export const applicationsQuery = queryOptions({
  queryKey: ["applications"],
  queryFn: async (): Promise<Application[]> => {
    const { data, error } = await supabase
      .from("applications")
      .select("*, courses:course_id(id,title_bn,slug,fee,is_free,is_scholarship)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as Application[];
  },
});

export const paymentsQuery = queryOptions({
  queryKey: ["payments"],
  queryFn: async (): Promise<Payment[]> => {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Payment[];
  },
});
