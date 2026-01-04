export type WarrantyStatus = "Active" | "Inactive";
export type WarrantyPeriod = "Month" | "Year";

export type Warranty = {
  id: string;
  name: string;
  description: string;
  duration: number;        // numeric, e.g. 2
  period: WarrantyPeriod;  // Month | Year
  createdAt: string;       // YYYY-MM-DD
  status: WarrantyStatus;
};
