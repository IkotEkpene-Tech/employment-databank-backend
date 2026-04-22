import { DataTypes, Model } from "sequelize";
import { database } from "../../configurations/database";
import { AccessCodesAttributes } from "../../types/accessCodesModelTypes";

export class AccessCodes extends Model<AccessCodesAttributes> {}

AccessCodes.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    code: {
      type: DataTypes.STRING(12),
      allowNull: false,
      unique: true,
    },

    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    usageCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    maxUsage: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
    },

    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    isConsumed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize: database,
    tableName: "access_codes",
    timestamps: true,
  },
);

export default AccessCodes;
