import logoAsset from "@/assets/green-bangla-logo.jpg.asset.json";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
};

export function BrandLogo({ className, priority = false }: BrandLogoProps) {
  return (
    <img
      src={logoAsset.url}
      alt="Green Bangla Society logo"
      width={698}
      height={742}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      className={cn("shrink-0 object-contain", className)}
    />
  );
}