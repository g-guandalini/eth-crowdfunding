// hardhat.config.ts

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config(); // Carrega as variáveis de ambiente

const config: HardhatUserConfig = {
  solidity: "0.8.20", // Ou a versão do seu contrato
  networks: {
    hardhat: {
      // Sua configuração de hardhat local
    },
    monadTestnet: {
      url: "https://monad-testnet.drpc.org",
      chainId: 10143,
      accounts: [process.env.PRIVATE_KEY as string],
    },
    // --- NOVAS REDES ---
    somniaTestnet: {
      url: "https://dream-rpc.somnia.network", // RPC da Somnia Testnet
      chainId: 50312, // Chain ID da Somnia Testnet
      accounts: [process.env.PRIVATE_KEY as string],
    },
    pharosTestnet: {
      url: "https://testnet.dplabs-internal.com", // RPC da Pharos Testnet
      chainId: 688688, // Chain ID da Pharos Testnet
      accounts: [process.env.PRIVATE_KEY as string],
    },
    megaethTestnet: {
      url: "https://carrot.megaeth.com/rpc", // RPC da MegaETH Testnet
      chainId: 6342, // Chain ID da MegaETH Testnet
      accounts: [process.env.PRIVATE_KEY as string],
    },
    // --- FIM NOVAS REDES ---
  }
};

export default config;