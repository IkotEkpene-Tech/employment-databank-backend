import { DataTypes, Model } from "sequelize";
import { database } from "../configurations/database";
import { decrypt, encrypt } from "../configurations/encryption";

export enum ApplicationStatus {
  NotStarted = "not_started",
  AccessPending = "access_pending",
  AccessIssued = "access_issued",
  NinVerified = "nin_verified",
  InProgress = "in_progress",
  Submitted = "submitted",
}

export interface UserAttributes {
  id: string;
  email: string;
  phoneNumber: string;
  passwordHash?: string | null;
  emailVerified: boolean;
  emailOtpHash?: string | null;
  emailOtpExpiresAt?: Date | null;
  loginOtpHash?: string | null;
  loginOtpExpiresAt?: Date | null;
  passwordResetTokenHash?: string | null;
  passwordResetTokenExpiresAt?: Date | null;
  surname?: string | null;
  firstName?: string | null;
  otherName?: string | null;
  gender?: string | null;
  dateOfBirth?: Date | null;
  nin?: string | null;
  ninHash?: string | null;
  vin?: string | null;
  vinHash?: string | null;
  photo?: string | null;
  ward?: string | null;
  village?: string | null;
  applicantId?: string | null;
  hasEducation?: "yes" | "no" | null;
  highestQualification?: string | null;
  discipline?: string | null;
  otherDiscipline?: string | null;
  vocationalSkill?: string | null;
  otherSkill?: string | null;
  skillAcquisition?: string | null;
  otherSkillAcquisition?: string | null;
  villageHeadName?: string | null;
  villageHeadPhone?: string | null;
  certificateUrl?: string | null;
  certificateName?: string | null;
  certificateOfOrigin?: string | null;
  applicationStatus: ApplicationStatus;
  // The employment-access gate: a paid-for access code, tied to whichever
  // NIN it was purchased for. Reusable (not single-use) until it expires —
  // the user re-enters nin + accessCode every time they resume a
  // not-yet-submitted application.
  accessCodeNin?: string | null;
  accessCodeNinHash?: string | null;
  accessCodeHash?: string | null;
  accessCodeExpiresAt?: Date | null;
  // Plaintext copy of the current access code, cleared the first time
  // GET /employment-access/payment-status reveals it. accessCodeHash (above)
  // is what verify/confirm actually check, and is never cleared by reveal.
  accessCodePlaintext?: string | null;
  // Set once, at the moment applicationStatus flips to "submitted" — kept
  // separate from updatedAt, which can move later for unrelated reasons
  // (e.g. a password reset).
  submittedAt?: Date | null;
}

export class User extends Model<UserAttributes> {}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    passwordHash: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    emailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    emailOtpHash: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    emailOtpExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    loginOtpHash: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    loginOtpExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    passwordResetTokenHash: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    passwordResetTokenExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    nin: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const raw = this.getDataValue("nin");
        if (!raw) return null;
        try {
          return decrypt(JSON.parse(raw));
        } catch {
          return null;
        }
      },
      set(value: string) {
        this.setDataValue("nin", JSON.stringify(encrypt(value)));
      },
    },

    photo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    vin: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const raw = this.getDataValue("vin");
        if (!raw) return null;
        try {
          return decrypt(JSON.parse(raw));
        } catch {
          return null;
        }
      },
      set(value: string) {
        this.setDataValue("vin", JSON.stringify(encrypt(value)));
      },
    },

    ninHash: {
      type: DataTypes.TEXT,
      allowNull: true,
      unique: true,
    },

    vinHash: {
      type: DataTypes.TEXT,
      allowNull: true,
      unique: true,
    },

    gender: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    skillAcquisition: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    otherSkillAcquisition: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    certificateOfOrigin: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    surname: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    firstName: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    otherName: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    ward: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    applicantId: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    village: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    hasEducation: {
      type: DataTypes.ENUM("yes", "no"),
      allowNull: true,
    },

    highestQualification: {
      type: DataTypes.ENUM("primary", "ssce", "ond", "hnd", "bsc", "post-bsc"),
      allowNull: true,
    },

    discipline: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    otherDiscipline: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    vocationalSkill: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    otherSkill: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    villageHeadName: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    villageHeadPhone: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    certificateUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Stored file URL or local path",
    },

    certificateName: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    submittedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    applicationStatus: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ApplicationStatus.NotStarted,
      validate: {
        isIn: [Object.values(ApplicationStatus)],
      },
    },

    accessCodeNin: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const raw = this.getDataValue("accessCodeNin");
        if (!raw) return null;
        try {
          return decrypt(JSON.parse(raw));
        } catch {
          return null;
        }
      },
      set(value: string) {
        this.setDataValue("accessCodeNin", JSON.stringify(encrypt(value)));
      },
    },

    accessCodeNinHash: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    accessCodeHash: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    accessCodeExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    accessCodePlaintext: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const raw = this.getDataValue("accessCodePlaintext");
        if (!raw) return null;
        try {
          return decrypt(JSON.parse(raw));
        } catch {
          return null;
        }
      },
      set(value: string | null) {
        this.setDataValue(
          "accessCodePlaintext",
          value ? JSON.stringify(encrypt(value)) : null,
        );
      },
    },
  },
  {
    sequelize: database,
    tableName: "applicants",
    timestamps: true,
  },
);

export default User;
