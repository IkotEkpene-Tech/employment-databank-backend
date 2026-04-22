import { DataTypes, Model } from "sequelize";
import { database } from "../../configurations/database";
import { decrypt, encrypt } from "../../utilities/encryption/encryption";

export interface ComplaintAttributes {
  id?: string;
  nin: string;
  fullName: string;
  phoneNumber: string;
  errorEncountered?: string | null;
  description: string;
  currentPage: string;
  status?: "pending" | "resolved" | "in_progress";
  resolvedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Complaint extends Model<ComplaintAttributes> {}

Complaint.init(
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

    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Full name is required",
        },
        len: {
          args: [3, 150],
          msg: "Full name must be between 3 and 150 characters",
        },
      },
    },

    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    errorEncountered: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Description is required",
        },
        len: {
          args: [10, 5000],
          msg: "Description must be at least 10 characters",
        },
      },
    },

    currentPage: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("pending", "in_progress", "resolved"),
      allowNull: false,
      defaultValue: "pending",
    },

    resolvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize: database,
    tableName: "complaints",
    timestamps: true,
  },
);

export default Complaint;
