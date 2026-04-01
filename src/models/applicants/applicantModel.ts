import { DataTypes, Model } from "sequelize";
import { database } from "../../configurations/database";
import { ApplicantsAttributes } from "../../types/applicantModelTypes";
import { decrypt, encrypt } from "../../utilities/encryption/encryption";

export class Applicants extends Model<ApplicantsAttributes> {}

Applicants.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    nin: {
      type: DataTypes.TEXT,
      allowNull: false,
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

    vin: {
      type: DataTypes.TEXT,
      allowNull: false,
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
      allowNull: false,
    },

    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: false,
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
      allowNull: false,
    },

    surname: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    otherName: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },

    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    ward: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    applicantId: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    village: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    hasEducation: {
      type: DataTypes.ENUM("yes", "no"),
      allowNull: false,
    },

    highestQualification: {
      type: DataTypes.ENUM("primary", "ssce", "ond", "hnd", "bsc", "post-bsc"),
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
      allowNull: false,
    },

    villageHeadPhone: {
      type: DataTypes.STRING,
      allowNull: false,
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
  },
  {
    sequelize: database,
    tableName: "applicants",
    timestamps: true,
  },
);

export default Applicants;
