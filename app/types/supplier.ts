export type Supplier = {
  id: string;
  supplierId: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  status: "Active" | "Inactive";
  balance: number;
  createdAt: string;
};
