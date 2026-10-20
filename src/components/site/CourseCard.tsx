import { Link } from "@tanstack/react-router";
import { Clock, Layers, Signal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { courseImage, feeLabel, isFreeCourse, type Course } from "@/lib/api";
import { StorageImage } from "@/components/site/StorageImage";

export function CourseCard({ course }: { course: Course }) {
  const category = course.categories;
  const free = isFreeCourse(course);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-lift)]">
      <Link
        to="/course/$slug"
        params={{ slug: course.slug }}
        className="relative block aspect-[3/2] overflow-hidden bg-muted"
      >
        <StorageImage
          src={courseImage(course)}
          alt={course.title_bn}
          loading="lazy"
          width={1200}
          height={800}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {category ? (
          <span
            className="absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-medium"
            style={{ backgroundColor: category.bg_color, color: category.color }}
          >
            {category.name_bn}
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-semibold leading-snug">
          <Link to="/course/$slug" params={{ slug: course.slug }} className="hover:text-primary">
            {course.title_bn}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {course.short_description_bn}
        </p>

        <ul className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <Clock className="size-3.5 text-primary" /> {course.duration_bn}
          </li>
          <li className="flex items-center gap-1.5">
            <Layers className="size-3.5 text-primary" /> {course.total_classes} ক্লাস
          </li>
          <li className="flex items-center gap-1.5">
            <Signal className="size-3.5 text-primary" /> {course.level_bn}
          </li>
        </ul>

        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <span
            className={
              free
                ? "rounded-full bg-primary-soft px-2.5 py-1 text-sm font-semibold text-primary"
                : "text-lg font-semibold text-foreground"
            }
          >
            {feeLabel(course)}
          </span>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/course/$slug" params={{ slug: course.slug }}>আরও জানুন</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/apply/$slug" params={{ slug: course.slug }}>আবেদন করুন</Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
