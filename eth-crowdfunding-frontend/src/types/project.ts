// src/types/project.ts
export interface Donor {
    address: string;
    amount: string; // Valor doado em ETH (string formatada)
  }
  
  export interface Project {
    id: number;
    title: string;
    description: string;
    goal: string; // ETH string
    amountRaised: string; // ETH string
    owner: string;
    // donationAmount: string; // Isso agora será um estado interno de ProjectCard
    deadline: number; // Unix timestamp em segundos
    fixedDonationAmount: boolean;
    requiredDonationAmount: string; // ETH string (se fixedDonationAmount for true)
    completed: boolean; // Flag do contrato
    refunded: boolean; // Flag do contrato
    donors?: Donor[]; // Nova propriedade para a lista de doadores
  }