"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuthLoader } from "./auth-loader-provider";

export function NavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { showLoader, hideLoader } = useAuthLoader();

  useEffect(() => {
    // Show loader when route starts changing
    const handleRouteChangeStart = () => {
      showLoader("Loading...");
    };

    // Hide loader when route change completes
    const handleRouteChangeComplete = () => {
      // Small delay to ensure page has started rendering
      setTimeout(() => {
        hideLoader();
      }, 300);
    };

    // Listen for route changes
    if (typeof window !== "undefined") {
      // Custom event listeners for Next.js App Router
      window.addEventListener("beforeunload", handleRouteChangeStart);
      
      // Show loader when pathname or search params change
      handleRouteChangeComplete();
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("beforeunload", handleRouteChangeStart);
      }
    };
  }, [pathname, searchParams, showLoader, hideLoader]);

  // This component doesn't render anything
  return null;
}
