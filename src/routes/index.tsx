import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  GraduationCap,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { CourseCard } from "@/components/site/CourseCard";
import { Button } from "@/components/ui/button";
import { categoriesQuery, coursesQuery, instructorsQuery, settingsMap, settingsQuery } from "@/lib/api";
import { StorageImage } from "@/components/site/StorageImage";
import heroImage from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Green Bangla Learning Academy — কুরআন, ব্যবসা ও ব্যক্তিগত উন্নয়ন কোর্স" },
      {
        name: "description",
        content:
          "কুরআন শিক্ষা, ব্যবসা শিক্ষা ও ব্যক্তিগত উন্নয়নের মানসম্মত অনলাইন কোর্স। আবেদন করুন, অনুমোদনের পর ভর্তি হোন।",
      },
      { property: "og:title", content: "Green Bangla Learning Academy" },
      {
        property: "og:description",
        content: "কুরআন, ব্যবসা এবং ব্যক্তিগত উন্নয়নে প্রয়োজনীয় জ্ঞান ও দক্ষতা অর্জন করুন।",
      },
    ],
  }),
  component: HomePage,
});

const categoryIcon = (icon: string) => {
  if (icon === "Briefcase") return Briefcase;
  if (icon === "Sparkles") return Sparkles;
  return BookOpen;
};

const reasons = [
  {
    icon: Award,
    title: "অভিজ্ঞ শিক্ষকমণ্ডলী",
    text: "প্রতিটি বিষয়ে দীর্ঘ অভিজ্ঞতাসম্পন্ন শিক্ষকের সরাসরি তত্ত্বাবধান।",
  },
  {
    icon: Users,
    title: "ছোট ব্যাচ",
    text: "সীমিত আসনে ব্যক্তিগত মনোযোগ ও নিয়মিত ফিডব্যাক নিশ্চিত করা হয়।",
  },
  {
    icon: CheckCircle2,
    title: "যাচাই করা ভর্তি প্রক্রিয়া",
    text: "আবেদন পর্যালোচনার পর উপযুক্ত শিক্ষার্থীদের ভর্তির সুযোগ।",
  },
  {
    icon: GraduationCap,
    title: "স্কলারশিপ সুবিধা",
    text: "নির্বাচিত কোর্সে সম্পূর্ণ ফ্রি বা স্কলারশিপে অংশগ্রহণের সুযোগ।",
  },
];

const steps = [
  { icon: BookOpen, title: "কোর্স বাছাই", text: "আপনার লক্ষ্য অনুযায়ী উপযুক্ত কোর্স নির্বাচন করুন।" },
  { icon: ClipboardList, title: "আবেদন জমা", text: "সংক্ষিপ্ত ফর্ম পূরণ করে আবেদন পাঠান।" },
  { icon: UserCheck, title: "অনুমোদন", text: "আমাদের টিম আবেদন যাচাই করে সিদ্ধান্ত জানাবে।" },
  { icon: CreditCard, title: "পেমেন্ট ও ভর্তি", text: "অনুমোদনের পর ফি পরিশোধ করে ক্লাস শুরু করুন। ফ্রি কোর্সে পেমেন্ট লাগবে না।" },
];

function HomePage() {
  const { data: categories = [] } = useQuery(categoriesQuery);
  const { data: courses = [] } = useQuery(coursesQuery());
  const { data: instructors = [] } = useQuery(instructorsQuery);
  const { data: settings } = useQuery(settingsQuery);
  const s = settingsMap(settings);

  const featured = courses.filter((c) => c.is_featured).slice(0, 6);
  const shown = featured.length ? featured : courses.slice(0, 6);

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="border-b border-border bg-surface">
        <div className="container-page grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3.5 py-1.5 text-xs font-medium text-primary">
              <Sparkles className="size-3.5" /> {s("hero_badge", "নতুন ব্যাচে ভর্তি চলছে")}
            </span>
            <h1 className="mt-5 text-3xl font-semibold leading-[1.25] sm:text-4xl lg:text-5xl">
              {s("hero_title", "শিক্ষায় নতুন দিগন্ত আবিষ্কার করুন")}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
              {s("hero_subtitle", "কুরআন, ব্যবসা এবং ব্যক্তিগত উন্নয়নে প্রয়োজনীয় জ্ঞান ও দক্ষতা অর্জন করুন।")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/courses">{s("hero_primary_cta", "কোর্স দেখুন")}</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/about">{s("hero_secondary_cta", "আমাদের সম্পর্কে জানুন")}</Link>
              </Button>
            </div>

            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-border pt-6">
              <div>
                <dt className="text-xs text-muted-foreground">কোর্স</dt>
                <dd className="text-xl font-semibold">{courses.length}+</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">বিভাগ</dt>
                <dd className="text-xl font-semibold">{categories.length}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">শিক্ষক</dt>
                <dd className="text-xl font-semibold">{instructors.length}</dd>
              </div>
            </dl>
          </div>

          <div className="overflow-hidden rounded-3xl border border-border shadow-[var(--shadow-lift)]">
            <StorageImage
              src={s("hero_banner_image", heroImage)}
              alt="শিক্ষার্থীরা একসাথে পড়াশোনা করছে"
              width={1600}
              height={1104}
              className="size-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="section-y">
        <div className="container-page">
          <h2 className="text-2xl font-semibold sm:text-3xl">কেন আমাদের বেছে নেবেন</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            শেখার প্রতিটি ধাপে সহজ, স্বচ্ছ ও মানসম্মত অভিজ্ঞতা নিশ্চিত করি।
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {reasons.map((r) => (
              <div key={r.title} className="rounded-2xl border border-border bg-card p-6">
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <r.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-y border-border bg-surface section-y">
        <div className="container-page">
          <h2 className="text-2xl font-semibold sm:text-3xl">কোর্স বিভাগ</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {categories.map((c) => {
              const Icon = categoryIcon(c.icon);
              return (
                <Link
                  key={c.id}
                  to="/courses"
                  search={{ category: c.slug }}
                  className="rounded-2xl border border-border bg-card p-7 transition-shadow hover:shadow-[var(--shadow-lift)]"
                >
                  <span
                    className="flex size-12 items-center justify-center rounded-xl"
                    style={{ backgroundColor: c.bg_color, color: c.color }}
                  >
                    <Icon className="size-6" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold">{c.name_bn}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {c.description_bn}
                  </p>
                  <span className="mt-5 inline-block text-sm font-medium" style={{ color: c.color }}>
                    কোর্স দেখুন →
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured courses */}
      <section className="section-y">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold sm:text-3xl">জনপ্রিয় কোর্সসমূহ</h2>
              <p className="mt-3 text-muted-foreground">শিক্ষার্থীদের পছন্দের কোর্সগুলো দেখে নিন।</p>
            </div>
            <Button asChild variant="outline">
              <Link to="/courses">সব কোর্স</Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border bg-surface section-y">
        <div className="container-page">
          <h2 className="text-2xl font-semibold sm:text-3xl">কীভাবে কাজ করে</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.title} className="relative rounded-2xl border border-border bg-card p-6">
                <span className="absolute right-5 top-5 text-3xl font-semibold text-primary-soft">
                  {i + 1}
                </span>
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <s.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instructors */}
      <section className="section-y">
        <div className="container-page">
          <h2 className="text-2xl font-semibold sm:text-3xl">আমাদের শিক্ষকমণ্ডলী</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {instructors.map((i) => (
              <div key={i.id} className="rounded-2xl border border-border bg-card p-6 text-center">
                {i.photo_url ? (
                  <StorageImage src={i.photo_url} alt={i.name_bn} loading="lazy" className="mx-auto size-16 rounded-full border border-border object-cover" />
                ) : (
                  <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary-soft text-lg font-semibold text-primary">
                    {i.name_bn.slice(0, 1)}
                  </span>
                )}
                <h3 className="mt-4 text-base font-semibold">{i.name_bn}</h3>
                <p className="text-sm text-primary">{i.title_bn}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{i.bio_bn}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20">
        <div className="container-page">
          <div className="rounded-3xl bg-primary px-6 py-14 text-center text-primary-foreground sm:px-12">
            <h2 className="text-2xl font-semibold sm:text-3xl">{s("cta_title", "আজই আবেদন করুন")}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed opacity-90">
              {s("cta_text", "পছন্দের কোর্সে আবেদন জমা দিন। আমাদের টিম যাচাই করে দ্রুত আপনাকে জানাবে।")}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link to="/courses">কোর্স দেখুন</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/contact">যোগাযোগ করুন</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
