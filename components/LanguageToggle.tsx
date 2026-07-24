"use client";

import NavbarLanguageSwitcher from "./NavbarLanguageSwitcher";

/** @deprecated Prefer `NavbarLanguageSwitcher` with `variant="compact"` in layouts. */
export default function LanguageToggle() {
  return <NavbarLanguageSwitcher variant="compact" />;
}
