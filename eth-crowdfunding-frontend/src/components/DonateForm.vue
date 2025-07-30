<template>
    <div class="mb-6">
      <h2 class="text-xl font-bold mb-2">Doar para Projeto</h2>
      <form @submit.prevent="donateToProject">
        <input v-model.number="projectId" placeholder="ID do Projeto" class="border p-2 mr-2" required />
        <input v-model.number="amount" placeholder="Valor (em wei)" class="border p-2 mr-2" required />
        <button class="bg-purple-500 text-white px-4 py-2 rounded" type="submit">
          Doar
        </button>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { ethers } from 'ethers';
  import crowdfundingArtifact from '@/contracts/Crowdfunding.json';
  
  const projectId = ref('');
  const amount = ref(0);
  const contractAddress = '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853';
  
  const donateToProject = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const crowdfunding = new ethers.Contract(
        contractAddress,
        crowdfundingArtifact.abi,
        signer
      );
  
      const tx = await crowdfunding.donate(projectId.value, {
        value: BigInt(amount.value),
      });
  
      await tx.wait();
  
      alert('Doação enviada com sucesso!');
    } catch (error) {
      console.error('Erro ao doar:', error);
    }
  };
  </script>
  