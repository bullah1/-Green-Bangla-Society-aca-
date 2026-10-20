import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { SiteLayout } from "@/components/site/SiteLayout";
import { CourseCard } from "@/components/site/CourseCard";
import { categoriesQuery, coursesQuery } from "@/lib/api";
import { cn } from "@/lib/utils";

type CoursesSearch = { category?: string | undefined };

export const Route = createFileRoute("/courses")({
  validateSearch: (search: Record<string, unknown>): CoursesSearch => {
    const raw = search["category"];
    return typeof raw === "string" && raw ? { category: raw } : {};
  },
  head: () => ({
    meta: [
      { title: "সব কোর্স — Green Bangla Learning Academy" },
      {
        name: "description",
        content:
          "কুরআন শিক্ষা, ব্যবসা শিক্ষা ও ব্যক্তিগত উন্নয়নের সব কোর্স এক জায়গায়। বিভাগ অনুযায়ী ফিল্টার করে আবেদন করুন।",
      },
      { property: "og:title", content: "সব কোর্স — Green Bangla Learning Academy" },
      {
        property: "og:description",
        content: "বিভাগ অনুযায়ী কোর্স খুঁজে নিন এবং আবেদন করুন।",
      },
    ],
  }),
  component: CoursesPage,
});

function CoursesPage() {
  const { category } = Route.useSearch();
  const { data: categories = [] } = useQuery(categoriesQuery);
  const { data: courses = [], isLoading } = useQuery(coursesQuery(category));

  const active = categories.find((c) => c.slug === category);

  return (
    <SiteLayout>
      <section className="border-b border-border bg-surface">
        <div className="container-page py-12 lg:py-16">
          <h1 className="text-3xl font-semibold sm:text-4xl">
            {active ? active.name_bn : "সব কোর্স"}
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            {active?.description_bn ??
              "আপনার লক্ষ্য অনুযায়ী কোর্স বেছে নিন — প্রতিটি কোর্সে আবেদন করে ভর্তির প্রক্রিয়া শুরু করুন।"}
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            <Link
              to="/courses"
              className={cn(
                "rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors",
                !category ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-accent",
              )}
            >
              সব কোর্স
            </Link>
            {categories.map((c) => {
              const isActive = category === c.slug;
              return (
                <Link
                  key={c.id}
                  to="/courses"
                  search={{ category: c.slug }}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                    isActive ? "text-white" : "border-border bg-card hover:bg-accent",
                  )}
                  style={
                    isActive
                      ? { backgroundColor: c.color, borderColor: c.color, color: "#fff" }
                      : undefined
                  }
                >
                  {c.name_bn}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-y">
        <div className="container-page">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-80 animate-pulse rounded-2xl border border-border bg-muted" />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <p className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">
              এই বিভাগে এখনো কোনো কোর্স যুক্ত করা হয়নি।
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
