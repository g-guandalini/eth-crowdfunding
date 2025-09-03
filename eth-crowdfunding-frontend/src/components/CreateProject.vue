<template>
  <div class="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h2 class="text-3xl font-extrabold text-gray-900 mb-8 text-center">
      {{ $t('create_new_project_title') }}
    </h2>

    <form @submit.prevent="submitProject" class="bg-white rounded-xl shadow-lg p-6 space-y-6 border border-gray-100">
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700 mb-1">{{ $t('project_title_label') }}</label>
        <input
          type="text"
          id="title"
          v-model="projectForm.title"
          required
          maxlength="50"
          class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          :placeholder="$t('project_title_placeholder')"
        />
        <p class="mt-1 text-xs text-right" :class="{'text-red-500': titleExceeded, 'text-gray-500': !titleExceeded}">
          {{ $t('characters_count', { current: projectForm.title.length, max: 50 }) }}
        </p>
        <p v-if="titleExceeded" class="mt-1 text-red-500 text-xs">
          {{ $t('title_exceeded_limit', { max: 50 }) }}
        </p>
      </div>

      <div>
        <label for="description" class="block text-sm font-medium text-gray-700 mb-1">{{ $t('description_label') }}</label>
        <textarea
          id="description"
          v-model="projectForm.description"
          rows="4"
          required
          class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          :placeholder="$t('description_placeholder')"
        ></textarea>
        <p class="mt-1 text-xs text-gray-500">
          {{ $t('markdown_tip_part1') }}<a href="https://www.markdownguide.org/basic-syntax/" class="text-blue-500 hover:underline">{{ $t('markdown_link_text') }}</a>{{ $t('markdown_tip_part2') }}
        </p>
      </div>

      <div>
        <!-- Usando currentCurrencySymbol -->
        <label for="goal" class="block text-sm font-medium text-gray-700 mb-1">{{ $t('goal_label', { currency: currentCurrencySymbol }) }}</label>
        <input
          type="text"
          id="goal"
          v-model="projectForm.goal"
          @input="handleNumericInput(projectForm, 'goal')"
          required
          class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          :placeholder="$t('goal_placeholder')"
        />
        <p v-if="goalError" class="mt-1 text-red-500 text-xs">{{ goalError }}</p>
      </div>

      <!-- Novo campo: Data Limite -->
      <div>
        <label for="deadlineDate" class="block text-sm font-medium text-gray-700 mb-1">{{ $t('deadline_label') }}</label>
        <input
          type="date"
          id="deadlineDate"
          v-model="projectForm.deadlineDate"
          required
          :min="minDeadlineDate"
          class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        <p v-if="deadlineError" class="mt-1 text-red-500 text-xs">{{ deadlineError }}</p>
      </div>

      <!-- Novo campo: Tipo de Doação -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('donation_type_label') }}</label>
        <div class="mt-1 flex items-center space-x-4">
          <label class="inline-flex items-center">
            <input
              type="radio"
              v-model="projectForm.isFixedDonation"
              :value="false"
              class="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span class="ml-2 text-gray-700">{{ $t('free_value') }}</span>
          </label>
          <label class="inline-flex items-center">
            <input
              type="radio"
              v-model="projectForm.isFixedDonation"
              :value="true"
              class="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span class="ml-2 text-gray-700">{{ $t('fixed_value') }}</span>
          </label>
        </div>
      </div>

      <!-- Campo para Valor Fixo, visível apenas se isFixedDonation for true -->
      <div v-if="projectForm.isFixedDonation">
        <!-- Usando currentCurrencySymbol -->
        <label for="fixedDonationValue" class="block text-sm font-medium text-gray-700 mb-1">{{ $t('fixed_donation_label', { currency: currentCurrencySymbol }) }}</label>
        <input
          type="text"
          id="fixedDonationValue"
          v-model="projectForm.fixedDonationValue"
          @input="handleNumericInput(projectForm, 'fixedDonationValue')"
          required
          class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          :placeholder="$t('fixed_donation_placeholder')"
        />
        <p v-if="fixedDonationValueError" class="mt-1 text-red-500 text-xs">{{ fixedDonationValueError }}</p>
      </div>

      <button
        type="submit"
        :disabled="isCreatingProject || !selectedNetwork"
        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-[#1f0053] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300 transform"
        :class="{ 'opacity-50 cursor-not-allowed': isCreatingProject || !selectedNetwork }"
      >
        <span v-if="isCreatingProject" class="flex items-center">
          <div class="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
          {{ $t('creating_project_button') }}
        </span>
        <span v-else-if="!selectedNetwork" class="flex items-center">
          {{ $t('select_network_to_create_project') }}
        </span>
        <span v-else>{{ $t('create_project_button') }}</span>
      </button>
      <p v-if="!selectedNetwork" class="text-center text-gray-500 text-sm mt-2">
        {{ $t('please_select_network_above') }}
      </p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from "vue"; // Adicionado 'inject'
import { ethers } from "ethers";
import { CROWDFUNDING_ABI } from "../contracts"; // CROWDFUNDING_ADDRESS removido
import { useRouter } from 'vue-router';
import { useToast } from "vue-toastification";
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

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


// Interface para o formulário
interface ProjectForm {
  title: string;
  description: string;
  goal: string;
  deadlineDate: string; // Ex: "2025-12-31" (string do input type="date")
  isFixedDonation: boolean;
  fixedDonationValue: string;
}

// Estado do formulário
const projectForm = ref<ProjectForm>({
  title: "",
  description: "",
  goal: "",
  deadlineDate: "", // Inicializa vazio
  isFixedDonation: false, // Default para valor livre
  fixedDonationValue: "0.001", // Valor inicial para o campo de doação fixa (se for selecionado), ajustado para o novo mínimo
});

// Inicialização do router e do toast
const router = useRouter();
const toast = useToast();

// Estados de UI
const isCreatingProject = ref(false);
const goalError = ref("");
const deadlineError = ref("");
const fixedDonationValueError = ref("");

const titleExceeded = computed(() => projectForm.value.title.length > 50);

// Computed property para definir a data mínima selecionável no input date (hoje)
const minDeadlineDate = computed(() => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = (today.getMonth() + 1).toString().padStart(2, '0'); // Mês é 0-indexed
  const dd = today.getDate().toString().padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
});

// Função genérica para manipular e validar inputs numéricos (goal, fixedDonationValue)
function handleNumericInput(form: ProjectForm, field: 'goal' | 'fixedDonationValue') {
  let value = form[field];

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

  // Atribui o valor formatado de volta ao campo
  form[field] = value;

  // Validação específica para cada campo
  if (field === 'goal') {
    if (value === '' || parseFloat(value) <= 0 || isNaN(parseFloat(value))) {
      goalError.value = t('goal_numeric_positive_error');
    } else {
      goalError.value = "";
    }
  } else if (field === 'fixedDonationValue') {
    const parsedValue = parseFloat(value);
    // Validação para valor fixo ser >= 0.001
    if (value === '' || isNaN(parsedValue) || parsedValue < 0.001) {
      // Passa o currentCurrencySymbol para a mensagem de erro
      fixedDonationValueError.value = t('fixed_value_min_error', { currency: currentCurrencySymbol.value });
    } else {
      fixedDonationValueError.value = "";
    }
  }
}

// Função para resetar o formulário
function resetForm() {
  projectForm.value = {
    title: "",
    description: "",
    goal: "",
    deadlineDate: "",
    isFixedDonation: false,
    fixedDonationValue: "0.001", // Reseta para o valor padrão
  };
  goalError.value = "";
  deadlineError.value = "";
  fixedDonationValueError.value = "";
}

// Função para submeter o formulário e criar o projeto
async function submitProject() {
  // Limpa erros anteriores
  goalError.value = "";
  deadlineError.value = "";
  fixedDonationValueError.value = "";

  // 1. Determinar o RPC e Endereço do Contrato com base na rede selecionada
  if (!selectedNetwork.value) {
    toast.error(t('select_network_to_create_project'));
    isCreatingProject.value = false;
    return;
  }

  const chainIdDecimal = selectedNetwork.value.chainId;
  currentRpcUrl.value = selectedNetwork.value.rpcUrl; // Não é usado diretamente para transações, mas pode ser útil para debug
  currentContractAddress.value = CONTRACT_ADDRESSES[chainIdDecimal];

  if (!currentContractAddress.value) {
    toast.error(`Endereço de contrato não encontrado para a rede ${selectedNetwork.value.name}. Verifique networks.js`);
    isCreatingProject.value = false;
    return;
  }

  if (titleExceeded.value) {
    toast.error(t('title_exceeded_limit', { max: 50 }));
    return;
  }
  // Validação básica dos campos de texto
  if (!projectForm.value.title.trim()) {
    toast.error(t('title_required'));
    return;
  }
  if (!projectForm.value.description.trim()) {
    toast.error(t('description_required'));
    return;
  }

  // Validação da Meta
  handleNumericInput(projectForm.value, 'goal');
  if (goalError.value) {
    toast.error(t('correct_goal_field'));
    return;
  }
  // Convertendo a meta para número para comparação
  const goalNumericValue = parseFloat(projectForm.value.goal);


  // Validação da Data Limite
  if (!projectForm.value.deadlineDate) {
    deadlineError.value = t('deadline_required');
    toast.error(t('correct_deadline_field'));
    return;
  }
  const selectedDate = new Date(projectForm.value.deadlineDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Zera a hora para comparar apenas a data
  if (selectedDate < now) {
    deadlineError.value = t('deadline_in_future_error');
    toast.error(t('deadline_in_future_error'));
    return;
  }
  // Converte a data selecionada para Unix timestamp (segundos)
  const deadlineTimestamp = Math.floor(selectedDate.getTime() / 1000);

  // Validação do Valor Fixo (se a opção for "Valor Fixo")
  let requiredDonationAmountWei = ethers.parseEther("0"); // Padrão: 0 se for valor livre
  if (projectForm.value.isFixedDonation) {
    handleNumericInput(projectForm.value, 'fixedDonationValue');
    if (fixedDonationValueError.value) {
      toast.error(t('correct_fixed_donation_field'));
      return;
    }
    const fixedDonationNumericValue = parseFloat(projectForm.value.fixedDonationValue);

    // >>> NOVA TRATATIVA: Valor fixo de doação não pode ser maior que a meta <<<
    if (fixedDonationNumericValue > goalNumericValue) {
        fixedDonationValueError.value = t('fixed_value_greater_than_goal_error');
        toast.error(t('fixed_value_greater_than_goal_error'));
        return; // Impede a submissão do formulário
    }

    requiredDonationAmountWei = ethers.parseEther(projectForm.value.fixedDonationValue);
  }

  isCreatingProject.value = true; // Ativa o estado de carregamento/processamento
  let pendingToast: string | number | undefined; // Para o toast de transação pendente

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // **VERIFICAÇÃO CRÍTICA: A carteira do usuário está na mesma rede que a aplicação?**
    const walletNetwork = await provider.getNetwork();
    const targetChainIdDecimal = selectedNetwork.value.chainId;

    if (walletNetwork.chainId.toString() !== targetChainIdDecimal) {
      toast.error(`Sua carteira está na rede ${walletNetwork.name}, mas a aplicação está configurada para ${selectedNetwork.value.name}. Por favor, mude sua carteira para a rede ${selectedNetwork.value.name} antes de criar o projeto.`);
      isCreatingProject.value = false;
      return;
    }

    // Usar o endereço do contrato da rede selecionada
    const contract = new ethers.Contract(currentContractAddress.value, CROWDFUNDING_ABI, signer);

    const goalInWei = ethers.parseEther(projectForm.value.goal);

    // Toast de confirmação do MetaMask
    pendingToast = toast.info(t('sending_transaction_confirm_wallet'), {
        timeout: false, closeButton: false, closeOnClick: false, draggable: false
    });

    // Chama a função createProject do contrato com todos os parâmetros
    const tx = await contract.createProject(
      projectForm.value.title,
      projectForm.value.description,
      goalInWei,
      deadlineTimestamp,
      projectForm.value.isFixedDonation,
      requiredDonationAmountWei
    );

    toast.dismiss(pendingToast); // Fecha o toast de confirmação do MetaMask
    // Toast de aguardando confirmação da blockchain
    pendingToast = toast.info(t('transaction_sent_waiting_blockchain'), {
        timeout: false, closeButton: false, closeOnClick: false, draggable: false
    });

    await tx.wait(); // Espera a transação ser minerada e confirmada

    toast.dismiss(pendingToast); // Fecha o toast de pendência

    // >>> ALTERAÇÃO CRÍTICA AQUI: Obter o ID do projeto após a confirmação <<<
    // O `getProjectsCount()` retorna um BigInt, converta para Number
    const finalProjectCount = Number(await contract.getProjectsCount());
    const newProjectId = finalProjectCount - 1; // O ID do novo projeto é o último adicionado

    // Limpa o formulário após o sucesso
    resetForm();

    // Redireciona para a página de detalhes do novo projeto, passando a mensagem de toast via history.state
    router.push({
      name: 'project-details',
      params: { id: newProjectId },
      state: {
        toastMessage: t('project_created_success'),
        // Adicionando o ID ao estado para que a ProjectPage possa validar se o toast é para ela
        newlyCreatedProjectId: newProjectId
      }
    });

  } catch (error: any) {
    console.error(`${t('error_creating_project_prefix')} ${error}`);

    if (pendingToast) { // Certifica-se de fechar qualquer toast pendente em caso de erro
        toast.dismiss(pendingToast);
    }

    if (error.code === 'ACTION_REJECTED' || error.code === 4001) { // Erro do usuário rejeitando a transação
      toast.error(t('project_creation_canceled_by_user'));
    } else {
      // Tenta extrair uma mensagem de erro mais útil do erro da transação
      let errorMsg = t('generic_error_creating_project');
      if (error.reason) { // Ex: "execution reverted: Goal must be greater than zero"
          errorMsg = `${t('blockchain_error')} ${error.reason}`;
      } else if (error.data && error.data.message) { // Formato comum para erros de revert
          errorMsg = `${t('transaction_error')} ${error.data.message}`;
      } else if (error.message) { // Mensagem genérica do erro
          errorMsg = `${t('general_error')} ${error.message.substring(0, 100)}...`; // Limita o tamanho para não poluir
      }
      toast.error(errorMsg);
    }
  } finally {
    isCreatingProject.value = false; // Desativa o estado de carregamento
  }
}
</script>

<style scoped>
/* Não há estilos específicos aqui, pois o Tailwind CSS já cuida da maioria. */
</style>