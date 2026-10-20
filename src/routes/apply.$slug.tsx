import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { SiteLayout } from "@/components/site/SiteLayout";
import { StorageImage } from "@/components/site/StorageImage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { courseImage, courseQuery, feeLabel, isFreeCourse, settingsMap, settingsQuery } from "@/lib/api";

export const Route = createFileRoute("/apply/$slug")({
  head: () => ({
    meta: [
      { title: "কোর্সে আবেদন — Green Bangla Learning Academy" },
      {
        name: "description",
        content: "কোর্সে ভর্তির জন্য আবেদন ফর্ম পূরণ করুন। অনুমোদনের পর পরবর্তী নির্দেশনা পাবেন।",
      },
      { property: "og:title", content: "কোর্সে আবেদন — Green Bangla Learning Academy" },
      { property: "og:description", content: "সহজ ফর্মে আবেদন জমা দিন।" },
    ],
  }),
  component: ApplyPage,
});

function ApplyPage() {
  const { slug } = Route.useParams();
  const { data: course } = useQuery(courseQuery(slug));
  const { data: settings } = useQuery(settingsQuery);
  const siteSetting = settingsMap(settings);
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);

  const free = course ? isFreeCourse(course) : false;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!course) return;
    const form = new FormData(e.currentTarget);
    const fullName = String(form.get("full_name") ?? "");
    const email = String(form.get("email") ?? "");
    const phone = String(form.get("phone") ?? "");
    const address = String(form.get("address") ?? "");
    const education = String(form.get("education") ?? "");
    const message = String(form.get("message") ?? "");
    const whatsappWindow = window.open("", "_blank");
    setSubmitting(true);

    const { data, error } = await supabase.rpc("submit_application", {
      _course_id: course.id,
      _full_name: fullName,
      _email: email,
      _phone: phone,
      _address: address || null,
      _education: education || null,
      _message: message || null,
    });

    setSubmitting(false);

    if (error) {
      whatsappWindow?.close();
      toast.error("আবেদন জমা দেওয়া যায়নি। তথ্য যাচাই করে আবার চেষ্টা করুন।");
      return;
    }
    const referenceCode = data ?? "—";
    setReference(referenceCode);
    toast.success("আবেদন সফলভাবে জমা হয়েছে।");

    const whatsappMessage = [
      "নতুন কোর্স আবেদন",
      `রেফারেন্স: ${referenceCode}`,
      `কোর্স: ${course.title_bn}`,
      `নাম: ${fullName}`,
      `মোবাইল: ${phone}`,
      `ইমেইল: ${email}`,
      address ? `ঠিকানা: ${address}` : "",
      education ? `শিক্ষাগত যোগ্যতা: ${education}` : "",
      message ? `বার্তা: ${message}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    const whatsappUrl = `https://wa.me/${siteSetting("contact_whatsapp_intl", "8801834757376")}?text=${encodeURIComponent(whatsappMessage)}`;

    if (whatsappWindow) {
      whatsappWindow.location.href = whatsappUrl;
    } else {
      window.location.href = whatsappUrl;
    }
  }

  if (reference) {
    return (
      <SiteLayout>
        <div className="container-page flex justify-center py-20">
          <div className="max-w-lg rounded-3xl border border-border bg-card p-8 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary">
              <CheckCircle2 className="size-7" />
            </span>
            <h1 className="mt-5 text-2xl font-semibold">আবেদন জমা হয়েছে</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              আপনার আবেদন নম্বর <strong className="text-foreground">{reference}</strong>। আমাদের টিম
              আবেদনটি যাচাই করে ইমেইলে সিদ্ধান্ত জানাবে।
              {free
                ? " এই কোর্সে কোনো ফি নেই, অনুমোদনের পর সরাসরি ক্লাস শুরু করতে পারবেন।"
                : ""}
            </p>
            <div className="mt-7 flex justify-center gap-3">
              <Button asChild>
                <Link to="/courses">অন্য কোর্স দেখুন</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/">হোমে ফিরুন</Link>
              </Button>
            </div>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="border-b border-border bg-surface">
        <div className="container-page py-4">
          <nav aria-label="ব্রেডক্রাম্ব" className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-primary">হোম</Link>
            <ChevronRight className="size-3.5" />
            <Link to="/courses" className="hover:text-primary">কোর্স</Link>
            <ChevronRight className="size-3.5" />
            <span className="text-foreground">আবেদন</span>
          </nav>
        </div>
      </div>

      <section className="section-y">
        <div className="container-page grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h1 className="text-2xl font-semibold sm:text-3xl">কোর্সে আবেদন করুন</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              নিচের তথ্যগুলো পূরণ করুন। সব তথ্য গোপনীয় রাখা হবে।
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-6 sm:p-8">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">পূর্ণ নাম *</Label>
                  <Input id="full_name" name="full_name" required placeholder="আপনার নাম" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">মোবাইল নম্বর *</Label>
                  <Input id="phone" name="phone" required placeholder="01XXXXXXXXX" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">ইমেইল *</Label>
                <Input id="email" name="email" type="email" required placeholder="you@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">ঠিকানা</Label>
                <Input id="address" name="address" placeholder="জেলা / এলাকা" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="education">শিক্ষাগত যোগ্যতা</Label>
                <Input id="education" name="education" placeholder="সর্বশেষ পড়াশোনা" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">কেন এই কোর্সে ভর্তি হতে চান?</Label>
                <Textarea id="message" name="message" rows={5} placeholder="সংক্ষেপে লিখুন..." />
              </div>

              <Button type="submit" size="lg" disabled={submitting || !course}>
                {submitting ? "জমা হচ্ছে..." : "আবেদন জমা দিন"}
              </Button>
            </form>
          </div>

          {course ? (
            <aside className="h-fit overflow-hidden rounded-2xl border border-border bg-card">
              <StorageImage
                src={courseImage(course)}
                alt={course.title_bn}
                loading="lazy"
                width={1200}
                height={800}
                className="aspect-[3/2] w-full object-cover"
              />
              <div className="space-y-3 p-6">
                <h2 className="text-base font-semibold">{course.title_bn}</h2>
                <p className="text-sm text-muted-foreground">{course.short_description_bn}</p>
                <ul className="space-y-2 border-t border-border pt-4 text-sm">
                  <li className="flex justify-between"><span className="text-muted-foreground">সময়কাল</span><span>{course.duration_bn}</span></li>
                  <li className="flex justify-between"><span className="text-muted-foreground">ক্লাস</span><span>{course.total_classes} টি</span></li>
                  <li className="flex justify-between"><span className="text-muted-foreground">লেভেল</span><span>{course.level_bn}</span></li>
                  <li className="flex justify-between font-semibold"><span className="text-muted-foreground">ফি</span><span className="text-primary">{feeLabel(course)}</span></li>
                </ul>
              </div>
            </aside>
          ) : null}
        </div>
      </section>
    </SiteLayout>
  );
}
