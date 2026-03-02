import { DataTypes, Model } from "sequelize";
import { database } from "../../configurations/database";
import { ApplicantsAttributes } from "../../types/applicantModelTypes";

export class Applicants extends Model<ApplicantsAttributes> {}

Applicants.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
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
