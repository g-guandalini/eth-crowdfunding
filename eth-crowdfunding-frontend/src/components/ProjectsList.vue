<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h2 class="text-3xl font-extrabold text-gray-900 mb-8 text-center">
      🚀 Projetos Ativos para Apoiar
    </h2>

    <!-- Controles de Filtro e Ordenação -->
    <div class="mb-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
      <!-- Botões de Filtro -->
      <div class="flex-grow flex flex-wrap gap-2 justify-center sm:justify-start">
        <button
            @click="selectedFilter = 'all'"
            :class="['px-4 py-2 rounded-lg font-medium transition-colors', selectedFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300']"
        >
          Todos os Projetos
        </button>
        <button
            @click="selectedFilter = 'myProjects'"
            :disabled="!connectedWalletAddress"
            :class="['px-4 py-2 rounded-lg font-medium transition-colors', selectedFilter === 'myProjects' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300', !connectedWalletAddress && 'opacity-50 cursor-not-allowed']"
        >
          Meus Projetos
        </button>
        <button
            @click="selectedFilter = 'myContributions'"
            :disabled="!connectedWalletAddress"
            :class="['px-4 py-2 rounded-lg font-medium transition-colors', selectedFilter === 'myContributions' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300', !connectedWalletAddress && 'opacity-50 cursor-not-allowed']"
        >
          Minhas Colaborações
        </button>
      </div>

      <!-- Dropdown de Ordenação -->
      <div class="relative w-full sm:w-auto">
        <select
            v-model="selectedSort"
            class="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10"
        >
          <option value="deadline">Ordernar por: Prazo</option>
          <option value="progress">Ordernar por: Percentual arrecadado em relação a meta</option>
          <option value="goalAmount">Ordernar por: Meta</option>
        </select>
        
      </div>
    </div>

    <div v-if="loading" class="text-center text-gray-600 py-10">
      <p class="text-lg">Carregando projetos...</p>
      <div class="mt-4 animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
    </div>
    <div v-else-if="filteredAndSortedProjects.length === 0" class="text-center text-gray-500 py-10">
      <p class="text-lg">Nenhum projeto encontrado para o filtro/ordenação selecionado.</p>
      <p class="text-sm mt-2">Que tal criar o seu próprio projeto ou ajustar os filtros?</p>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="(project) in filteredAndSortedProjects"
        :key="project.id"
        :class="[
          'bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between h-full border-2',
          getProjectBorderClass(project) // Classe de borda dinâmica
        ]"
      >
        <div>
          <h3 class="text-2xl font-extrabold text-gray-800 mb-3 truncate" :title="project.title">
            {{ project.title }}
          </h3>
          <p class="text-gray-600 text-sm mb-4 line-clamp-3">
            {{ project.description }}
          </p>

          <div class="text-gray-700 text-base mb-2">
            <p class="mb-1"><strong>Meta:</strong> {{ parseFloat(project.goal).toFixed(2) }} ETH</p>
            <p class="mb-1"><strong>Arrecadado:</strong> {{ parseFloat(project.amountRaised).toFixed(2) }} ETH</p>
            <!-- Nova linha: Data Limite -->
            <p class="mb-1">
              <strong>Prazo:</strong>
              {{ formatDeadline(project.deadline) }}
            </p>
            <!-- Nova linha: Indicador de doação fixa -->
            <p v-if="project.fixedDonationAmount" class="mb-1 text-sm text-gray-500">
                (Doação Fixa: {{ parseFloat(project.requiredDonationAmount).toFixed(4) }} ETH)
            </p>
          </div>

          <!-- Barra de Progresso -->
          <div class="mb-4">
            <div class="w-full bg-gray-200 rounded-full h-2.5">
              <div
                class="bg-green-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                :style="{ width: projectProgress(project) + '%' }"
              ></div>
            </div>
            <p class="text-sm text-gray-500 mt-1">
              {{ projectProgress(project).toFixed(2) }}% concluído
            </p>
          </div>
        </div>

        <!-- Bloco condicional para input/botão de doação ou mensagem de status -->
        <div v-if="shouldShowDonateInput(project)" class="mt-auto flex items-center gap-2">
          <!-- Input para o valor da doação -->
          <input
            type="text"
            v-model="project.donationAmount"
            @input="handleDonationInputChange(project)"
            :placeholder="project.fixedDonationAmount ? parseFloat(project.requiredDonationAmount).toFixed(4) + ' ETH (Fixo)' : '0.01 ETH'"
            :readonly="project.fixedDonationAmount"
            :class="[
              'flex-grow border rounded-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-center font-mono',
              { 'bg-gray-100 cursor-not-allowed': project.fixedDonationAmount } // Estilo para input readonly
            ]"
            aria-label="Valor para Doação em ETH"
          />
          <!-- Botão Doar -->
          <button
            @click="donate(project.id, project.donationAmount)" 
            class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 whitespace-nowrap"
          >
            Doar
          </button>
        </div>
        <div v-else class="mt-auto pt-4 text-center">
          <p v-if="isProjectCompleted(project)" class="text-green-600 font-semibold text-lg">
            🎉 Parabéns! Meta alcançada! 🎉
          </p>
          <p v-else-if="hasDeadlinePassed(project) && !isProjectCompleted(project)" class="text-orange-600 font-semibold text-lg">
            😔 Prazo encerrado. Meta não alcançada.
            <br>
            <span v-if="project.refunded" class="text-sm text-gray-500">(Reembolsos em processamento ou concluídos)</span>
            <span v-else class="text-sm text-gray-500">(Aguardando processo de reembolso)</span>
          </p>
          <p v-else class="text-gray-500 text-lg">
              Projeto inativo ou em estado especial.
          </p>
        </div>

        <!-- Nova seção: Doadores -->
        <div class="mt-4 border-t pt-4 border-gray-200">
          <h4 class="font-bold text-gray-700 mb-2">Doadores:</h4>
          <div v-if="project.donors && project.donors.length > 0" class="max-h-24 overflow-y-auto custom-scrollbar">
            <ul class="list-disc list-inside text-gray-600 text-sm">
              <li v-for="(donor, dIndex) in project.donors" :key="dIndex"> 
                <span class="font-medium">{{ formatAddress(donor.address) }}</span>: {{ parseFloat(donor.amount).toFixed(4) }} ETH
              </li>
            </ul>
          </div>
          <p v-else class="text-sm text-gray-500 italic">
            Ainda não há doadores para este projeto.
          </p>
        </div>

        <p class="text-gray-700 text-sm mt-4">
          <strong class="font-medium">Criador:</strong>
          <span class="text-blue-600 hover:underline cursor-pointer break-all">
            {{ formatAddress(project.owner) }}
          </span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { ethers } from "ethers";
import { CROWDFUNDING_ABI, CROWDFUNDING_ADDRESS } from "../contracts"; // Certifique-se de que estes paths estão corretos

// Interface para um doador individual
interface Donor {
  address: string;
  amount: string; // Valor doado em ETH (string formatada)
}

// Interface principal para um projeto
interface Project {
  id: number; // Adicionado para identificar unicamente o projeto ao doar e para chaves
  title: string;
  description: string;
  goal: string; // ETH string
  amountRaised: string; // ETH string
  owner: string;
  donationAmount: string; // Valor no input para doação (pode ser temporário)
  deadline: number; // Unix timestamp em segundos
  fixedDonationAmount: boolean;
  requiredDonationAmount: string; // ETH string (se fixedDonationAmount for true)
  completed: boolean; // Flag do contrato
  refunded: boolean; // Flag do contrato
  donors?: Donor[]; // Nova propriedade para a lista de doadores
}

const projects = ref<Project[]>([]);
const loading = ref(true);

// Estados para Filtro e Ordenação
const selectedFilter = ref<'all' | 'myProjects' | 'myContributions'>('all');
const selectedSort = ref<'deadline' | 'progress' | 'goalAmount'>('deadline');
const connectedWalletAddress = ref<string | null>(null);

// Função para manipular e formatar o input de doação (máscara básica)
function handleDonationInputChange(project: Project) {
  // Se a doação for fixa, o input é readonly e não deve ser modificado pelo usuário
  if (project.fixedDonationAmount) {
    return;
  }

  let value = project.donationAmount;

  // 1. Remover caracteres não numéricos, exceto o ponto decimal
  value = value.replace(/[^0-9.]/g, '');

  // 2. Garantir que não haja mais de um ponto decimal
  const parts = value.split('.');
  if (parts.length > 2) {
    value = parts[0] + '.' + parts.slice(1).join('');
  }

  // 3. Garantir zero à esquerda se começar com ponto (ex: .5 -> 0.5)
  if (value.startsWith('.')) {
    value = '0' + value;
  }

  // 4. Se o valor for "0" e o próximo caracter for "0", mantemos apenas um "0"
  if (value.length > 1 && value.startsWith('0') && !value.startsWith('0.')) {
    value = parseFloat(value).toString();
  }

  project.donationAmount = value;
}

// Funções existentes
function projectProgress(project: Project): number {
  const goal = parseFloat(project.goal);
  const amountRaised = parseFloat(project.amountRaised);
  // Garante que não haverá NaN ou divisão por zero
  if (isNaN(goal) || isNaN(amountRaised) || goal <= 0) return 0;
  return Math.min((amountRaised / goal) * 100, 100);
}

function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

// Nova função para formatar o timestamp do deadline
function formatDeadline(timestamp: number): string {
  if (!timestamp) return 'N/A';
  // Unix timestamp está em segundos, Date espera milissegundos
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });
}

// Funções auxiliares para determinar o status do projeto e as classes CSS
function isProjectCompleted(project: Project): boolean {
  // Usa a flag `completed` do contrato ou verifica se a meta foi atingida
  return project.completed || parseFloat(project.amountRaised) >= parseFloat(project.goal);
}

function hasDeadlinePassed(project: Project): boolean {
  // Compara o tempo atual (em segundos) com o deadline do projeto
  return Date.now() / 1000 >= project.deadline;
}

function shouldShowDonateInput(project: Project): boolean {
  // Mostra o input/botão de doação apenas se o projeto não estiver completo,
  // se o prazo não tiver passado E se não tiver sido reembolsado.
  return !isProjectCompleted(project) && !hasDeadlinePassed(project) && !project.refunded;
}

function getProjectBorderClass(project: Project): string {
  if (isProjectCompleted(project)) {
    return 'border-green-500'; // Borda verde para projetos concluídos
  }
  if (hasDeadlinePassed(project) && !isProjectCompleted(project)) {
    return 'border-orange-500'; // Borda laranja para projetos com prazo encerrado e meta não atingida
  }
  return 'border-gray-100'; // Borda padrão
}

// Propriedade computada para aplicar os filtros
const filteredProjects = computed(() => {
  if (!projects.value) return [];

  let tempProjects = [...projects.value]; // Cria uma cópia rasa para filtrar

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
  let tempProjects = [...filteredProjects.value]; // Cria uma cópia rasa dos resultados filtrados

  if (selectedSort.value === 'deadline') {
    tempProjects.sort((a, b) => a.deadline - b.deadline); // Mais próximo (menor timestamp) primeiro
  } else if (selectedSort.value === 'progress') {
    tempProjects.sort((a, b) => projectProgress(b) - projectProgress(a)); // Mais perto de 100% primeiro
  } else if (selectedSort.value === 'goalAmount') {
    tempProjects.sort((a, b) => parseFloat(b.goal) - parseFloat(a.goal)); // Maior valor primeiro
  }
  return tempProjects;
});


async function loadProjects() {
  loading.value = true;
  projects.value = []; // Limpa projetos anteriores

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    // Tenta obter o endereço da carteira conectada
    try {
      const signer = await provider.getSigner();
      connectedWalletAddress.value = await signer.getAddress();
    } catch (e) {
      console.warn("Nenhuma carteira conectada ou permissão negada para obter endereço.", e);
      connectedWalletAddress.value = null; // Garante que o estado está correto
    }


    const contract = new ethers.Contract(CROWDFUNDING_ADDRESS, CROWDFUNDING_ABI, provider);

    const count = await contract.getProjectsCount();
    const fetchedProjects: Project[] = [];

    for (let i = 0; i < count; i++) {
      // Obtém os detalhes básicos do projeto
      const p = await contract.getProject(i);

      // Obtém a lista de doadores e seus valores para o projeto
      const [donorAddresses, donorAmounts] = await contract.getProjectDonorsWithAmounts(i);
      
      const projectDonors: Donor[] = [];
      for (let j = 0; j < donorAddresses.length; j++) {
        projectDonors.push({
          address: donorAddresses[j],
          amount: ethers.formatEther(donorAmounts[j])
        });
      }

      // Converte valores BigInt do contrato para string ETH formatada para exibição
      fetchedProjects.push({
        id: i, // Adiciona o ID do projeto
        title: p.title,
        description: p.description,
        goal: ethers.formatEther(p.goal),
        amountRaised: ethers.formatEther(p.amountRaised),
        owner: p.owner,
        deadline: Number(p.deadline), // Converte BigInt para Number (timestamp em segundos)
        fixedDonationAmount: p.fixedDonationAmount,
        requiredDonationAmount: ethers.formatEther(p.requiredDonationAmount),
        completed: p.completed,
        refunded: p.refunded,
        donors: projectDonors, // Adiciona a lista de doadores
        // Define o valor inicial do input de doação. Se for fixo, usa o valor fixo.
        donationAmount: p.fixedDonationAmount ? ethers.formatEther(p.requiredDonationAmount) : '0.01' // Valor padrão para UX
      });
    }

    projects.value = fetchedProjects;
  } catch (error) {
    console.error("Erro ao carregar projetos:", error);
    // Se ocorrer um erro durante o carregamento, zera os projetos e informa o loading como falso
    projects.value = [];
    alert("Ocorreu um erro ao carregar os projetos. Verifique a conexão com a blockchain e se o ABI está atualizado.");
  } finally {
    loading.value = false;
  }
}

async function donate(projectId: number, amountString: string) { 
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
    alert("Doação realizada com sucesso! ��");
    await loadProjects(); 
  } catch (error: any) {
    console.error("Erro ao doar:", error);
    if (error.code === 'ACTION_REJECTED' || error.code === 4001) { 
        alert("Doação cancelada pelo usuário.");
    } else if (error.message && error.message.includes("Must send exact fixed donation amount")) {
        alert(`Para este projeto, você deve doar exatamente ${parseFloat(projects.value.find(p => p.id === projectId)?.requiredDonationAmount || '0').toFixed(4)} ETH.`);
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
/* Você pode adicionar estilos específicos aqui se precisar, mas o Tailwind já cuida da maioria. */
/* Exemplo para truncar texto e adicionar reticências em várias linhas */
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Estilo para a scrollbar customizada */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>