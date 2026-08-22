"use client";

import { useEffect } from "react";
import { useLanguageStore } from "@/lib/stores/languageStore";

export default function LanguageSync() {
  const syncLanguage = useLanguageStore((s) => s.syncLanguage);

  useEffect(() => {
    syncLanguage();
  }, [syncLanguage]);

  return null;
}
