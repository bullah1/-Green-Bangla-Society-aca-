import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Facebook, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { BrandLogo } from "@/components/site/BrandLogo";
import { categoriesQuery, settingsMap, settingsQuery } from "@/lib/api";

export function Footer() {
  const { data: settings } = useQuery(settingsQuery);
  const { data: categories = [] } = useQuery(categoriesQuery);
  const s = settingsMap(settings);

  const siteName = s("site_name", "Green Bangla Learning Academy");
  const whatsappIntl = s("contact_whatsapp_intl", "8801834757376");

  return (
    <footer className="border-t border-border bg-surface">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <BrandLogo className="h-16 w-auto" />
            <span className="max-w-40 font-semibold leading-tight">{siteName}</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{s("site_tagline")}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold">দ্রুত লিংক</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-primary">হোম</Link></li>
            <li><Link to="/courses" className="hover:text-primary">সব কোর্স</Link></li>
            <li><Link to="/about" className="hover:text-primary">আমাদের সম্পর্কে</Link></li>
            <li><Link to="/contact" className="hover:text-primary">যোগাযোগ</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">বিভাগসমূহ</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            {categories.map((c) => (
              <li key={c.id}>
                <Link to="/courses" search={{ category: c.slug }} className="hover:text-primary">
                  {c.name_bn}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">যোগাযোগ</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            {s("contact_address") ? (
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" /> {s("contact_address")}
              </li>
            ) : null}
            {s("contact_email") ? (
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
                <a href={`mailto:${s("contact_email")}`} className="hover:text-primary">{s("contact_email")}</a>
              </li>
            ) : null}
            {s("contact_phone") ? (
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 size-4 shrink-0 text-primary" />
                <a href={`tel:+88${s("contact_phone").replace(/[^0-9]/g, "")}`} className="hover:text-primary">
                  {s("contact_phone")}
                </a>
              </li>
            ) : null}
            {s("contact_whatsapp") ? (
              <li className="flex items-start gap-2">
                <MessageCircle className="mt-0.5 size-4 shrink-0 text-primary" />
                <a href={`https://wa.me/${whatsappIntl}`} target="_blank" rel="noreferrer" className="hover:text-primary">
                  {s("contact_whatsapp")}
                </a>
              </li>
            ) : null}
            {s("contact_facebook") ? (
              <li className="flex items-start gap-2">
                <Facebook className="mt-0.5 size-4 shrink-0 text-primary" />
                <a href={s("contact_facebook")} target="_blank" rel="noreferrer" className="hover:text-primary">Facebook</a>
              </li>
            ) : null}
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} {siteName}। সর্বস্বত্ব সংরক্ষিত।</p>
          <Link to="/admin" className="hover:text-primary">অ্যাডমিন</Link>
        </div>
      </div>
    </footer>
  );
}
