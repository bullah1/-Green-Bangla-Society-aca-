import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { StorageImage } from "@/components/site/StorageImage";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, ChevronRight, Clock, Layers, Signal } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  courseImage,
  courseQuery,
  curriculumQuery,
  feeLabel,
  isFreeCourse,
  outcomesQuery,
} from "@/lib/api";

export const Route = createFileRoute("/course/$slug")({
  loader: async ({ context, params }) => {
    const course = await context.queryClient.ensureQueryData(courseQuery(params.slug));
    if (!course) throw notFound();
    return { course };
  },
  head: ({ loaderData }) => {
    const course = loaderData?.course;
    const title = course
      ? course.seo_title || `${course.title_bn} — Green Bangla Learning Academy`
      : "কোর্স বিস্তারিত — Green Bangla Learning Academy";
    const description =
      course?.seo_description ||
      course?.short_description_bn ||
      "কোর্সের কারিকুলাম, সময়কাল, ক্লাস সংখ্যা, শিক্ষক ও ফি দেখে আবেদন করুন।";
    const image =
      course?.image_url && /^https?:\/\//.test(course.image_url) ? course.image_url : undefined;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        ...(image ? [{ property: "og:image", content: image }] : []),
      ],
    };
  },
  component: CourseDetailPage,
  notFoundComponent: () => (
    <SiteLayout>
      <div className="container-page py-24 text-center">
        <h1 className="text-2xl font-semibold">কোর্সটি পাওয়া যায়নি</h1>
        <Button asChild className="mt-6">
          <Link to="/courses">সব কোর্স দেখুন</Link>
        </Button>
      </div>
    </SiteLayout>
  ),
});

function CourseDetailPage() {
  const { slug } = Route.useParams();
  const loaderData = Route.useLoaderData();
  const { data: course, isLoading } = useQuery({
    ...courseQuery(slug),
    initialData: loaderData.course,
  });
  const { data: curriculum = [] } = useQuery(curriculumQuery(course?.id));
  const { data: outcomes = [] } = useQuery(outcomesQuery(course?.id));

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="container-page py-24">
          <div className="h-64 animate-pulse rounded-3xl bg-muted" />
        </div>
      </SiteLayout>
    );
  }

  if (!course) throw notFound();

  const category = course.categories;
  const instructor = course.instructors;
  const free = isFreeCourse(course);

  return (
    <SiteLayout>
      <div className="border-b border-border bg-surface">
        <div className="container-page py-4">
          <nav aria-label="ব্রেডক্রাম্ব" className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-primary">হোম</Link>
            <ChevronRight className="size-3.5" />
            <Link to="/courses" className="hover:text-primary">কোর্স</Link>
            {category ? (
              <>
                <ChevronRight className="size-3.5" />
                <Link to="/courses" search={{ category: category.slug }} className="hover:text-primary">
                  {category.name_bn}
                </Link>
              </>
            ) : null}
            <ChevronRight className="size-3.5" />
            <span className="text-foreground">{course.title_bn}</span>
          </nav>
        </div>
      </div>

      <section className="border-b border-border bg-surface">
        <div className="container-page grid gap-10 py-10 lg:grid-cols-[1.4fr_1fr] lg:py-14">
          <div>
            {category ? (
              <span
                className="inline-block rounded-full px-3 py-1 text-xs font-medium"
                style={{ backgroundColor: category.bg_color, color: category.color }}
              >
                {category.name_bn}
              </span>
            ) : null}
            <h1 className="mt-4 text-3xl font-semibold leading-snug sm:text-4xl">
              {course.title_bn}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
              {course.short_description_bn}
            </p>

            <dl className="mt-8 grid max-w-xl grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { icon: Clock, label: "সময়কাল", value: course.duration_bn },
                { icon: Layers, label: "মোট ক্লাস", value: `${course.total_classes} টি` },
                { icon: Signal, label: "লেভেল", value: course.level_bn },
                { icon: CheckCircle2, label: "কোর্স ফি", value: feeLabel(course) },
              ].map((m) => (
                <div key={m.label} className="rounded-xl border border-border bg-card p-4">
                  <m.icon className="size-4 text-primary" />
                  <dt className="mt-2 text-[11px] text-muted-foreground">{m.label}</dt>
                  <dd className="text-sm font-semibold">{m.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border shadow-[var(--shadow-card)]">
            <StorageImage
              src={courseImage(course)}
              alt={course.title_bn}
              width={1200}
              height={800}
              className="aspect-[3/2] w-full object-cover"
            />
            <div className="space-y-4 bg-card p-6">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">কোর্স ফি</span>
                <span className="text-2xl font-semibold text-primary">{feeLabel(course)}</span>
              </div>
              <Button asChild size="lg" className="w-full">
                <Link to="/apply/$slug" params={{ slug: course.slug }}>আবেদন করুন</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="section-y">
        <div className="container-page grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-12">
            <div>
              <h2 className="text-xl font-semibold">কোর্স পরিচিতি</h2>
              <p className="mt-4 whitespace-pre-line leading-relaxed text-muted-foreground">
                {course.description_bn}
              </p>
            </div>

            {outcomes.length ? (
              <div>
                <h2 className="text-xl font-semibold">যা শিখবেন</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {outcomes.map((o) => (
                    <li key={o.id} className="flex gap-2.5 rounded-xl border border-border bg-card p-4 text-sm">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                      {o.text_bn}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {curriculum.length ? (
              <div>
                <h2 className="text-xl font-semibold">কারিকুলাম</h2>
                <Accordion type="single" collapsible className="mt-4 rounded-2xl border border-border bg-card px-5">
                  {curriculum.map((item) => (
                    <AccordionItem key={item.id} value={item.id}>
                      <AccordionTrigger className="text-left text-sm font-medium">
                        {item.title_bn}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">
                        {item.description_bn}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ) : null}
          </div>

          <aside className="space-y-6">
            {instructor ? (
              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="text-sm font-semibold text-muted-foreground">কোর্স পরিচালনায়</h2>
                <div className="mt-4 flex items-center gap-3">
                  {instructor.photo_url ? (
                    <StorageImage src={instructor.photo_url} alt={instructor.name_bn} className="size-12 rounded-full border border-border object-cover" />
                  ) : (
                    <span className="flex size-12 items-center justify-center rounded-full bg-primary-soft font-semibold text-primary">
                      {instructor.name_bn.slice(0, 1)}
                    </span>
                  )}
                  <div>
                    <p className="font-semibold">{instructor.name_bn}</p>
                    <p className="text-xs text-primary">{instructor.title_bn}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {instructor.bio_bn}
                </p>
              </div>
            ) : null}

            <div className="rounded-2xl border border-border bg-primary-soft p-6">
              <h2 className="text-base font-semibold text-primary">ভর্তি প্রক্রিয়া</h2>
              <ol className="mt-4 space-y-3 text-sm text-foreground">
                <li>১. আবেদন ফর্ম পূরণ করুন</li>
                <li>২. আমাদের টিম আবেদন যাচাই করবে</li>
                <li>৩. অনুমোদনের পর নির্দেশনা পাবেন</li>
                <li>{free ? "৪. সরাসরি ক্লাস শুরু (ফি প্রযোজ্য নয়)" : "৪. ফি পরিশোধ করে ভর্তি নিশ্চিত"}</li>
              </ol>
              <Button asChild className="mt-5 w-full">
                <Link to="/apply/$slug" params={{ slug: course.slug }}>আবেদন করুন</Link>
              </Button>
            </div>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}
