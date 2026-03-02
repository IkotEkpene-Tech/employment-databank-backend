import Village from "./villages/villageModel";
import Ward from "./wards/wardModel";

const applyAssociations = () => {
  Ward.hasMany(Village, { foreignKey: "wardId", as: "villages", });
  Village.belongsTo(Ward, { foreignKey: "wardId", as: "ward", });
};

export default applyAssociations;
