import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const EvidenceVaultModule = buildModule("EvidenceVaultModule", (m) => {
  const vault = m.contract("EvidenceVault");
  return { vault };
});

export default EvidenceVaultModule;