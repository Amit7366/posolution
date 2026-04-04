export type WarrantyStatus = "Active" | "Inactive";
export type WarrantyPeriod = "Day" | "Week" | "Month" | "Year";

export type Warranty = {
  id: string;
  name: string;
  description: string;
  duration: number;
  period: WarrantyPeriod;
  createdAt: string;
  status: WarrantyStatus;
};
