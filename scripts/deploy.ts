// scripts/deploy.ts

// NOVO: Importa e configura o dotenv no topo do script
import * as dotenv from "dotenv";

const environment = process.env.ENVIRONMENT;

if (environment === 'DEV') {
  console.log("Loading environment variables from .env.local (DEV environment)");
  dotenv.config({ path: '.env.local' });
} else {
  console.log("Loading environment variables from .env (Production/Default environment)");
  dotenv.config(); // dotenv.config() por padrão carrega '.env'
}


dotenv.config(); // Carrega as variáveis do .env para process.env

import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with account:", deployer.address);

  // --- ALTERADO: Obtém o endereço da carteira de taxas de uma variável de ambiente ---
  const FEE_WALLET_ADDRESS = process.env.FEE_WALLET_ADDRESS;

  // Validação para garantir que o endereço foi carregado e é válido
  if (!FEE_WALLET_ADDRESS) {
      console.error("Erro: Variável de ambiente FEE_WALLET_ADDRESS não definida no .env");
      process.exit(1);
  }
  if (!ethers.isAddress(FEE_WALLET_ADDRESS)) {
      console.error("Erro: O endereço da carteira de taxas carregado do .env é inválido:", FEE_WALLET_ADDRESS);
      process.exit(1);
  }
  // -----------------------------------------------------------

  const Crowdfunding = await ethers.getContractFactory("Crowdfunding", deployer);
  
  // Passando o endereço da carteira de taxas como argumento do construtor
  const crowdfunding = await Crowdfunding.deploy(FEE_WALLET_ADDRESS); 

  await crowdfunding.waitForDeployment();

  console.log("Contrato Crowdfunding implantado em:", crowdfunding.target);
  console.log("Carteira de taxas configurada para:", FEE_WALLET_ADDRESS);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});