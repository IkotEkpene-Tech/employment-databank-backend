import { DataTypes, Model, Optional } from "sequelize";
import { database } from "../../configurations/database";

interface ApplicantIdCounterAttributes {
  id: string;
  prefix: string;
  lastNumber: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ApplicantIdCounter extends Model<ApplicantIdCounterAttributes> {}

ApplicantIdCounter.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    prefix: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // e.g. "IK-WARD05-IOE"
      comment: "Unique prefix per ward-village combination",
    },
    lastNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "Last used sequence number for this prefix",
    },
  },
  {
    sequelize: database,
    tableName: "applicant_id_counters",
    timestamps: true,
  },
);

export default ApplicantIdCounter;
