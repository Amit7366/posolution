"use client";

import NavbarLanguageSwitcher from "@/components/NavbarLanguageSwitcher";

export function PosLanguageSlot() {
  return (
    <div className="absolute right-3 top-3 z-20">
      <NavbarLanguageSwitcher />
    </div>
  );
}
