"use client";

import { useEffect, useState } from "react";
import { Toaster } from "sileo";

export function CustomToaster() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      // Sileo theme="light" renders dark/black notifications.
      // Sileo theme="dark" renders light/white notifications.
      setTheme(isDark ? "dark" : "light");
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return <Toaster position="top-center" theme={theme} />;
}
