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
          class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Ex: Meu Projeto Incrível"
        />
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
        <!-- NOVO: Dica de Markdown - Classes ajustadas para melhor quebra de linha -->
        <p class="mt-1 text-xs text-gray-500">
          📝 Você pode usar <a target="_blank" href="https://www.markdownguide.org/basic-syntax/"  class="text-blue-500 hover:underline">Markdown</a> para formatar a descrição (ex: **negrito**, *itálico*, ## títulos, etc.).
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

      <div v-if="errorMessage" class="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md" role="alert">
        {{ errorMessage }}
      </div>
      <div v-if="successMessage" class="p-3 bg-green-100 border border-green-400 text-green-700 rounded-md" role="alert">
        {{ successMessage }}
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
import { CROWDFUNDING_ABI, CROWDFUNDING_ADDRESS } from "../contracts"; // Certifique-se de que o caminho está correto

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
  fixedDonationValue: "0.01", // Valor inicial para o campo de doação fixa (se for selecionado)
});

// Estados de UI
const isCreatingProject = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const goalError = ref("");
const deadlineError = ref("");
const fixedDonationValueError = ref("");

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
    if (value === '' || parseFloat(value) <= 0 || isNaN(parseFloat(value))) {
      fixedDonationValueError.value = "O valor fixo deve ser um número positivo (ex: 0.01, 1).";
    } else {
      fixedDonationValueError.value = "";
    }
  }
}

// Função para submeter o formulário e criar o projeto
async function submitProject() {
  // Limpa mensagens e erros anteriores
  errorMessage.value = "";
  successMessage.value = "";
  goalError.value = "";
  deadlineError.value = "";
  fixedDonationValueError.value = "";

  // Validação básica dos campos de texto
  if (!projectForm.value.title.trim()) {
    errorMessage.value = "O título do projeto é obrigatório.";
    return;
  }
  if (!projectForm.value.description.trim()) {
    errorMessage.value = "A descrição do projeto é obrigatória.";
    return;
  }

  // Validação da Meta
  handleNumericInput(projectForm.value, 'goal'); // Re-valida para garantir que o estado de erro esteja correto
  if (goalError.value) {
    errorMessage.value = "Corrija os erros no formulário.";
    return;
  }

  // Validação da Data Limite
  if (!projectForm.value.deadlineDate) {
    deadlineError.value = "A data limite é obrigatória.";
    errorMessage.value = "Corrija os erros no formulário.";
    return;
  }
  const selectedDate = new Date(projectForm.value.deadlineDate);
  // Para comparar apenas a data, sem considerar a hora, zera a hora da data atual
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  if (selectedDate < now) {
    deadlineError.value = "A data limite deve ser no futuro.";
    errorMessage.value = "Corrija os erros no formulário.";
    return;
  }
  // Converte a data selecionada para Unix timestamp (segundos)
  const deadlineTimestamp = Math.floor(selectedDate.getTime() / 1000);

  // Validação do Valor Fixo (se a opção for "Valor Fixo")
  let requiredDonationAmountWei = ethers.parseEther("0"); // Padrão: 0 se for valor livre
  if (projectForm.value.isFixedDonation) {
    handleNumericInput(projectForm.value, 'fixedDonationValue'); // Re-valida ao submeter
    if (fixedDonationValueError.value) {
      errorMessage.value = "Corrija os erros no formulário.";
      return;
    }
    requiredDonationAmountWei = ethers.parseEther(projectForm.value.fixedDonationValue);
  }

  isCreatingProject.value = true; // Ativa o estado de carregamento/processamento

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CROWDFUNDING_ADDRESS, CROWDFUNDING_ABI, signer);

    const goalInWei = ethers.parseEther(projectForm.value.goal);

    // Chama a função createProject do contrato com todos os parâmetros
    const tx = await contract.createProject(
      projectForm.value.title,
      projectForm.value.description,
      goalInWei,
      deadlineTimestamp,
      projectForm.value.isFixedDonation,
      requiredDonationAmountWei
    );

    successMessage.value = "Transação enviada! Aguardando confirmação...";
    await tx.wait(); // Espera a transação ser minerada e confirmada

    successMessage.value = "Projeto criado com sucesso! 🎉";

    // Limpa o formulário após o sucesso
    projectForm.value.title = "";
    projectForm.value.description = "";
    projectForm.value.goal = "";
    projectForm.value.deadlineDate = "";
    projectForm.value.isFixedDonation = false;
    projectForm.value.fixedDonationValue = "0.01"; // Reseta para o valor padrão

  } catch (error: any) {
    console.error("Erro ao criar projeto:", error);
    if (error.code === 'ACTION_REJECTED' || error.code === 4001) { // MetaMask user rejected transaction
      errorMessage.value = "Criação de projeto cancelada pelo usuário.";
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
      errorMessage.value = errorMsg;
    }
  } finally {
    isCreatingProject.value = false; // Desativa o estado de carregamento
  }
}
</script>

<style scoped>
/* Não há estilos específicos aqui, pois o Tailwind CSS já cuida da maioria. */
/* Se precisar de algo customizado, pode adicionar. */
</style>