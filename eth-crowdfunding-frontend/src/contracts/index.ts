import Crowdfunding from "./Crowdfunding.json";

// Acesse a variável de ambiente usando import.meta.env
// e o prefixo VITE_
export const CROWDFUNDING_ADDRESS = import.meta.env.VITE_CROWDFUNDING_ADDRESS;
export const CROWDFUNDING_ABI = Crowdfunding.abi;

// Uma boa prática é verificar se a variável foi carregada
if (!CROWDFUNDING_ADDRESS) {
  console.error("Variável de ambiente VITE_CROWDFUNDING_ADDRESS não está definida!");
  // Você pode lançar um erro ou definir um valor de fallback aqui se for o caso
  // throw new Error("CROWDFUNDING_ADDRESS not defined in environment variables.");
}