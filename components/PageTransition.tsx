"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

const AUTH_PATHS = new Set(["/login", "/register"]);

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Keep auth shell mounted so Login ↔ Register use the in-layout form transition
  const transitionKey = AUTH_PATHS.has(pathname) ? "auth" : pathname;

  return (
    <motion.div
      key={transitionKey}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{
        duration: 0.35,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
}
