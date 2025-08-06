<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Contêiner para os botões "Voltar" e "Compartilhar" -->
    <div class="flex justify-between items-center mb-6">
      <router-link to="/" class="inline-flex items-center text-blue-600 hover:text-blue-800">
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        Voltar para todos os projetos
      </router-link>

      <!-- Novo Botão "Compartilhar no X" -->
      <button v-if="project" @click="shareOnX"
        class="inline-flex items-center bg-black text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors duration-200">
        <svg class="w-4 h-4 mr-2" viewBox="0 0 1200 1227" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L452.078 685.889L0 1227H105.866L515.404 750.218L838.817 1227H1200L714.163 519.284ZM569.742 687.828L521.617 619.57L144.056 79.1363H306.678L610.742 516.453L658.868 584.71L1055.08 1150.86H892.459L569.742 687.828Z"
            fill="white" />
        </svg>
        Compartilhar
      </button>
    </div>

    <div v-if="loading" class="text-center text-gray-600 py-10">
      <p class="text-lg">Carregando detalhes do projeto...</p>
      <div class="mt-4 animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
    </div>
    <div v-else-if="!project" class="text-center text-gray-500 py-10">
      <p class="text-lg">Projeto não encontrado.</p>
    </div>
    <div v-else :class="['grid grid-cols-1 lg:grid-cols-3 gap-8 items-start',]">
      <!-- BLOCO ESQUERDO (Mais largo): Título, Criador, Descrição -->
      <div :class="[
          'lg:col-span-2 bg-white rounded-xl shadow-lg p-8 flex flex-col',
          getProjectBorderClass(project)
        ]">
        <h2 class="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 text-left break-words">
          <!-- ADICIONADO: break-words -->
          {{ project.title }}
        </h2>
        <p class="text-gray-700 text-base mb-6">
          <strong class="font-medium">Criador:</strong>
          <span class="text-blue-600 hover:underline cursor-pointer break-all">
            {{ formatAddress(project.owner) }}
          </span>
        </p>
        <div class="border-b border-gray-200 mb-6"></div>
        <div class="text-gray-700 text-base prose prose-lg" v-html="renderedDescription"></div>
      </div>

      <!-- BLOCO DIREITO (Mais estreito): Container flex para os sub-blocos -->
      <div class="lg:col-span-1 flex flex-col gap-8">
        <!-- SUB-BLOCO 1 (Detalhes do Projeto e Doação) -->
        <div class="bg-white rounded-xl shadow-lg p-8">
          <div class="text-gray-700 text-base mb-4">
            <p class="mb-1"><strong>Meta:</strong> {{ parseFloat(project.goal).toFixed(2) }} MON</p>
            <p class="mb-1"><strong>Arrecadado:</strong> {{ parseFloat(project.amountRaised).toFixed(2) }} MON</p>
            <p class="mb-1">
              <strong>Prazo:</strong>
              {{ formatDeadline(project.deadline) }}
            </p>
            <p v-if="project.fixedDonationAmount" class="mt-2 text-sm text-gray-500">
              (Doação Fixa: {{ parseFloat(project.requiredDonationAmount).toFixed(4) }} MON)
            </p>
          </div>

          <!-- Barra de Progresso -->
          <div class="mb-4">
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div class="bg-green-500 h-3 rounded-full transition-all duration-500 ease-out"
                :style="{ width: projectProgress(project).toFixed(2) + '%' }"></div>
            </div>
            <p class="text-sm text-gray-500 mt-2 text-right">
              {{ projectProgress(project).toFixed(2) }}% concluído
            </p>
          </div>

          <!-- Bloco condicional para input/botão de doação ou mensagem de status -->
          <div v-if="shouldShowDonateInput(project)" class="mt-4">
            <div class="flex items-center gap-2">
              <!-- Input para o valor da doação -->
              <input type="text" v-model="donationAmountInternal" @input="handleDonationInputChange"
                :placeholder="project.fixedDonationAmount ? parseFloat(project.requiredDonationAmount).toFixed(4) + ' (Fixo)' : '0.01'"
                :readonly="project.fixedDonationAmount" :class="[
                    'flex-grow border rounded-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-center font-mono',
                    { 'bg-gray-100 cursor-not-allowed': project.fixedDonationAmount },
                    'min-w-0'
                  ]" aria-label="Valor para Doação em MON" />
              <!-- Botão Doar -->
              <button @click="handleDonate"
                class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 whitespace-nowrap flex-shrink-0">
                Doar
              </button>
            </div>
            <!-- Indicação da taxa de serviço -->
            <p class="text-xs text-gray-500 mt-1 text-center">
              ℹ️ Taxa de serviço: 0.25% sobre o valor da doação.
            </p>
          </div>
          <div v-else class="mt-4 text-center">
            <p v-if="isProjectCompleted(project)" class="text-green-600 font-semibold text-lg">
              🎉 Parabéns! Meta alcançada! 🎉
            </p>
            <p v-else-if="hasDeadlinePassed(project) && !isProjectCompleted(project)"
              class="text-orange-600 font-semibold text-lg">
              ⚠️ Prazo encerrado. Meta não alcançada.
              <br>
              <span class="text-sm text-gray-500">(Doadores podem solicitar reembolso individualmente)</span>
            </p>
            <p v-else class="text-gray-500 text-lg">
              Projeto inativo ou em estado especial.
            </p>
          </div>
        </div>

        <!-- SUB-BLOCO 2 (Doadores e Botões de Ação) -->
        <div class="bg-white rounded-xl shadow-lg p-8">
          <!-- Botões de Ação (Sacar Meta / Sacar Doação) -->
          <div class="mb-4 flex flex-col space-y-3">
            <button v-if="canWithdrawGoal" @click="handleWithdrawGoal"
              class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 w-full">
              Sacar Meta ({{ parseFloat(project.amountRaised).toFixed(2) }} MON)
            </button>
            <button v-if="canClaimRefund" @click="handleClaimRefund"
              class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 w-full">
              Sacar Doação ({{ myDonationAmount.toFixed(4) }} MON)
            </button>
          </div>

          <h3 class="font-bold text-gray-700 mb-2">Doadores:</h3>
          <div v-if="project.donors && project.donors.length > 0" class="max-h-48 overflow-y-auto custom-scrollbar">
            <ul class="list-disc list-inside text-gray-600 text-sm">
              <li v-for="(donor, dIndex) in project.donors" :key="dIndex">
                <span class="font-medium">{{ formatAddress(donor.address) }}</span>: {{ parseFloat(donor.amount).toFixed(4) }} MON
              </li>
            </ul>
          </div>
          <p v-else class="text-sm text-gray-500 italic">
            Ainda não há doadores para este projeto.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ethers } from 'ethers';
import { CROWDFUNDING_ABI, CROWDFUNDING_ADDRESS } from '@/contracts';
import type { Project } from '@/types/project'; // Certifique-se de que este caminho está correto
import {
  projectProgress,
  formatAddress,
  formatDeadline,
  isProjectCompleted,
  hasDeadlinePassed,
  shouldShowDonateInput,
  getProjectBorderClass
} from '@/utils/projectHelpers'; // Certifique-se de que este caminho está correto
import { marked } from 'marked';
import { useToast } from "vue-toastification";

const props = defineProps<{
  id: string;
}>();

const route = useRoute();
const projectId = computed(() => Number(route.params.id));

const project = ref<Project | null>(null);
const loading = ref(true);
const connectedWalletAddress = ref<string | null>(null);
const myDonationAmount = ref(0 as number); // Nova variável para a doação do usuário logado

const donationAmountInternal = ref('');

const toast = useToast();

// Função para compartilhar no X (Twitter)
function shareOnX() {
  if (!project.value) {
    toast.error("Projeto não carregado para compartilhamento.");
    return;
  }

  const projectTitle = project.value.title;
  const projectLink = window.location.href; // Pega a URL atual da página

  const text = `Learn about and collaborate on the project: ${projectTitle}\n✨ IT ALL STARTS WITH A SPARK ✨\n${projectLink}\n#sparkmonad #monad #crowdfunding`;
  const twitterUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;

  window.open(twitterUrl, '_blank');
}

async function handleDonate() {
  if (!window.ethereum) { // Verificação para transações
    toast.error("MetaMask (ou outra carteira Ethereum) não detectada. Por favor, instale e conecte-se para realizar doações.");
    return;
  }
  if (!project.value) {
    toast.error("Projeto não carregado.");
    return;
  }

  let amountToSend = donationAmountInternal.value;

  if (project.value.fixedDonationAmount) {
    amountToSend = project.value.requiredDonationAmount;
  }

  const parsedAmount = parseFloat(amountToSend);
  if (!amountToSend || amountToSend === '.' || isNaN(parsedAmount) || parsedAmount < 0.001) {
    toast.warning("Por favor, insira um valor válido para a doação, igual ou superior a 0.001 MON.");
    return;
  }

  let pendingToast: string | number | undefined;

  try {
    // Para doações, SEMPRE precisamos de um BrowserProvider e de um Signer
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CROWDFUNDING_ADDRESS, CROWDFUNDING_ABI, signer);

    pendingToast = toast.info("Confirmando sua doação... Por favor, aguarde a transação ser confirmada.", {
      timeout: false,
      closeButton: false,
      closeOnClick: false,
      draggable: false,
    });

    const tx = await contract.donate(project.value.id, {
      value: ethers.parseEther(amountToSend)
    });

    await tx.wait();

    toast.dismiss(pendingToast);
    toast.success("Doação realizada com sucesso! 🎉");
    await loadProjectDetails(projectId.value); // Recarregar com o novo estado
  } catch (error: any) {
    console.error("Erro ao doar:", error);

    if (pendingToast) {
      toast.dismiss(pendingToast);
    }

    if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
      toast.error("Doação cancelada pelo usuário.");
    } else if (error.message && error.message.includes("Must send exact fixed donation amount")) {
      toast.error(`Para este projeto, você deve doar exatamente ${parseFloat(project.value.requiredDonationAmount || '0').toFixed(4)} MON.`);
    } else {
      toast.error("Ocorreu um erro ao processar sua doação. Por favor, tente novamente.");
    }
  }
}

// NOVO: Função para o proprietário sacar os fundos
async function handleWithdrawGoal() {
  if (!window.ethereum) { // Verificação para transações
    toast.error("MetaMask (ou outra carteira Ethereum) não detectada. Por favor, instale e conecte-se para sacar os fundos.");
    return;
  }
  if (!project.value) return;
  let pendingToast: string | number | undefined;
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CROWDFUNDING_ADDRESS, CROWDFUNDING_ABI, signer);

    pendingToast = toast.info("Solicitando saque da meta... Por favor, aguarde a transação.", {
      timeout: false, closeButton: false, closeOnClick: false, draggable: false,
    });

    const tx = await contract.withdrawFunds(project.value.id);
    await tx.wait();
    toast.dismiss(pendingToast);
    toast.success("Saque da meta realizado com sucesso! 🎉");
    await loadProjectDetails(projectId.value); // Recarrega os detalhes do projeto para atualizar o estado
  } catch (error: any) {
    console.error("Erro ao sacar meta:", error);
    if (pendingToast) toast.dismiss(pendingToast);
    if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
      toast.error("Saque da meta cancelado pelo usuário.");
    } else {
      toast.error(`Erro ao sacar meta: ${error.reason || error.message || 'Verifique os requisitos.'}`);
    }
  }
}

// NOVO: Função para o doador solicitar reembolso
async function handleClaimRefund() {
  if (!window.ethereum) { // Verificação para transações
    toast.error("MetaMask (ou outra carteira Ethereum) não detectada. Por favor, instale e conecte-se para solicitar o reembolso.");
    return;
  }
  if (!project.value) return;
  let pendingToast: string | number | undefined;
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CROWDFUNDING_ADDRESS, CROWDFUNDING_ABI, signer);

    pendingToast = toast.info("Solicitando reembolso da doação... Por favor, aguarde a transação.", {
      timeout: false, closeButton: false, closeOnClick: false, draggable: false,
    });

    const tx = await contract.claimRefund(project.value.id);
    await tx.wait();
    toast.dismiss(pendingToast);
    toast.success("Reembolso da doação realizado com sucesso! ✅");
    await loadProjectDetails(projectId.value); // Recarrega os detalhes do projeto para atualizar o estado
  } catch (error: any) {
    console.error("Erro ao solicitar reembolso:", error);
    if (pendingToast) toast.dismiss(pendingToast);
    if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
      toast.error("Reembolso cancelado pelo usuário.");
    } else {
      toast.error(`Erro ao solicitar reembolso: ${error.reason || error.message || 'Verifique os requisitos.'}`);
    }
  }
}


async function loadProjectDetails(id: number) {
  loading.value = true;
  project.value = null;
  myDonationAmount.value = 0; // Reset
  connectedWalletAddress.value = null; // Reset
  let providerInstance; // Variável para o provedor a ser usado

  try {
    if (window.ethereum) {
      // Caminho 1: MetaMask (ou carteira compatível) é detectado
      try {
        providerInstance = new ethers.BrowserProvider(window.ethereum);
        // Tenta obter o signatário e o endereço conectado
        const signer = await providerInstance.getSigner();
        connectedWalletAddress.value = await signer.getAddress();
        console.log("Carteira conectada (ProjectPage):", connectedWalletAddress.value);
      } catch (e) {
        // Se a inicialização do BrowserProvider ou getSigner falhar
        // (ex: usuário recusa conexão, ou nenhuma conta selecionada)
        console.warn("MetaMask detectado, mas não foi possível conectar ou obter o endereço do signatário. Carregando projetos em modo somente leitura (ProjectPage).", e);
        // Fallback para um provedor RPC público para operações somente leitura
        // IMPORTANTE: Substitua pelo URL RPC real da sua Monad Testnet!
        providerInstance = new ethers.JsonRpcProvider("https://monad-testnet.drpc.org");
      }
    } else {
      // Caminho 2: MetaMask (ou carteira compatível) NÃO é detectado
      console.warn("MetaMask não detectado. Carregando projetos com provedor público (somente leitura - ProjectPage).");
      // Use um provedor RPC público para operações somente leitura
      // IMPORTANTE: Substitua pelo URL RPC real da sua Monad Testnet!
      providerInstance = new ethers.JsonRpcProvider("https://monad-testnet.drpc.org");
    }

    if (!providerInstance) {
      throw new Error("Não foi possível inicializar um provedor Ethereum para ProjectPage. Verifique a configuração do RPC.");
    }

    // O contrato agora é inicializado com o providerInstance que pode ser BrowserProvider ou JsonRpcProvider
    const contract = new ethers.Contract(CROWDFUNDING_ADDRESS, CROWDFUNDING_ABI, providerInstance);

    const p = await contract.getProject(id);
    const [donorAddresses, donorAmounts] = await contract.getProjectDonorsWithAmounts(id);

    // Buscar a doação do usuário logado, se houver
    if (connectedWalletAddress.value) { // Usa connectedWalletAddress.value que foi setado acima
      try {
        const donation = await contract.getDonation(id, connectedWalletAddress.value);
        myDonationAmount.value = parseFloat(ethers.formatEther(donation));
      } catch (e) {
        console.error("Erro ao buscar doação do usuário logado:", e);
        myDonationAmount.value = 0;
      }
    }


    const projectDonors = [];
    for (let j = 0; j < donorAddresses.length; j++) {
      projectDonors.push({
        address: donorAddresses[j],
        amount: ethers.formatEther(donorAmounts[j])
      });
    }

    project.value = {
      id: id,
      title: p.title,
      description: p.description,
      goal: ethers.formatEther(p.goal),
      amountRaised: ethers.formatEther(p.amountRaised),
      owner: p.owner,
      deadline: Number(p.deadline),
      fixedDonationAmount: p.fixedDonationAmount,
      requiredDonationAmount: ethers.formatEther(p.requiredDonationAmount),
      completed: p.completed,
      withdrawn: p.withdrawn,
      refunded: p.refunded, // Adicionado (se o seu contrato tem essa propriedade e o ABI a inclui)
      donors: projectDonors,
    };

    if (project.value.fixedDonationAmount) {
      donationAmountInternal.value = parseFloat(project.value.requiredDonationAmount).toFixed(4);
    } else {
      donationAmountInternal.value = '';
    }

  } catch (error: any) {
    console.error(`Erro ao carregar projeto com ID ${id}:`, error);
    project.value = null;
    if (error.code === "CALL_EXCEPTION" && (error.data === "0x" || (error.data && error.data.message && error.data.message.includes("Invalid project ID")))) {
      toast.error("Projeto não encontrado ou ID inválido na blockchain.");
    } else {
      toast.error("Ocorreu um erro ao carregar os detalhes do projeto. Verifique a conexão com a blockchain e o URL RPC.");
    }
  } finally {
    loading.value = false;
  }
}

const renderedDescription = computed(() => {
  return project.value?.description ? marked.parse(project.value.description) : '';
});

function handleDonationInputChange() {
  if (project.value?.fixedDonationAmount) {
    return;
  }

  let value = donationAmountInternal.value;
  value = value.replace(/[^0-9.]/g, '');
  const parts = value.split('.');
  if (parts.length > 2) {
    value = parts[0] + '.' + parts.slice(1).join('');
  }
  if (value.startsWith('.')) {
    value = '0' + value;
  }
  if (value.length > 1 && value.startsWith('0') && !value.startsWith('0.')) {
    value = parseFloat(value).toString();
  }
  donationAmountInternal.value = value;
}

// NOVO: Propriedade computada para controlar a visibilidade do botão "Sacar Meta"
const canWithdrawGoal = computed(() => {
  if (!project.value || !connectedWalletAddress.value) return false;
  return (
    project.value.completed && // Meta foi batida
    connectedWalletAddress.value.toLowerCase() === project.value.owner.toLowerCase() && // É o dono do projeto
    !project.value.withdrawn // Os fundos ainda não foram sacados
  );
});

// NOVO: Propriedade computada para controlar a visibilidade do botão "Sacar Doação"
const canClaimRefund = computed(() => {
  if (!project.value || !connectedWalletAddress.value) return false;
  const hasDonation = myDonationAmount.value > 0; // O usuário conectado tem uma doação registrada

  return (
    hasDeadlinePassed(project.value) && // O prazo do projeto passou
    !project.value.completed && // A meta do projeto NÃO foi batida
    // Opcional: Se o seu contrato gerencia um flag 'refunded' por doador
    // E se o doador atual ainda não pediu reembolso
    // Exemplo: project.value.donors.find(d => d.address.toLowerCase() === connectedWalletAddress.value.toLowerCase())?.refunded !== true
    !project.value.withdrawn && // O proprietário AINDA NÃO sacou (se tivesse sacado, não seria um projeto falho)
    hasDonation
  );
});


onMounted(() => {
  loadProjectDetails(projectId.value);

  if (history.state && history.state.toastMessage) {
    if (history.state.newlyCreatedProjectId === projectId.value) {
      toast.success(history.state.toastMessage);
      delete history.state.toastMessage;
      delete history.state.newlyCreatedProjectId;
    }
  }
});

watch(projectId, (newId) => {
  if (newId) {
    loadProjectDetails(newId);
  }
});
</script>

<style scoped>
/* Estilos específicos para esta página */
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

<style>
/* Estilos globais para o conteúdo Markdown */
.prose pre {
  white-space: pre-wrap;
  word-break: break-word;
  overflow-x: hidden;
}

.prose code {
  word-break: break-word;
}
</style>