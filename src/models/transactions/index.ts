import { DataTypes, Model } from "sequelize";
import { database } from "../../configurations/database";

export interface TransactionAttributes {
  id?: string;
  phoneNumber: string;
  reference: string;
  amount: number;
  status?: "pending" | "success" | "failed";
  createdAt?: Date;
  updatedAt?: Date;
}

export class Transactions extends Model<TransactionAttributes> {}

Transactions.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    reference: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Amount in kobo",
    },

    status: {
      type: DataTypes.ENUM("pending", "success", "failed"),
      allowNull: false,
      defaultValue: "pending",
    },
  },
  {
    sequelize: database,
    tableName: "transactions",
    timestamps: true,
  },
);

export default Transactions;