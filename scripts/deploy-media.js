const hre = require("hardhat");

async function main() {
  const F = await hre.ethers.getContractFactory("MediaGallery");
  const c = await F.deploy();
  await c.waitForDeployment();
  console.log("MediaGallery deployed to:", await c.getAddress());
}

main().catch((e) => { console.error(e); process.exit(1); });