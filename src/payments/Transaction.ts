import { DataTypes, Model } from "sequelize";
import { database } from "../configurations/database";

export interface TransactionAttributes {
  id?: string;
  /** The user (auth/User) this payment belongs to. Column name predates the
   * account/employment-access split — every payment is now for employment
   * access, not "registration", but it's left as-is to avoid a rename
   * migration on a column that's purely internal (never serialized in an
   * API response). */
  registrationId?: string | null;
  phoneNumber: string;
  email: string;
  reference: string;
  amount: number;
  status?: "pending" | "success" | "failed";
  createdAt?: Date;
  updatedAt?: Date;
}

export class Transaction extends Model<TransactionAttributes> {}

Transaction.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    registrationId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "applicants",
        key: "id",
      },
    },

    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
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

export default Transaction;
