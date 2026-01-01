export type BrandStatus = "Active" | "Inactive";

export type Brand = {
  id: string;
  name: string;
  createdAt: string; // YYYY-MM-DD
  status: BrandStatus;
  logoUrl?: string; // remote url or data url
};
