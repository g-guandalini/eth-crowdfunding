import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with account:", deployer.address);

  const Crowdfunding = await ethers.getContractFactory("Crowdfunding", deployer);
  const crowdfunding = await Crowdfunding.deploy(); // <-- não passa deployer aqui!

  await crowdfunding.waitForDeployment();

  console.log("Crowdfunding deployed to:", crowdfunding.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
