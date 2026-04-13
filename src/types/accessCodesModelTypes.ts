
export interface AccessCodesAttributes {
  id?: string;
  code: string;
  phoneNumber: string;
  usageCount?: number;
  maxUsage?: number;
  expiresAt: Date;
  isConsumed?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}