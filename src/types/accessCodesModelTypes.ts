
export interface AccessCodesAttributes {
  id?: string;
  code: string;
  phoneNumber: string;
  email:string;
  usageCount?: number;
  maxUsage?: number;
  expiresAt: Date;
  isConsumed?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}