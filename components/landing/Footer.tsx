"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { ShoppingCart, Twitter, Github, Linkedin, Facebook, Mail, Phone } from "lucide-react";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".footer-content", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 90%" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const links = [
    {
      heading: t("landing.footer.product"),
      items: [
        { label: t("landing.footer.features"), href: "#features" },
        { label: t("landing.footer.pricing"), href: "#pricing" },
        { label: t("landing.footer.changelog"), href: "#" },
        { label: "Integrations", href: "#" },
      ],
    },
    {
      heading: t("landing.footer.company"),
      items: [
        { label: t("landing.footer.about"), href: "#" },
        { label: t("landing.footer.blog"), href: "#" },
        { label: t("landing.footer.careers"), href: "#" },
        { label: "Partners", href: "#" },
      ],
    },
    {
      heading: t("landing.footer.support"),
      items: [
        { label: t("landing.footer.helpCenter"), href: "#" },
        { label: t("landing.footer.contact"), href: "#" },
        { label: t("landing.footer.status"), href: "#" },
        { label: "Community", href: "#" },
      ],
    },
  ];

  const socials = [
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Github, href: "#", label: "GitHub" },
  ];

  return (
    <footer
      ref={sectionRef}
      className="border-t border-gray-200/60 bg-white dark:border-gray-800/60 dark:bg-[#060612]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="footer-content py-16">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
            {/* Brand */}
            <div className="md:col-span-4">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 shadow-sm">
                  <ShoppingCart size={17} className="text-white" />
                </div>
                <span className="text-xl font-black bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Sohoj POS
                </span>
              </Link>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                {t("landing.footer.tagline")}
              </p>

              {/* Contact */}
              <div className="mt-5 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Mail size={13} />
                  <span>support@sohojpos.com</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Phone size={13} />
                  <span>+880 1700-000000</span>
                </div>
              </div>

              {/* Socials */}
              <div className="mt-6 flex gap-2">
                {socials.map(({ icon: Icon, href, label }, i) => (
                  <a
                    key={i}
                    href={href}
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:border-gray-700 dark:hover:border-blue-700 dark:hover:bg-blue-950/30 dark:hover:text-blue-400"
                  >
                    <Icon size={15} />
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div className="grid grid-cols-3 gap-8 md:col-span-8">
              {links.map(({ heading, items }, i) => (
                <div key={i}>
                  <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                    {heading}
                  </h4>
                  <ul className="space-y-3">
                    {items.map(({ label, href }, j) => (
                      <li key={j}>
                        <Link
                          href={href}
                          className="text-sm text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                        >
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 py-6 sm:flex-row dark:border-gray-800/60">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {t("landing.footer.copyright")}
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-gray-400 transition-colors hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400">
              {t("landing.footer.privacyPolicy")}
            </a>
            <a href="#" className="text-xs text-gray-400 transition-colors hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400">
              {t("landing.footer.terms")}
            </a>
            <a href="#" className="text-xs text-gray-400 transition-colors hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
