"use client";

import * as React from "react";
import { CacheProvider } from "@emotion/react";
import createCache, { type EmotionCache } from "@emotion/cache";
import { useServerInsertedHTML } from "next/navigation";

export default function EmotionRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cache] = React.useState<EmotionCache>(() => {
    const c = createCache({ key: "mui", prepend: true });
    // ensure client & server behave the same
    c.compat = true; // properly typed (no `any`)
    return c;
  });

  useServerInsertedHTML(() => {
    const { inserted } = cache; // properly typed: Record<string, string | true>

    const names = Object.keys(inserted).filter(
      (name) => typeof inserted[name] === "string"
    );

    if (names.length === 0) return null;

    const styles = names
      .map((name) => inserted[name])
      .filter((v): v is string => typeof v === "string")
      .join("");

    return (
      <style
        data-emotion={`${cache.key} ${names.join(" ")}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
