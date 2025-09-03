// Exemplo de como você pode estruturar suas configurações de rede
export const  NETWORKS = {
    monad: {
      name: "Monad",
      chainId: "10143", // Exemplo, substitua pelo Chain ID real da Monad
      rpcUrl: "https://rpc.ankr.com/monad_testnet", // Exemplo, substitua pela URL RPC real
      currency: { name: "MON", symbol: "MON", decimals: 18 },
      blockExplorerUrl: "https://testnet.monadexplorer.com/",
      logo: "/src/assets/logos/monad_logo.png", 
    },
    somnia: {
      name: "Somnia",
      chainId: "50312", // Exemplo, substitua pelo Chain ID real da Somnia
      rpcUrl: "https://dream-rpc.somnia.network", // Exemplo, substitua pela URL RPC real
      currency: { name: "STT", symbol: "STT", decimals: 18 },
      blockExplorerUrl: "https://shannon-explorer.somnia.network/",
      logo: "/src/assets/logos/somnia_logo.svg"
    },
    pharos: {
      name: "Pharos",
      chainId: "688688", // Exemplo, substitua pelo Chain ID real da Pharos
      rpcUrl: "https://api.zan.top/node/v1/pharos/testnet/5a930d4746de4e3aa722c8dd27260f8a", // Exemplo, substitua pela URL RPC real
      currency: { name: "PHRS", symbol: "PHRS", decimals: 18 },
      blockExplorerUrl: "https://pharos-testnet.socialscan.io/",
      logo: "/src/assets/logos/pharos_logo.svg"
    },
    mega: {
      name: "MegaETH",
      chainId: "6342", // Exemplo, substitua pelo Chain ID real da Pharos
      rpcUrl: "https://carrot.megaeth.com/rpc", // Exemplo, substitua pela URL RPC real
      currency: { name: "ETH", symbol: "ETH", decimals: 18 },
      blockExplorerUrl: "https://www.megaexplorer.xyz/",
      logo: "/src/assets/logos/mega_logo.png"
    },
  };

  // **IMPORTANTE:** Substitua estes endereços pelos endereços reais dos seus contratos implantados em cada testnet!
  export const CONTRACT_ADDRESSES = {
    "10143": import.meta.env.VITE_CROWDFUNDING_MONAD_ADDRESS, // Endereço do contrato da Monad
    "50312": import.meta.env.VITE_CROWDFUNDING_SOMNIA_ADDRESS, // Endereço do contrato da Somnia
    "688688": import.meta.env.VITE_CROWDFUNDING_PHAROS_ADDRESS, // Endereço do contrato da Pharos
    "6342": import.meta.env.VITE_CROWDFUNDING_MEGA_ADDRESS, // Endereço do contrato da MegaETH
};

// Define uma rede padrão para iniciar, caso nenhuma seja detectada ou selecionada inicialmente
export const DEFAULT_NETWORK_KEY = 'monad'; // Você pode mudar para 'somnia' ou 'pharos' conforme sua preferência