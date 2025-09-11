"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
      if (!isAuthenticated && pathname !== "/login") {
        router.push("/login");
      }
      setChecked(true);
  }, [isAuthenticated, pathname, router]);

  // While checking auth or redirecting, render nothing
  if (!checked || (pathname !== "/login")) {
    return null;
  }

  return <>{children}</>;
}
