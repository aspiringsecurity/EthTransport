import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const IncidentManagerModule = buildModule("IncidentManagerModule", (m) => {
  const incidentManager = m.contract("IncidentManager", []);

  return { incidentManager };
});

export default IncidentManagerModule;
