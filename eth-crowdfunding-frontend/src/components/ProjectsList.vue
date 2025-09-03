<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h2 class="text-3xl font-extrabold text-gray-900 mb-8 text-center">
      ✨ IT ALL STARTS WITH A SPARK ✨
    </h2>

    <!-- Controles de Filtro, Ordenação e Busca -->
    <ProjectFiltersAndSort
      v-model:selectedFilterProp="selectedFilter"
      v-model:selectedSortProp="selectedSort"
      v-model:searchQueryProp="searchQuery"
      :connectedWalletAddress="connectedWalletAddress"
      v-model:showExpiredProp="showExpiredProjects"
      v-model:showCompletedProp="showCompletedProjects"
    />

    <div v-if="loading" class="text-center text-gray-600 py-10">
      <p class="text-lg">Carregando projetos...</p>
      <div class="mt-4 animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
    </div>
    <div v-else-if="!selectedNetwork" class="text-center text-gray-500 py-10">
      <p class="text-lg">Por favor, selecione uma rede para visualizar os projetos.</p>
      <p class="text-sm mt-2">Você pode fazer isso através do seletor de rede no cabeçalho.</p>
    </div>
    <div v-else-if="filteredAndSortedProjects.length === 0" class="text-center text-gray-500 py-10">
      <p class="text-lg">Nenhum projeto encontrado para o filtro/ordenação/busca selecionado na rede {{ selectedNetwork.name }}.</p>
      <p class="text-sm mt-2">Que tal criar o seu próprio projeto ou ajustar os filtros?</p>
    </div>
    <div v-else class="grid xs:grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
      <ProjectCard
        v-for="project in filteredAndSortedProjects"
        :key="project.id"
        :project="project"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, inject } from "vue";
import { ethers } from "ethers";
import { CROWDFUNDING_ABI } from "@/contracts";
import ProjectFiltersAndSort from '@/components/ProjectFiltersAndSort.vue';
import ProjectCard from '@/components/ProjectCard.vue';
import type { Project } from '@/types/project';
import { isProjectCompleted, hasDeadlinePassed, projectProgress } from '@/utils/projectHelpers';

const projects = ref<Project[]>([]);
const loading = ref(true);

const selectedFilter = ref<'all' | 'myProjects' | 'myContributions'>('all');
const selectedSort = ref<'deadline' | 'progress' | 'goalAmount'>('deadline');
const searchQuery = ref<string>('');
const connectedWalletAddress = ref<string | null>(null);

const showExpiredProjects = ref(false);
const showCompletedProjects = ref(false);

watch(selectedFilter, (newFilter) => {
  if (newFilter === 'myProjects' || newFilter === 'myContributions') {
    showExpiredProjects.value = true;
    showCompletedProjects.value = true;
  } else if (newFilter === 'all') {
    showExpiredProjects.value = false;
    showCompletedProjects.value = false;
  }
});


const selectedNetwork = inject('selectedNetwork', ref(null));
const CONTRACT_ADDRESSES = inject('CONTRACT_ADDRESSES');

const currentRpcUrl = ref<string | null>(null);
const currentContractAddress = ref<string | null>(null);

const filteredProjects = computed(() => {
  if (!projects.value) return [];

  let tempProjects = [...projects.value];

  // FILTRO ATUALIZADO PARA EXPIRED E COMPLETED
  tempProjects = tempProjects.filter(project => {
    const isExpired = hasDeadlinePassed(project);
    const isCompleted = isProjectCompleted(project);

    // Condição para incluir um projeto com base nos checkboxes de 'vencido' e 'meta batida'
    let includeByStatus = true;

    // Lógica principal de exclusão
    if (!showExpiredProjects.value && isExpired) {
      includeByStatus = false; // Excluir se não quiser ver vencidos E o projeto estiver vencido
    }
    if (!showCompletedProjects.value && isCompleted) {
      includeByStatus = false; // Excluir se não quiser ver batidos E o projeto bateu a meta
    }

    // Lógica de override: Se o filtro "Mostrar metas batidas" está ativo
    // E o projeto bateu a meta, ele DEVE ser incluído, mesmo que tenha vencido
    // e o filtro "Mostrar vencidos" esteja desativado.
    if (showCompletedProjects.value && isCompleted) {
      includeByStatus = true;
    }

    // Retorna se o projeto passou no filtro de status (expired/completed)
    return includeByStatus;
  });


  // Filtros existentes (proprietário, colaborador, busca por título)
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

  if (searchQuery.value) {
    const lowerCaseSearchQuery = searchQuery.value.toLowerCase();
    tempProjects = tempProjects.filter(project =>
      project.title.toLowerCase().includes(lowerCaseSearchQuery)
    );
  }

  return tempProjects;
});

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
  connectedWalletAddress.value = null;

  if (!selectedNetwork.value) {
    console.warn("Nenhuma rede selecionada. Não foi possível carregar projetos.");
    loading.value = false;
    return;
  }

  const chainIdDecimal = selectedNetwork.value.chainId;
  currentRpcUrl.value = selectedNetwork.value.rpcUrl;
  currentContractAddress.value = CONTRACT_ADDRESSES[chainIdDecimal];

  if (!currentRpcUrl.value || !currentContractAddress.value) {
    console.error(`Configurações de RPC ou Endereço de Contrato não encontradas para a rede: ${selectedNetwork.value.name} (Chain ID: ${chainIdDecimal}).`);
    alert(`As configurações de RPC ou endereço de contrato para a rede ${selectedNetwork.value.name} não foram encontradas. Por favor, verifique o arquivo networks.js.`);
    loading.value = false;
    return;
  }

  let providerInstance;

  try {
    if (window.ethereum) {
      try {
        providerInstance = new ethers.BrowserProvider(window.ethereum);
        const signer = await providerInstance.getSigner();
        connectedWalletAddress.value = await signer.getAddress();

        const walletNetwork = await providerInstance.getNetwork();
        if (walletNetwork.chainId.toString() !== chainIdDecimal) {
          console.warn(`A carteira está na rede ${walletNetwork.name} (Chain ID: ${walletNetwork.chainId}), mas a aplicação está configurada para ${selectedNetwork.value.name} (Chain ID: ${chainIdDecimal}). Transações (doações) podem falhar até que a carteira seja trocada. Os dados serão carregados em modo leitura.`);
        }

      } catch (e) {
        console.warn("MetaMask detectado, mas não foi possível conectar ou obter o endereço do signatário. Carregando projetos em modo somente leitura com o RPC da rede selecionada.", e);
        providerInstance = new ethers.JsonRpcProvider(currentRpcUrl.value);
      }
    } else {
      console.warn("MetaMask não detectado. Carregando projetos com provedor público (somente leitura) usando o RPC da rede selecionada.");
      providerInstance = new ethers.JsonRpcProvider(currentRpcUrl.value);
    }

    if (!providerInstance) {
      throw new Error("Não foi possível inicializar um provedor Ethereum. Verifique a configuração do RPC.");
    }

    const contract = new ethers.Contract(currentContractAddress.value, CROWDFUNDING_ABI, providerInstance);

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
    alert("Ocorreu um erro ao carregar os projetos para a rede selecionada. Isso pode ser devido à falta de conexão com a rede Ethereum, um RPC inválido, ou o contrato não ter sido implantado nesta rede. Por favor, tente novamente mais tarde.");
  } finally {
    loading.value = false;
  }
}

watch(selectedNetwork, (newNetwork, oldNetwork) => {
  if (newNetwork && newNetwork !== oldNetwork) {
    loadProjects();
  } else if (!newNetwork) {
    projects.value = [];
    loading.value = false;
  }
}, { immediate: true });
</script>

<style scoped>
/* Apenas estilos globais ou muito específicos da página devem ficar aqui,
   mas a maioria dos estilos para os cards e filtros agora estão em seus próprios componentes. */
</style>