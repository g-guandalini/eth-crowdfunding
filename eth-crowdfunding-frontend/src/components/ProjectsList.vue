<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h2 class="text-3xl font-extrabold text-gray-900 mb-8 text-center">
      ✨ IT ALL STARTS WITH A SPARK ✨
    </h2>

    <!-- Controles de Filtro e Ordenação -->
    <ProjectFiltersAndSort
      v-model:selectedFilterProp="selectedFilter"
      v-model:selectedSortProp="selectedSort"
      :connectedWalletAddress="connectedWalletAddress"
    />

    <div v-if="loading" class="text-center text-gray-600 py-10">
      <p class="text-lg">Carregando projetos...</p>
      <div class="mt-4 animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
    </div>
    <div v-else-if="filteredAndSortedProjects.length === 0" class="text-center text-gray-500 py-10">
      <p class="text-lg">Nenhum projeto encontrado para o filtro/ordenação selecionado.</p>
      <p class="text-sm mt-2">Que tal criar o seu próprio projeto ou ajustar os filtros?</p>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
      <ProjectCard
        v-for="project in filteredAndSortedProjects"
        :key="project.id"
        :project="project"
        @donateProject="handleDonate"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { ethers } from "ethers";
import { CROWDFUNDING_ABI, CROWDFUNDING_ADDRESS } from "../contracts"; // Certifique-se de que estes paths estão corretos
import ProjectFiltersAndSort from '@/components/ProjectFiltersAndSort.vue'; // Ajuste o caminho
import ProjectCard from '@/components/ProjectCard.vue'; // Ajuste o caminho
import type { Project } from '@/types/project'; // Ajuste o caminho

const projects = ref<Project[]>([]);
const loading = ref(true);

const selectedFilter = ref<'all' | 'myProjects' | 'myContributions'>('all');
const selectedSort = ref<'deadline' | 'progress' | 'goalAmount'>('deadline');
const connectedWalletAddress = ref<string | null>(null);

// Lógica de progresso do projeto (reimportada aqui se precisar para o sort)
function projectProgress(project: Project): number {
  const goal = parseFloat(project.goal);
  const amountRaised = parseFloat(project.amountRaised);
  if (isNaN(goal) || isNaN(amountRaised) || goal <= 0) return 0;
  return Math.min((amountRaised / goal) * 100, 100);
}

// Propriedade computada para aplicar os filtros
const filteredProjects = computed(() => {
  if (!projects.value) return [];

  let tempProjects = [...projects.value];

  if (selectedFilter.value === 'myProjects' && connectedWalletAddress.value) {
    tempProjects = tempProjects.filter(project =>
      project.owner.toLowerCase() === connectedWalletAddress.value!.toLowerCase()
    );
  } else if (selectedFilter.value === 'myContributions' && connectedWalletAddress.value) {
    tempProjects = tempProjects.filter(project =>
      project.donors && project.donors.some(donor =>
        donor.address.toLowerCase() === connectedWalletAddress.value!.toLowerCase()
      )
    );
  }
  return tempProjects;
});

// Propriedade computada para aplicar a ordenação após a filtragem
const filteredAndSortedProjects = computed(() => {
  let tempProjects = [...filteredProjects.value];

  if (selectedSort.value === 'deadline') {
    tempProjects.sort((a, b) => a.deadline - b.deadline);
  } else if (selectedSort.value === 'progress') {
    tempProjects.sort((a, b) => projectProgress(b) - projectProgress(a));
  } else if (selectedSort.value === 'goalAmount') {
    tempProjects.sort((a, b) => parseFloat(b.goal) - parseFloat(a.goal));
  }
  return tempProjects;
});

async function loadProjects() {
  loading.value = true;
  projects.value = [];

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    try {
      const signer = await provider.getSigner();
      connectedWalletAddress.value = await signer.getAddress();
    } catch (e) {
      console.warn("Nenhuma carteira conectada ou permissão negada para obter endereço.", e);
      connectedWalletAddress.value = null;
    }

    const contract = new ethers.Contract(CROWDFUNDING_ADDRESS, CROWDFUNDING_ABI, provider);

    const count = await contract.getProjectsCount();
    const fetchedProjects: Project[] = [];

    for (let i = 0; i < count; i++) {
      const p = await contract.getProject(i);
      const [donorAddresses, donorAmounts] = await contract.getProjectDonorsWithAmounts(i);
      
      const projectDonors = [];
      for (let j = 0; j < donorAddresses.length; j++) {
        projectDonors.push({
          address: donorAddresses[j],
          amount: ethers.formatEther(donorAmounts[j])
        });
      }

      fetchedProjects.push({
        id: i,
        title: p.title,
        description: p.description,
        goal: ethers.formatEther(p.goal),
        amountRaised: ethers.formatEther(p.amountRaised),
        owner: p.owner,
        deadline: Number(p.deadline),
        fixedDonationAmount: p.fixedDonationAmount,
        requiredDonationAmount: ethers.formatEther(p.requiredDonationAmount),
        completed: p.completed,
        refunded: p.refunded,
        donors: projectDonors,
      });
    }

    projects.value = fetchedProjects;
  } catch (error) {
    console.error("Erro ao carregar projetos:", error);
    projects.value = [];
    alert("Ocorreu um erro ao carregar os projetos. Verifique a conexão com a blockchain e se o ABI está atualizado.");
  } finally {
    loading.value = false;
  }
}

async function handleDonate(projectId: number, amountString: string) {
  try {
    const project = projects.value.find(p => p.id === projectId); 
    if (!project) {
        alert("Projeto não encontrado ou removido.");
        return;
    }
    
    let amountToSend = amountString; 

    if (project.fixedDonationAmount) {
        amountToSend = project.requiredDonationAmount;
    }

    if (!amountToSend || amountToSend === '.' || parseFloat(amountToSend) <= 0 || isNaN(parseFloat(amountToSend))) {
      alert("Por favor, insira um valor numérico válido e positivo para a doação (ex: 0.01, 1.5). ");
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CROWDFUNDING_ADDRESS, CROWDFUNDING_ABI, signer);

    const tx = await contract.donate(projectId, { 
      value: ethers.parseEther(amountToSend)
    });

    alert("Confirmando sua doação... Por favor, aguarde a transação ser minerada.");
    await tx.wait(); 
    alert("Doação realizada com sucesso! 🎉");
    await loadProjects(); 
  } catch (error: any) {
    console.error("Erro ao doar:", error);
    if (error.code === 'ACTION_REJECTED' || error.code === 4001) { 
        alert("Doação cancelada pelo usuário.");
    } else if (error.message && error.message.includes("Must send exact fixed donation amount")) {
        alert(`Para este projeto, você deve doar exatamente ${parseFloat(projects.value.find(p => p.id === projectId)?.requiredDonationAmount || '0').toFixed(4)} MON.`);
    } else {
        alert("Ocorreu um erro ao processar sua doação. Por favor, tente novamente.");
    }
  }
}

onMounted(() => {
  loadProjects();
});
</script>

<style scoped>
/* Apenas estilos globais ou muito específicos da página devem ficar aqui,
   mas a maioria dos estilos para os cards e filtros agora estão em seus próprios componentes. */
</style>