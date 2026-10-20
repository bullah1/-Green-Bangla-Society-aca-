import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const key = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? "";
        const url = process.env["SUPABASE_URL"] ?? "";

        let slugs: string[] = [];
        if (key && url) {
          const client = createClient(url, key, {
            auth: { persistSession: false, autoRefreshToken: false },
            global: {
              fetch: (input, init) => {
                const h = new Headers(init?.headers);
                if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
                  h.delete("Authorization");
                }
                h.set("apikey", key);
                return fetch(input, { ...init, headers: h });
              },
            },
          });
          const { data } = await client.from("courses").select("slug").eq("is_published", true);
          slugs = (data ?? []).map((row: { slug: string }) => row.slug);
        }

        const staticPaths = ["/", "/courses", "/about", "/contact"];
        const entries = [
          ...staticPaths.map((p) => `${origin}${p}`),
          ...slugs.map((s) => `${origin}/course/${s}`),
        ];

        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map((loc) => `  <url><loc>${loc}</loc></url>`).join("\n")}
</urlset>`;

        return new Response(body, {
          headers: { "content-type": "application/xml; charset=utf-8" },
        });
      },
    },
  },
});
