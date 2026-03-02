import { Sequelize } from "sequelize";
import config from ".";

const { NEON } = config;

export const database = new Sequelize(`${NEON}`, {
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// let sequelize: Sequelize;

// export const getDatabase = () => {
//   if (!sequelize) {
//     sequelize = new Sequelize(`${NEON}`, {
//       pool: {
//         max: 5,
//         min: 0,
//         acquire: 30000,
//         idle: 10000,
//       },
//     });
//   }
//   return sequelize;
// };
