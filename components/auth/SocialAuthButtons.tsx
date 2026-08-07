"use client";

import { useTranslation } from "@/lib/i18n/useTranslation";

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.365 1.43c0 1.14-.435 2.205-1.2 3.015-.81.855-2.145 1.515-3.27 1.425-.15-1.11.42-2.28 1.17-3.06.81-.84 2.22-1.455 3.3-1.38zM19.5 17.25c-.51 1.14-.75 1.65-1.41 2.655-.915 1.395-2.205 3.135-3.81 3.15-1.425.015-1.8-.93-3.75-.915-1.95.015-2.37.93-3.795.93-1.605.015-2.835-1.59-3.75-2.985C1.575 17.655.54 13.665 1.935 10.92c.84-1.65 2.31-2.685 3.915-2.685 1.455 0 2.37.96 3.57.96 1.155 0 1.86-.975 3.615-.975 1.29 0 2.655.705 3.615 1.92-3.18 1.74-2.67 6.27.85 7.11z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#1877F2"
        d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"
      />
    </svg>
  );
}

const providers = [
  { id: "google", label: "Google", icon: GoogleIcon },
  { id: "apple", label: "Apple", icon: AppleIcon },
  { id: "facebook", label: "Facebook", icon: FacebookIcon },
] as const;

export default function SocialAuthButtons() {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="relative flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
          {t("auth.or")}
        </span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {providers.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            disabled
            title={t("auth.socialComingSoon")}
            aria-label={label}
            className="flex h-11 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Icon />
          </button>
        ))}
      </div>
    </div>
  );
}
