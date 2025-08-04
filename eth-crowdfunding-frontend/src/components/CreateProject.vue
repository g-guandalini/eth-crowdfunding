<template>
  <div class="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h2 class="text-3xl font-extrabold text-gray-900 mb-8 text-center">
      ✨ Criar Novo Projeto ✨
    </h2>

    <form @submit.prevent="submitProject" class="bg-white rounded-xl shadow-lg p-6 space-y-6 border border-gray-100">
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Título do Projeto</label>
        <input
          type="text"
          id="title"
          v-model="projectForm.title"
          required
          maxlength="50" 
          class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Ex: Meu Projeto Incrível"
        />
        <!-- ADICIONADO: Contador de caracteres e mensagem de erro -->
        <p class="mt-1 text-xs text-right" :class="{'text-red-500': titleExceeded, 'text-gray-500': !titleExceeded}">
          {{ projectForm.title.length }} / 50 caracteres
        </p>
        <p v-if="titleExceeded" class="mt-1 text-red-500 text-xs">
          O título do projeto excedeu o limite de 50 caracteres.
        </p>
      </div>

      <div>
        <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
        <textarea
          id="description"
          v-model="projectForm.description"
          rows="4"
          required
          class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Conte mais sobre o seu projeto, o que ele fará e por que ele precisa de apoio."
        ></textarea>
        <p class="mt-1 text-xs text-gray-500">
          📝 Você pode usar <a  href="https://www.markdownguide.org/basic-syntax/"  class="text-blue-500 hover:underline">Markdown</a> para formatar a descrição (ex: **negrito**, *itálico*, ## títulos, etc.).
        </p>
      </div>

      <div>
        <label for="goal" class="block text-sm font-medium text-gray-700 mb-1">Meta de Arrecadação (MON)</label>
        <input
          type="text"
          id="goal"
          v-model="projectForm.goal"
          @input="handleNumericInput(projectForm, 'goal')"
          required
          class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Ex: 10.5 (apenas números, use ponto para decimais)"
        />
        <p v-if="goalError" class="mt-1 text-red-500 text-xs">{{ goalError }}</p>
      </div>

      <!-- Novo campo: Data Limite -->
      <div>
        <label for="deadlineDate" class="block text-sm font-medium text-gray-700 mb-1">Data Limite para Arrecadação</label>
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
        <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Doação</label>
        <div class="mt-1 flex items-center space-x-4">
          <label class="inline-flex items-center">
            <input
              type="radio"
              v-model="projectForm.isFixedDonation"
              :value="false"
              class="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span class="ml-2 text-gray-700">Valor Livre</span>
          </label>
          <label class="inline-flex items-center">
            <input
              type="radio"
              v-model="projectForm.isFixedDonation"
              :value="true"
              class="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span class="ml-2 text-gray-700">Valor Fixo</span>
          </label>
        </div>
      </div>

      <!-- Campo para Valor Fixo, visível apenas se isFixedDonation for true -->
      <div v-if="projectForm.isFixedDonation">
        <label for="fixedDonationValue" class="block text-sm font-medium text-gray-700 mb-1">Valor Fixo da Doação (MON)</label>
        <input
          type="text"
          id="fixedDonationValue"
          v-model="projectForm.fixedDonationValue"
          @input="handleNumericInput(projectForm, 'fixedDonationValue')"
          required
          class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Ex: 0.05 (apenas números, use ponto para decimais)"
        />
        <p v-if="fixedDonationValueError" class="mt-1 text-red-500 text-xs">{{ fixedDonationValueError }}</p>
      </div>

      <button
        type="submit"
        :disabled="isCreatingProject"
        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-[#1f0053] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300 transform"
        :class="{ 'opacity-50 cursor-not-allowed': isCreatingProject }"
      >
        <span v-if="isCreatingProject" class="flex items-center">
          <div class="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
          Criando Projeto...
        </span>
        <span v-else>Criar Projeto</span>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { ethers } from "ethers";
import { CROWDFUNDING_ABI, CROWDFUNDING_ADDRESS } from "../contracts";
import { useRouter } from 'vue-router';
import { useToast } from "vue-toastification";

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
      goalError.value = "A meta deve ser um número positivo (ex: 0.01, 10).";
    } else {
      goalError.value = "";
    }
  } else if (field === 'fixedDonationValue') {
    const parsedValue = parseFloat(value);
    // Validação para valor fixo ser >= 0.001
    if (value === '' || isNaN(parsedValue) || parsedValue < 0.001) {
      fixedDonationValueError.value = "O valor fixo deve ser igual ou superior a 0.001 MON.";
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

  if (titleExceeded.value) {
    toast.error("O título do projeto excedeu o limite de 50 caracteres.");
    return;
  }
  // Validação básica dos campos de texto
  if (!projectForm.value.title.trim()) {
    toast.error("O título do projeto é obrigatório.");
    return;
  }
  if (!projectForm.value.description.trim()) {
    toast.error("A descrição do projeto é obrigatória.");
    return;
  }

  // Validação da Meta
  handleNumericInput(projectForm.value, 'goal');
  if (goalError.value) {
    toast.error("Corrija o campo 'Meta de Arrecadação'.");
    return;
  }
  // Convertendo a meta para número para comparação
  const goalNumericValue = parseFloat(projectForm.value.goal);


  // Validação da Data Limite
  if (!projectForm.value.deadlineDate) {
    deadlineError.value = "A data limite é obrigatória.";
    toast.error("Corrija o campo 'Data Limite para Arrecadação'.");
    return;
  }
  const selectedDate = new Date(projectForm.value.deadlineDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Zera a hora para comparar apenas a data
  if (selectedDate < now) {
    deadlineError.value = "A data limite deve ser no futuro.";
    toast.error("A data limite deve ser no futuro.");
    return;
  }
  // Converte a data selecionada para Unix timestamp (segundos)
  const deadlineTimestamp = Math.floor(selectedDate.getTime() / 1000);

  // Validação do Valor Fixo (se a opção for "Valor Fixo")
  let requiredDonationAmountWei = ethers.parseEther("0"); // Padrão: 0 se for valor livre
  if (projectForm.value.isFixedDonation) {
    handleNumericInput(projectForm.value, 'fixedDonationValue');
    if (fixedDonationValueError.value) {
      toast.error("Corrija o campo 'Valor Fixo da Doação'.");
      return;
    }
    const fixedDonationNumericValue = parseFloat(projectForm.value.fixedDonationValue);

    // >>> NOVA TRATATIVA: Valor fixo de doação não pode ser maior que a meta <<<
    if (fixedDonationNumericValue > goalNumericValue) {
        fixedDonationValueError.value = "O valor fixo da doação não pode ser maior que a meta de arrecadação.";
        toast.error("O valor fixo da doação não pode ser maior que a meta de arrecadação.");
        return; // Impede a submissão do formulário
    }

    requiredDonationAmountWei = ethers.parseEther(projectForm.value.fixedDonationValue);
  }

  isCreatingProject.value = true; // Ativa o estado de carregamento/processamento
  let pendingToast: string | number | undefined; // Para o toast de transação pendente

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CROWDFUNDING_ADDRESS, CROWDFUNDING_ABI, signer);

    const goalInWei = ethers.parseEther(projectForm.value.goal);

    // Toast de confirmação do MetaMask
    pendingToast = toast.info("Enviando transação... Por favor, confirme na carteira.", {
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
    pendingToast = toast.info("Transação enviada! Aguardando confirmação da blockchain...", {
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
        toastMessage: "Projeto criado com sucesso! 🎉",
        // Adicionando o ID ao estado para que a ProjectPage possa validar se o toast é para ela
        newlyCreatedProjectId: newProjectId
      }
    });

  } catch (error: any) {
    console.error("Erro ao criar projeto:", error);
    
    if (pendingToast) { // Certifica-se de fechar qualquer toast pendente em caso de erro
        toast.dismiss(pendingToast);
    }

    if (error.code === 'ACTION_REJECTED' || error.code === 4001) { // Erro do usuário rejeitando a transação
      toast.error("Criação de projeto cancelada pelo usuário.");
    } else {
      // Tenta extrair uma mensagem de erro mais útil do erro da transação
      let errorMsg = "Ocorreu um erro ao criar o projeto. Por favor, tente novamente.";
      if (error.reason) { // Ex: "execution reverted: Goal must be greater than zero"
          errorMsg = `Erro na Blockchain: ${error.reason}`;
      } else if (error.data && error.data.message) { // Formato comum para erros de revert
          errorMsg = `Erro na Transação: ${error.data.message}`;
      } else if (error.message) { // Mensagem genérica do erro
          errorMsg = `Erro: ${error.message.substring(0, 100)}...`; // Limita o tamanho para não poluir
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