export * from "./common";

// types/index.ts
export interface Promotion {
  code: string;
  title: string;
  minDeposit: number;
  bonusRate?: number;
  fixedBonus?: number;
  turnoverX: number;
  eligibleGames: string[];
  maxWithdrawLimit?: number;
  usageType: string;
  description?: string;
}

export interface DepositBonus {
  _id: string;
  promoCode: string;
  usageType: "once" | "multiple" | string;
  bonusAmount: number | null;
  depositAmount: number | null;
  eligibleGameTypes?: string[]; // <-- from your payload
  maxWithdraw?: number | null;
  isActive: boolean;
  isCompleted: boolean;
  isClaimed: boolean;
  isRefunded: boolean;
  refundTrigger?: boolean;
  source?: string; // "promotion"
  turnoverCompleted: number; // sometimes 0
  turnoverRequired: number;  // sometimes 0
  depositId?: string;
  countingWindowClosedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  __v?: number;
}

export interface PromoSummary {
  completionPercentage?: number;        // e.g. 103.64
  totalTurnoverCompleted?: number;      // e.g. 1254
  totalTurnoverRequired?: number;       // e.g. 1210
  depositBonuses?: DepositBonus[];      // <-- array in your payload
  loginBonuses?: any[];
  referralBonus?: any | null;
  signupBonus?: {
    _id: string;
    userId: string;
    bonusAmount: number;
    turnoverRequired: number;
    turnoverCompleted: number;
    // ...other fields as needed
  } | null;
}
