export type BrandStatus = "Active" | "Inactive";

export type Brand = {
  id: string;
  name: string;
  /** API slug (unique per tenant) */
  slug?: string;
  createdAt: string; // YYYY-MM-DD or ISO from API
  status: BrandStatus;
  logoUrl?: string; // remote url or data url
};
