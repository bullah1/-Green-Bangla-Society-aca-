import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type AdminContext = {
  supabase: {
    rpc: (
      fn: string,
      args: Record<string, unknown>,
    ) => Promise<{ data: unknown; error: { message: string } | null }>;
  };
  userId: string;
};

async function assertAdmin(context: AdminContext) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || !data) throw new Error("শুধু অ্যাডমিন এই কাজটি করতে পারবেন।");
}

export const listAdminUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as unknown as AdminContext);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: roles, error: rolesError } = await supabaseAdmin
      .from("user_roles")
      .select("user_id, created_at")
      .eq("role", "admin")
      .order("created_at", { ascending: true });
    if (rolesError) throw new Error(rolesError.message);

    const ids = (roles ?? []).map((r) => r.user_id);
    if (ids.length === 0) return [];

    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email, created_at")
      .in("id", ids);
    if (profilesError) throw new Error(profilesError.message);

    return (profiles ?? []).map((p) => ({
      id: p.id,
      full_name: p.full_name ?? "",
      email: p.email ?? "",
      created_at: p.created_at,
    }));
  });

export const createAdminUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        full_name: z.string().trim().min(1, "নাম দিন।"),
        email: z.string().trim().email("সঠিক ইমেইল দিন।"),
        password: z.string().min(8, "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।"),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as unknown as AdminContext);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.full_name },
    });
    if (createError) throw new Error(createError.message);
    const userId = created.user?.id;
    if (!userId) throw new Error("অ্যাকাউন্ট তৈরি করা যায়নি।");

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({ id: userId, full_name: data.full_name, email: data.email });
    if (profileError) throw new Error(profileError.message);

    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
    if (roleError) throw new Error(roleError.message);

    return { id: userId };
  });
