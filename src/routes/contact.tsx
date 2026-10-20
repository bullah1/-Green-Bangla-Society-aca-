import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { settingsMap, settingsQuery } from "@/lib/api";
import { Clock, Facebook, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { toast } from "sonner";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "যোগাযোগ — Green Bangla Learning Academy" },
      {
        name: "description",
        content: "কোর্স, ভর্তি বা স্কলারশিপ সংক্রান্ত যেকোনো প্রশ্নে আমাদের সাথে যোগাযোগ করুন।",
      },
      { property: "og:title", content: "যোগাযোগ — Green Bangla Learning Academy" },
      { property: "og:description", content: "আমাদের ঠিকানা, ইমেইল ও ফোন নম্বর।" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sending, setSending] = useState(false);
  const { data: settings } = useQuery(settingsQuery);
  const s = settingsMap(settings);

  const items: { icon: typeof MapPin; label: string; value: string; href?: string }[] = [
    { icon: MapPin, label: "ঠিকানা", value: s("contact_address") },
    { icon: Mail, label: "ইমেইল", value: s("contact_email"), href: `mailto:${s("contact_email")}` },
    {
      icon: Phone,
      label: "ফোন",
      value: s("contact_phone"),
      href: `tel:+88${s("contact_phone").replace(/[^0-9]/g, "")}`,
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: s("contact_whatsapp"),
      href: `https://wa.me/${s("contact_whatsapp_intl", "8801834757376")}`,
    },
    {
      icon: Facebook,
      label: "Facebook",
      value: s("site_name", "Green Bangla Learning Academy"),
      href: s("contact_facebook"),
    },
    { icon: Clock, label: "অফিস সময়", value: s("contact_hours") },
  ].filter((i) => Boolean(i.value));

  return (
    <SiteLayout>
      <section className="border-b border-border bg-surface">
        <div className="container-page py-12 lg:py-16">
          <h1 className="text-3xl font-semibold sm:text-4xl">যোগাযোগ করুন</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            {s("contact_intro", "কোর্স, ভর্তি প্রক্রিয়া কিংবা স্কলারশিপ নিয়ে প্রশ্ন থাকলে জানান — আমরা দ্রুত উত্তর দেব।")}
          </p>
        </div>
      </section>

      <section className="section-y">
        <div className="container-page grid gap-8 lg:grid-cols-[1fr_1.3fr]">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.label} className="flex gap-4 rounded-2xl border border-border bg-card p-5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <item.icon className="size-5" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noreferrer" : undefined} className="mt-0.5 block text-sm font-medium hover:text-primary">
                      {item.value}
                    </a>
                  ) : (
                    <p className="mt-0.5 text-sm font-medium">{item.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <form
            className="space-y-5 rounded-2xl border border-border bg-card p-6 sm:p-8"
            onSubmit={(e) => {
              e.preventDefault();
              setSending(true);
              setTimeout(() => {
                setSending(false);
                (e.target as HTMLFormElement).reset();
                toast.success("ধন্যবাদ! আপনার বার্তা গ্রহণ করা হয়েছে।");
              }, 600);
            }}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">নাম</Label>
                <Input id="name" required placeholder="আপনার পূর্ণ নাম" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">ইমেইল</Label>
                <Input id="email" type="email" required placeholder="you@example.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">বিষয়</Label>
              <Input id="subject" required placeholder="কোন বিষয়ে জানতে চান?" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="msg">বার্তা</Label>
              <Textarea id="msg" required rows={6} placeholder="আপনার বার্তা লিখুন..." />
            </div>
            <Button type="submit" size="lg" disabled={sending}>
              {sending ? "পাঠানো হচ্ছে..." : "বার্তা পাঠান"}
            </Button>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}
