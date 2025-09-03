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
        {{ $t('back_to_all_projects') }}
      </router-link>

      <!-- Novo Botão "Compartilhar no X" -->
      <button v-if="project" @click="shareOnX"
        class="inline-flex items-center bg-black text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors duration-200">
        <svg class="w-4 h-4 mr-2" viewBox="0 0 1200 1227" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L452.078 685.889L0 1227H105.866L515.404 750.218L838.817 1227H1200L714.163 519.284ZM569.742 687.828L521.617 619.57L144.056 79.1363H306.678L610.742 516.453L658.868 584.71L1055.08 1150.86H892.459L569.742 687.828Z"
            fill="white" />
        </svg>
        {{ $t('share') }}
      </button>
    </div>

    <div v-if="loading" class="text-center text-gray-600 py-10">
      <p class="text-lg">{{ $t('loading_project_details') }}</p>
      <div class="mt-4 animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
    </div>
    <div v-else-if="!selectedNetwork" class="text-center text-gray-500 py-10">
      <p class="text-lg">Por favor, selecione uma rede para visualizar os detalhes do projeto.</p>
      <p class="text-sm mt-2">Você pode fazer isso através do seletor de rede no cabeçalho.</p>
    </div>
    <div v-else-if="!project" class="text-center text-gray-500 py-10">
      <p class="text-lg">{{ $t('project_not_found') }}</p>
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
          <strong class="font-medium">{{ $t('creator') }}:</strong>
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
            <p class="mb-1"><strong>{{ $t('goal') }}:</strong> {{ parseFloat(project.goal).toFixed(2) }} {{ currentCurrencySymbol }}</p>
            <p class="mb-1"><strong>{{ $t('raised') }}:</strong> {{ parseFloat(project.amountRaised).toFixed(2) }} {{ currentCurrencySymbol }}</p>
            <p class="mb-1">
              <strong>{{ $t('deadline') }}:</strong>
              {{ formatDeadline(project.deadline, locale) }}
            </p>
            <p v-if="project.fixedDonationAmount" class="mt-2 text-sm text-gray-500">
              ({{ $t('fixed_donation') }}: {{ parseFloat(project.requiredDonationAmount).toFixed(4) }} {{ currentCurrencySymbol }})
            </p>
          </div>

          <!-- Barra de Progresso -->
          <div class="mb-4">
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div class="bg-green-500 h-3 rounded-full transition-all duration-500 ease-out"
                :style="{ width: projectProgress(project).toFixed(2) + '%' }"></div>
            </div>
            <p class="text-sm text-gray-500 mt-2 text-right">
              {{ projectProgress(project).toFixed(2) }}% {{ $t('completed') }}
            </p>
          </div>

          <!-- Bloco condicional para input/botão de doação ou mensagem de status -->
          <div v-if="shouldShowDonateInput(project)" class="mt-4">
            <div class="flex items-center gap-2">
              <!-- Input para o valor da doação -->
              <input type="text" v-model="donationAmountInternal" @input="handleDonationInputChange"
                :placeholder="project.fixedDonationAmount ? parseFloat(project.requiredDonationAmount).toFixed(4) + ` ${currentCurrencySymbol} (${$t('fixed_text')})` : '0.01'"
                :readonly="project.fixedDonationAmount" :class="[
                    'flex-grow border rounded-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-center font-mono',
                    { 'bg-gray-100 cursor-not-allowed': project.fixedDonationAmount },
                    'min-w-0'
                  ]" :aria-label="t('value_for_donation_input', { currency: currentCurrencySymbol })" />
              <!-- Botão Doar -->
              <button @click="handleDonate"
                class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 whitespace-nowrap flex-shrink-0">
                {{ $t('donate') }}
              </button>
            </div>
            <!-- Indicação da taxa de serviço -->
            <p class="text-xs text-gray-500 mt-1 text-center">
              ℹ️ {{ $t('service_fee_donation') }}
            </p>
          </div>
          <div v-else class="mt-4 text-center">
            <p v-if="isProjectCompleted(project)" class="text-green-600 font-semibold text-lg">
              {{ $t('congrats_goal_reached') }}
            </p>
            <p v-else-if="hasDeadlinePassed(project) && !isProjectCompleted(project)"
              class="text-orange-600 font-semibold text-lg">
              {{ $t('deadline_passed_goal_not_reached') }}
              <br>
              <span class="text-sm text-gray-500">({{ $t('donors_can_request_refund') }})</span>
            </p>
            <p v-else class="text-gray-500 text-lg">
              {{ $t('project_inactive_special_status') }}
            </p>
          </div>
        </div>

        <!-- SUB-BLOCO 2 (Doadores e Botões de Ação) -->
        <div class="bg-white rounded-xl shadow-lg p-8">
          <!-- Botões de Ação (Sacar Meta / Sacar Doação) -->
          <div class="mb-4 flex flex-col space-y-3">
            <button v-if="canWithdrawGoal" @click="handleWithdrawGoal"
              class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 w-full">
              {{ $t('withdraw_goal') }} ({{ parseFloat(project.amountRaised).toFixed(2) }} {{ currentCurrencySymbol }})
            </button>
            <button v-if="canClaimRefund" @click="handleClaimRefund"
              class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 w-full">
              {{ $t('withdraw_donation') }} ({{ myDonationAmount.toFixed(4) }} {{ currentCurrencySymbol }})
            </button>
          </div>

          <h3 class="font-bold text-gray-700 mb-2">{{ $t('donors') }}:</h3>
          <div v-if="project.donors && project.donors.length > 0" class="max-h-48 overflow-y-auto custom-scrollbar">
            <ul class="list-disc list-inside text-gray-600 text-sm">
              <li v-for="(donor, dIndex) in project.donors" :key="dIndex">
                <span class="font-medium">{{ formatAddress(donor.address) }}</span>: {{ parseFloat(donor.amount).toFixed(4) }} {{ currentCurrencySymbol }}
              </li>
            </ul>
          </div>
          <p v-else class="text-sm text-gray-500 italic">
            {{ $t('no_donors_yet') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, inject } from 'vue';
import { useRoute } from 'vue-router';
import { ethers } from 'ethers';
import { CROWDFUNDING_ABI } from '@/contracts';
import type { Project } from '@/types/project';
import {
  projectProgress,
  formatAddress,
  formatDeadline,
  isProjectCompleted,
  hasDeadlinePassed,
  shouldShowDonateInput,
  getProjectBorderClass
} from '@/utils/projectHelpers';
import { marked } from 'marked';
import { useToast } from "vue-toastification";
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();

const props = defineProps<{
  id: string;
}>();

const route = useRoute();
const projectId = computed(() => Number(route.params.id));

const project = ref<Project | null>(null);
const loading = ref(true);
const connectedWalletAddress = ref<string | null>(null);
const myDonationAmount = ref(0 as number);

const donationAmountInternal = ref('');

const toast = useToast();

// INJETANDO DADOS DO APP.VUE
const selectedNetwork = inject('selectedNetwork', ref(null));
const CONTRACT_ADDRESSES = inject('CONTRACT_ADDRESSES');

// Variáveis para armazenar o RPC e Endereço do Contrato da rede ATIVA
const currentRpcUrl = ref<string | null>(null);
const currentContractAddress = ref<string | null>(null);

// PROPRIEDADE COMPUTADA PARA O SÍMBOLO DA MOEDA
const currentCurrencySymbol = computed(() => {
    // Retorna o símbolo da moeda da rede selecionada, ou 'MON' como fallback padrão
    return selectedNetwork.value?.currency?.symbol || 'MON';
});

// NOVA PROPRIEDADE COMPUTADA PARA O NOME DA REDE PARA HASHTAG
const currentNetworkNameForHashtag = computed(() => {
    if (selectedNetwork.value?.name) {
        // Pega a primeira palavra do nome da rede e converte para minúsculas
        // Ex: "Monad Testnet" -> "monad"
        // Ex: "MegaETH Testnet" -> "megaeth"
        return selectedNetwork.value.name.split(' ')[0].toLowerCase();
    }
    return 'monad'; // Fallback padrão
});

// Função para compartilhar no X (Twitter)
function shareOnX() {
  if (!project.value) {
    toast.error(t('project_not_loaded_for_sharing'));
    return;
  }

  const projectTitle = project.value.title;
  const projectLink = window.location.href;

  // Usa o símbolo dinâmico na mensagem de compartilhamento
  const text = `Learn about and collaborate on the project: ${projectTitle}\n✨ IT ALL STARTS WITH A SPARK ✨\n${projectLink}\n#spark${currentNetworkNameForHashtag.value} #${currentCurrencySymbol.value.toLowerCase()} #crowdfunding`;
  const twitterUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;

  window.open(twitterUrl, '_blank');
}

async function handleDonate() {
  if (!window.ethereum) {
    toast.error(t('no_wallet_detected_donate'));
    return;
  }
  if (!project.value) {
    toast.error(t('project_not_loaded'));
    return;
  }

  // Verificar se uma rede está selecionada e se o endereço do contrato está disponível
  if (!selectedNetwork.value || !currentContractAddress.value) {
    toast.error("Nenhuma rede selecionada ou endereço de contrato não disponível para doação. Por favor, selecione uma rede válida.");
    return;
  }

  let amountToSend = donationAmountInternal.value;

  if (project.value.fixedDonationAmount) {
    amountToSend = project.value.requiredDonationAmount;
  }

  const parsedAmount = parseFloat(amountToSend);
  if (!amountToSend || amountToSend === '.' || isNaN(parsedAmount) || parsedAmount < 0.001) {
    toast.warning(t('please_enter_valid_donation_value', { currency: currentCurrencySymbol.value }));
    return;
  }

  let pendingToast: string | number | undefined;

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // **VERIFICAÇÃO CRÍTICA: A carteira do usuário está na mesma rede que a aplicação?**
    const walletNetwork = await provider.getNetwork();
    const targetChainIdDecimal = selectedNetwork.value.chainId;

    if (walletNetwork.chainId.toString() !== targetChainIdDecimal) {
      toast.error(`Sua carteira está na rede ${walletNetwork.name}, mas a aplicação está configurada para ${selectedNetwork.value.name}. Por favor, mude sua carteira para a rede ${selectedNetwork.value.name} antes de prosseguir.`);
      return;
    }

    const contract = new ethers.Contract(currentContractAddress.value, CROWDFUNDING_ABI, signer);

    pendingToast = toast.info(t('confirming_your_donation'), {
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
    toast.success(t('donation_successful'));
    await loadProjectDetails(projectId.value);
  } catch (error: any) {
    console.error(t('error_donating'), error);

    if (pendingToast) {
      toast.dismiss(pendingToast);
    }

    if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
      toast.error(t('donation_canceled_by_user'));
    } else if (error.message && error.message.includes("Must send exact fixed donation amount")) {
      // Passa o símbolo da moeda como um parâmetro para a tradução
      toast.error(t('for_this_project_you_must_donate_exactly', { 
        amount: parseFloat(project.value.requiredDonationAmount || '0').toFixed(4), 
        currency: currentCurrencySymbol.value 
      }));
    } else {
      toast.error(t('an_error_occurred_processing_donation'));
    }
  }
}

async function handleWithdrawGoal() {
  if (!window.ethereum) {
    toast.error(t('no_wallet_detected_withdraw'));
    return;
  }
  if (!project.value) return;

  // Verificar se uma rede está selecionada e se o endereço do contrato está disponível
  if (!selectedNetwork.value || !currentContractAddress.value) {
    toast.error("Nenhuma rede selecionada ou endereço de contrato não disponível para saque. Por favor, selecione uma rede válida.");
    return;
  }

  let pendingToast: string | number | undefined;
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // **VERIFICAÇÃO CRÍTICA: A carteira do usuário está na mesma rede que a aplicação?**
    const walletNetwork = await provider.getNetwork();
    const targetChainIdDecimal = selectedNetwork.value.chainId;

    if (walletNetwork.chainId.toString() !== targetChainIdDecimal) {
      toast.error(`Sua carteira está na rede ${walletNetwork.name}, mas a aplicação está configurada para ${selectedNetwork.value.name}. Por favor, mude sua carteira para a rede ${selectedNetwork.value.name} antes de prosseguir.`);
      return;
    }

    const contract = new ethers.Contract(currentContractAddress.value, CROWDFUNDING_ABI, signer);

    pendingToast = toast.info(t('requesting_goal_withdrawal'), {
      timeout: false, closeButton: false, closeOnClick: false, draggable: false,
    });

    const tx = await contract.withdrawFunds(project.value.id);
    await tx.wait();
    toast.dismiss(pendingToast);
    toast.success(t('goal_withdrawal_successful'));
    await loadProjectDetails(projectId.value);
  } catch (error: any) {
    console.error(t('error_withdrawing_goal'), error);
    if (pendingToast) toast.dismiss(pendingToast);
    if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
      toast.error(t('goal_withdrawal_canceled_by_user'));
    } else {
      toast.error(`${t('error_withdrawing_goal')} ${error.reason || error.message || t('check_requirements')}`);
    }
  }
}

async function handleClaimRefund() {
  if (!window.ethereum) {
    toast.error(t('no_wallet_detected_refund'));
    return;
  }
  if (!project.value) return;

  // Verificar se uma rede está selecionada e se o endereço do contrato está disponível
  if (!selectedNetwork.value || !currentContractAddress.value) {
    toast.error("Nenhuma rede selecionada ou endereço de contrato não disponível para reembolso. Por favor, selecione uma rede válida.");
    return;
  }

  let pendingToast: string | number | undefined;
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // **VERIFICAÇÃO CRÍTICA: A carteira do usuário está na mesma rede que a aplicação?**
    const walletNetwork = await provider.getNetwork();
    const targetChainIdDecimal = selectedNetwork.value.chainId;

    if (walletNetwork.chainId.toString() !== targetChainIdDecimal) {
      toast.error(`Sua carteira está na rede ${walletNetwork.name}, mas a aplicação está configurada para ${selectedNetwork.value.name}. Por favor, mude sua carteira para a rede ${selectedNetwork.value.name} antes de prosseguir.`);
      return;
    }

    const contract = new ethers.Contract(currentContractAddress.value, CROWDFUNDING_ABI, signer);

    pendingToast = toast.info(t('requesting_donation_refund'), {
      timeout: false, closeButton: false, closeOnClick: false, draggable: false,
    });

    const tx = await contract.claimRefund(project.value.id);
    await tx.wait();
    toast.dismiss(pendingToast);
    toast.success(t('donation_refund_successful'));
    await loadProjectDetails(projectId.value);
  } catch (error: any) {
      console.error(t('error_requesting_refund'), error);
    if (pendingToast) toast.dismiss(pendingToast);
    if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
      toast.error(t('refund_canceled_by_user'));
    } else {
      toast.error(`${t('error_requesting_refund')} ${error.reason || error.message || t('check_requirements')}`);
    }
  }
}

async function loadProjectDetails(id: number) {
  loading.value = true;
  project.value = null;
  myDonationAmount.value = 0;
  connectedWalletAddress.value = null;

  // 1. Determinar o RPC e Endereço do Contrato com base na rede selecionada
  if (!selectedNetwork.value) {
    console.warn("Nenhuma rede selecionada. Não foi possível carregar detalhes do projeto.");
    loading.value = false;
    project.value = null;
    return;
  }

  const chainIdDecimal = selectedNetwork.value.chainId;
  currentRpcUrl.value = selectedNetwork.value.rpcUrl;
  currentContractAddress.value = CONTRACT_ADDRESSES[chainIdDecimal];

  if (!currentRpcUrl.value || !currentContractAddress.value) {
    console.error(`Configurações de RPC ou Endereço de Contrato não encontradas para a rede: ${selectedNetwork.value.name} (Chain ID: ${chainIdDecimal}).`);
    toast.error(`As configurações de RPC ou endereço de contrato para a rede ${selectedNetwork.value.name} não foram encontradas. Por favor, verifique o arquivo networks.js.`);
    loading.value = false;
    project.value = null;
    return;
  }

  let providerInstance;

  try {
    if (window.ethereum) {
      // Caminho 1: MetaMask (ou carteira compatível) é detectado
      try {
        providerInstance = new ethers.BrowserProvider(window.ethereum);
        const signer = await providerInstance.getSigner();
        connectedWalletAddress.value = await signer.getAddress();

        // **Verifica se a carteira está na rede certa!**
        const walletNetwork = await providerInstance.getNetwork();
        if (walletNetwork.chainId.toString() !== chainIdDecimal) {
          console.warn(`A carteira está na rede ${walletNetwork.name} (Chain ID: ${walletNetwork.chainId}), mas a aplicação está configurada para ${selectedNetwork.value.name} (Chain ID: ${chainIdDecimal}). Transações (doações) podem falhar até que a carteira seja trocada. Os dados serão carregados em modo leitura.`);
        }

      } catch (e) {
        // Se a inicialização do BrowserProvider ou getSigner falhar
        console.warn(t('wallet_detected_but_cannot_connect_readonly'), e);
        // Fallback para um provedor RPC público para operações somente leitura
        providerInstance = new ethers.JsonRpcProvider(currentRpcUrl.value);
      }
    } else {
      // Caminho 2: MetaMask (ou carteira compatível) NÃO é detectado
      console.warn(t('no_wallet_detected_public_readonly'));
      // Use um provedor RPC público para operações somente leitura
      providerInstance = new ethers.JsonRpcProvider(currentRpcUrl.value);
    }

    if (!providerInstance) {
      throw new Error(t('cannot_initialize_ethereum_provider'));
    }

    // O contrato agora é inicializado com o providerInstance que pode ser BrowserProvider ou JsonRpcProvider
    const contract = new ethers.Contract(currentContractAddress.value, CROWDFUNDING_ABI, providerInstance);

    const p = await contract.getProject(id);
    const [donorAddresses, donorAmounts] = await contract.getProjectDonorsWithAmounts(id);

    // Buscar a doação do usuário logado, se houver
    if (connectedWalletAddress.value) {
      try {
        const donation = await contract.getDonation(id, connectedWalletAddress.value);
        myDonationAmount.value = parseFloat(ethers.formatEther(donation));
      } catch (e) {
        console.error(t('error_fetching_user_donation'), e);
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
      refunded: p.refunded,
      donors: projectDonors,
    };

    if (project.value.fixedDonationAmount) {
      donationAmountInternal.value = parseFloat(project.value.requiredDonationAmount).toFixed(4);
    } else {
      donationAmountInternal.value = '';
    }

  } catch (error: any) {
    console.error(`${t('error_loading_project_with_id')} ${id}:`, error);
    project.value = null;
    if (error.code === "CALL_EXCEPTION" && (error.data === "0x" || (error.data && error.data.message && error.data.message.includes("Invalid project ID")))) {
      toast.error(t('project_not_found_or_invalid_blockchain_id'));
    } else {
      toast.error(t('an_error_occurred_loading_project_details'));
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

const canWithdrawGoal = computed(() => {
  if (!project.value || !connectedWalletAddress.value) return false;
  return (
    project.value.completed &&
    connectedWalletAddress.value.toLowerCase() === project.value.owner.toLowerCase() &&
    !project.value.withdrawn
  );
});

const canClaimRefund = computed(() => {
  if (!project.value || !connectedWalletAddress.value) return false;
  const hasDonation = myDonationAmount.value > 0;

  return (
    hasDeadlinePassed(project.value) &&
    !project.value.completed &&
    !project.value.withdrawn &&
    hasDonation
  );
});

// Watch para mudanças na rota (id do projeto) e na rede selecionada
watch([projectId, selectedNetwork], ([newProjectId, newSelectedNetwork], [oldProjectId, oldSelectedNetwork]) => {
  // Carrega os detalhes do projeto se o ID do projeto mudar
  if (newProjectId && newProjectId !== oldProjectId) {
    loadProjectDetails(newProjectId);
  }
  // Recarrega os detalhes do projeto se a rede selecionada mudar (e for uma mudança de rede real)
  if (newSelectedNetwork && newSelectedNetwork.chainId !== (oldSelectedNetwork ? oldSelectedNetwork.chainId : undefined)) {
    loadProjectDetails(newProjectId); // Recarrega para o projeto atual na nova rede
  } else if (!newSelectedNetwork) { // Se a rede for nula (ex: carteira em rede desconhecida)
    project.value = null; // Limpa o projeto
    loading.value = false;
  }
}, { immediate: true });

onMounted(() => {
  if (history.state && history.state.toastMessage) {
    if (history.state.newlyCreatedProjectId === projectId.value) {
      toast.success(history.state.toastMessage);
      delete history.state.toastMessage;
      delete history.state.newlyCreatedProjectId;
    }
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