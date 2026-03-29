enum HighestQualification {
  primary = 'primary',
  secondary = 'secondary',
  tertiary = 'tertiary',
  none = 'none'
}
export interface ApplicantsAttributes {
id: string;
email: string;
phoneNumber: string;
surname: string;
firstName: string;
otherName?: string;
ward: string;
village: string;
hasEducation: "yes" | "no";
highestQualification:HighestQualification;
vocationalSkill: string;
otherSkill: string;
applicantId?: string;
villageHeadName: string;
villageHeadPhone: string;
certificateUrl: string;
certificateName?: string;
}

export enum Roles {
  User = "user",
  Admin = "admin"
}

export const TokenDuration = {
  accessTokenDuration: '3h',
  refreshTokenDuration: '30d',
};

export interface WardAttributes {
  id: string;
  name: string;
  code?: string;
  lga?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface VillageAttributes {
  id: string;
  name: string;
  wardId: string;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ApplicantIdCounterAttributes {
  id: string;
  prefix: string;
  lastNumber: number;
  createdAt?: Date;
  updatedAt?: Date;
}