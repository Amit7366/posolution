export type NormalUser = {
  _id: string;
  id: string;         // public-facing user id
  user?: string;      // backend/internal id if present
  contactNo?: string | null; // make optional to avoid hard requirement in all lists
  name: string;
  email: string;
  profileImg: string;
  signupBonusGiven: boolean;
  kycVerified: boolean;
  engagementStatus: string;
  isDeleted: boolean;
  createdAt?: string;
};
