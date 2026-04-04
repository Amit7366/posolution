/** Row model for expired-products table + edit modal */
export type ExpiredProductRow = {
  id: string;
  sku: string;
  name: string;
  /** yyyy-mm-dd for date inputs */
  manufacturedDate: string;
  expiryOn: string;
  imageUrl?: string;
};
