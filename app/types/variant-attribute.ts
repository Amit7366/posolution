export type VariantStatus = "Active" | "Inactive";

export type VariantAttribute = {
  id: string;
  name: string;        // e.g. Size, Color
  values: string[];    // e.g. ["XS","S","M"]
  createdAt: string;   // YYYY-MM-DD
  status: VariantStatus;
};
