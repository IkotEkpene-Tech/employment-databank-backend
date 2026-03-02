import { DataTypes, Model } from "sequelize";
import { database } from "../../configurations/database";
import { WardAttributes } from "../../types/applicantModelTypes";

export class Ward extends Model<WardAttributes> {}

Ward.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    code: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    lga: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "IKOT_EKPENE",
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize: database,
    tableName: "wards",
    timestamps: true,
    indexes: [
      {
        fields: ["name"],
      },
    ],
  },
);

export default Ward;
