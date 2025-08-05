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
    monadTestnet: { // Nome da sua rede Monad Testnet (você pode nomear como quiser)
      url: "https://monad-testnet.drpc.org", // RPC HTTP é geralmente preferido para deploys
      // Nota: drpc.org oferece WSS, mas para deploys HTTP costuma ser mais comum.
      // Tente com HTTP se o WSS não funcionar para deploy.
      // Se for somente WSS, pode ser necessário um plugin Hardhat adicional.
      // Para este exemplo, usaremos o URL HTTPS que o drpc.org também oferece.
      chainId: 10143, // Chain ID da testnet Monad que você forneceu
      accounts: [process.env.PRIVATE_KEY as string], // Chave privada da sua conta de deploy
    },
    // ... outras redes que você possa ter
  },
  // ... outras configurações
};

export default config;