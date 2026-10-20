import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { categoriesQuery } from "@/lib/api";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/site/BrandLogo";

const navLinkClass =
  "text-sm font-medium text-muted-foreground transition-colors hover:text-primary";

export function Navbar() {
  const { data: categories = [] } = useQuery(categoriesQuery);
  const [open, setOpen] = useState(false);
  const [mobileCoursesOpen, setMobileCoursesOpen] = useState(true);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/90 backdrop-blur supports-[backdrop-filter]:bg-surface/75">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5" aria-label="Green Bangla Learning Academy — হোম">
          <BrandLogo className="h-12 w-auto" priority />
          <span className="leading-tight">
            <span className="block text-sm font-semibold text-foreground">
              Green Bangla
            </span>
            <span className="block text-[11px] text-muted-foreground">
              Learning Academy
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          <Link to="/" className={navLinkClass} activeProps={{ className: "text-primary" }}>
            হোম
          </Link>

          <div className="group relative">
            <button className={cn(navLinkClass, "flex items-center gap-1")}>
              কোর্সসমূহ <ChevronDown className="size-4" />
            </button>
            <div className="invisible absolute left-1/2 top-full w-64 -translate-x-1/2 pt-3 opacity-0 transition group-hover:visible group-hover:opacity-100">
              <div className="overflow-hidden rounded-xl border border-border bg-popover shadow-[var(--shadow-card)]">
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    to="/courses"
                    search={{ category: c.slug }}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-foreground transition-colors hover:bg-accent"
                  >
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: c.color }}
                    />
                    {c.name_bn}
                  </Link>
                ))}
                <Link
                  to="/courses"
                  className="block border-t border-border px-4 py-3 text-sm font-medium text-primary hover:bg-accent"
                >
                  সব কোর্স
                </Link>
              </div>
            </div>
          </div>

          <Link to="/about" className={navLinkClass} activeProps={{ className: "text-primary" }}>
            আমাদের সম্পর্কে
          </Link>
          <Link to="/contact" className={navLinkClass} activeProps={{ className: "text-primary" }}>
            যোগাযোগ
          </Link>
        </nav>

        <div className="hidden lg:block">
          <Button asChild>
            <Link to="/courses">কোর্স দেখুন</Link>
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon" aria-label="মেনু খুলুন">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[86vw] max-w-sm p-0">
            <div className="flex h-16 items-center justify-between border-b border-border px-5">
              <span className="font-semibold">মেনু</span>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="বন্ধ করুন">
                <X className="size-5" />
              </Button>
            </div>
            <div className="flex flex-col gap-1 p-4">
              <Link to="/" onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-base font-medium hover:bg-accent">
                হোম
              </Link>

              <Collapsible open={mobileCoursesOpen} onOpenChange={setMobileCoursesOpen}>
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-base font-medium hover:bg-accent">
                  কোর্সসমূহ
                  <ChevronDown
                    className={cn("size-4 transition-transform", mobileCoursesOpen && "rotate-180")}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="ml-3 flex flex-col border-l border-border pl-3">
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      to="/courses"
                      search={{ category: c.slug }}
                      onClick={() => setOpen(false)}
                      className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      {c.name_bn}
                    </Link>
                  ))}
                  <Link
                    to="/courses"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-primary hover:bg-accent"
                  >
                    সব কোর্স
                  </Link>
                </CollapsibleContent>
              </Collapsible>

              <Link to="/about" onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-base font-medium hover:bg-accent">
                আমাদের সম্পর্কে
              </Link>
              <Link to="/contact" onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-base font-medium hover:bg-accent">
                যোগাযোগ
              </Link>

              <Button asChild className="mt-4">
                <Link to="/courses" onClick={() => setOpen(false)}>
                  কোর্স দেখুন
                </Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
