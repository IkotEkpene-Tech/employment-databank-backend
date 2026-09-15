import { DataTypes, Model } from "sequelize";
import { database } from "../configurations/database";

export interface RegistrationDraftAttributes {
  id: string;
  userId: string;
  values: Record<string, any>;
  step: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class RegistrationDraft extends Model<RegistrationDraftAttributes> {}

RegistrationDraft.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: "applicants",
        key: "id",
      },
      onDelete: "CASCADE",
    },

    values: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },

    step: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize: database,
    tableName: "registration_drafts",
    timestamps: true,
  },
);

export default RegistrationDraft;
