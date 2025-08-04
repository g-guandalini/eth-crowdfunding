// src/types/project.ts
export interface Donor {
    address: string;
    amount: string; // Valor doado em ETH (string formatada)
  }
  export interface Project {
    id: number;
    title: string;
    description: string;
    goal: string; // Ethers.formatEther
    amountRaised: string; // Ethers.formatEther
    owner: string;
    deadline: number; // Unix timestamp
    fixedDonationAmount: boolean;
    requiredDonationAmount: string; // Ethers.formatEther
    completed: boolean;
    withdrawn: boolean; // Adicionado: para controlar se o dono já sacou
    donors: { address: string; amount: string }[];
  }