import { Ward } from "./Ward";
import { Village } from "./Village";

const applyWardVillageAssociations = () => {
  Ward.hasMany(Village, { foreignKey: "wardId", as: "villages" });
  Village.belongsTo(Ward, { foreignKey: "wardId", as: "ward" });
};

export default applyWardVillageAssociations;
