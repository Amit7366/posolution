import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "posulation",
    short_name: "posulation",
    description:
      "Smart POS for sales, inventory, invoices, and reports — trusted by modern retail businesses.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#004AF2",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
