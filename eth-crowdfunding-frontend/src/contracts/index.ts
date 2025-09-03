import Crowdfunding from "./Crowdfunding.json";

// O ABI (Application Binary Interface) do contrato é o mesmo para todas as redes.
export const CROWDFUNDING_ABI = Crowdfunding.abi;

// Mapeamento de Chain ID para o endereço do contrato Crowdfunding em cada rede.
// Os Chain IDs devem corresponder aos que você define em seu objeto de redes (ex: networks.js).
// Por exemplo, se Monad tem chainId "56789", Somnia "12345", etc.
export const CONTRACT_ADDRESSES: { [chainId: string]: string | undefined } = {
  // Use os Chain IDs reais das suas redes aqui.
  // Exemplo fictício: "12345" para Somnia, "56789" para Monad.
  "10143": import.meta.env.VITE_CROWDFUNDING_MONAD_ADDRESS, // Substitua "CHAIN_ID_MONAD" pelo ID real
  "50312": import.meta.env.VITE_CROWDFUNDING_SOMNIA_ADDRESS, // Substitua "CHAIN_ID_SOMNIA" pelo ID real
  "688688": import.meta.env.VITE_CROWDFUNDING_PHAROS_ADDRESS, // Substitua "CHAIN_ID_PHAROS" pelo ID real
  "6342": import.meta.env.VITE_CROWDFUNDING_MEGA_ADDRESS,   // Substitua "CHAIN_ID_MEGA" pelo ID real
  // Adicione outras redes conforme necessário
};
