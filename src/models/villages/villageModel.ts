import { DataTypes, Model } from "sequelize";
import { database } from "../../configurations/database";
import { VillageAttributes } from "../../types/applicantModelTypes";

export class Village extends Model<VillageAttributes> {}

Village.init(
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

    wardId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "wards",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },

    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },

    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize: database,
    tableName: "villages",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["name", "wardId"],
      },
      {
        fields: ["wardId"],
      },
    ],
  },
);

export default Village;
