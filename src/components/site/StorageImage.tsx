import { useEffect, useState, type ImgHTMLAttributes } from "react";

import { supabase } from "@/integrations/supabase/client";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src: string;
};

const MEDIA_PREFIX = "media:";

export function StorageImage({ src, alt, ...props }: Props) {
  const [resolvedSrc, setResolvedSrc] = useState(
    src.startsWith(MEDIA_PREFIX) ? "" : src,
  );

  useEffect(() => {
    let active = true;

    if (!src.startsWith(MEDIA_PREFIX)) {
      setResolvedSrc(src);
      return () => {
        active = false;
      };
    }

    const path = src.slice(MEDIA_PREFIX.length);
    void supabase.storage
      .from("media")
      .createSignedUrl(path, 60 * 60)
      .then(({ data, error }) => {
        if (active) setResolvedSrc(error ? "" : data.signedUrl);
      });

    return () => {
      active = false;
    };
  }, [src]);

  if (!resolvedSrc) return null;
  return <img src={resolvedSrc} alt={alt} {...props} />;
}