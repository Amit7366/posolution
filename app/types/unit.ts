export type UnitStatus = "Active" | "Inactive";

export type Unit = {
  id: string;
  unit: string;
  shortName: string;
  productsCount: number;
  createdAt: string; // YYYY-MM-DD
  status: UnitStatus;
};
