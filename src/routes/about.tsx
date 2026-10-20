import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart, ShieldCheck, Target } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { instructorsQuery } from "@/lib/api";
import { StorageImage } from "@/components/site/StorageImage";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "আমাদের সম্পর্কে — Green Bangla Learning Academy" },
      {
        name: "description",
        content:
          "Green Bangla Learning Academy কুরআন, ব্যবসা ও ব্যক্তিগত উন্নয়নে মানসম্মত শিক্ষা পৌঁছে দিতে কাজ করছে।",
      },
      { property: "og:title", content: "আমাদের সম্পর্কে — Green Bangla Learning Academy" },
      { property: "og:description", content: "আমাদের লক্ষ্য, মূল্যবোধ ও শিক্ষকমণ্ডলী সম্পর্কে জানুন।" },
    ],
  }),
  component: AboutPage,
});

const values = [
  { icon: Target, title: "আমাদের লক্ষ্য", text: "প্রত্যেক শিক্ষার্থীর জন্য মানসম্মত শিক্ষা সহজলভ্য করা।" },
  { icon: Heart, title: "আমাদের মূল্যবোধ", text: "সততা, যত্ন ও ধারাবাহিকতা — শেখার প্রতিটি ধাপে।" },
  { icon: ShieldCheck, title: "আমাদের প্রতিশ্রুতি", text: "স্বচ্ছ ভর্তি প্রক্রিয়া এবং শিক্ষার্থীর তথ্যের সুরক্ষা।" },
];

function AboutPage() {
  const { data: instructors = [] } = useQuery(instructorsQuery);

  return (
    <SiteLayout>
      <section className="border-b border-border bg-surface">
        <div className="container-page py-14 lg:py-20">
          <h1 className="max-w-3xl text-3xl font-semibold leading-snug sm:text-4xl">
            আমরা বিশ্বাস করি — সঠিক শিক্ষা জীবন বদলে দেয়
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground">
            Green Bangla Learning Academy কুরআন শিক্ষা, ব্যবসা শিক্ষা এবং ব্যক্তিগত উন্নয়ন —
            এই তিনটি ক্ষেত্রে বাংলাভাষী শিক্ষার্থীদের জন্য কাঠামোবদ্ধ, প্রায়োগিক ও সাশ্রয়ী কোর্স
            পরিচালনা করে। আমাদের প্রতিটি ব্যাচ ছোট রাখা হয়, যাতে শিক্ষক প্রত্যেক শিক্ষার্থীকে
            ব্যক্তিগতভাবে সময় দিতে পারেন।
          </p>
        </div>
      </section>

      <section className="section-y">
        <div className="container-page grid gap-5 md:grid-cols-3">
          {values.map((v) => (
            <div key={v.title} className="rounded-2xl border border-border bg-card p-7">
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <v.icon className="size-5" />
              </span>
              <h2 className="mt-4 text-lg font-semibold">{v.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface section-y">
        <div className="container-page">
          <h2 className="text-2xl font-semibold sm:text-3xl">শিক্ষকমণ্ডলী</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {instructors.map((i) => (
              <div key={i.id} className="rounded-2xl border border-border bg-card p-6">
                {i.photo_url ? (
                  <StorageImage src={i.photo_url} alt={i.name_bn} loading="lazy" className="size-14 rounded-full border border-border object-cover" />
                ) : (
                  <span className="flex size-14 items-center justify-center rounded-full bg-primary-soft text-lg font-semibold text-primary">
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

      <section className="section-y">
        <div className="container-page flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-border bg-card p-8">
          <div>
            <h2 className="text-xl font-semibold">আপনার যাত্রা শুরু করুন</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              পছন্দের কোর্স বেছে নিয়ে আবেদন জমা দিন।
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link to="/courses">কোর্স দেখুন</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/contact">যোগাযোগ</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
