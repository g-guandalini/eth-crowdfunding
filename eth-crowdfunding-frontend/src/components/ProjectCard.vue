<!-- src/components/ProjectCard.vue -->
<template>
    <div
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
          <p class="mb-1"><strong>Meta:</strong> {{ parseFloat(project.goal).toFixed(2) }} MON</p>
          <p class="mb-1"><strong>Arrecadado:</strong> {{ parseFloat(project.amountRaised).toFixed(2) }} MON</p>
          <p class="mb-1">
            <strong>Prazo:</strong>
            {{ formatDeadline(project.deadline) }}
          </p>
          <p v-if="project.fixedDonationAmount" class="mb-1 text-sm text-gray-500">
              (Doação Fixa: {{ parseFloat(project.requiredDonationAmount).toFixed(4) }} MON)
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
    <div v-if="shouldShowDonateInput(project)">
      <div class="mt-auto flex items-center gap-2">
        <!-- Input para o valor da doação -->
        <input
          type="text"
          v-model="donationAmountInternal"
          @input="handleDonationInputChange"
          :placeholder="project.fixedDonationAmount ? parseFloat(project.requiredDonationAmount).toFixed(4) + ' (Fixo)' : '0.01'"
          :readonly="project.fixedDonationAmount"
          :class="[
            'flex-grow border rounded-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-center font-mono',
            { 'bg-gray-100 cursor-not-allowed': project.fixedDonationAmount } // Estilo para input readonly
          ]"
          aria-label="Valor para Doação em MON"
        />
        <!-- Botão Doar -->
        <button
          @click="$emit('donateProject', project.id, donationAmountInternal)"
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 whitespace-nowrap"
        >
          Doar
        </button>
      </div>
      <!-- NOVA LINHA: Indicação da taxa de serviço -->
      <p class="text-xs text-gray-500 mt-1 text-center">
        ℹ️ Taxa de serviço: 0.25% sobre o valor da doação.
      </p>
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
              <span class="font-medium">{{ formatAddress(donor.address) }}</span>: {{ parseFloat(donor.amount).toFixed(4) }} MON
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
  </template>
  
  <script setup lang="ts">
  import { ref, watch, defineProps, defineEmits } from 'vue';
  import type { Project } from '@/types/project'; // Ajuste o caminho se necessário
  import {
    projectProgress,
    formatAddress,
    formatDeadline,
    isProjectCompleted,
    hasDeadlinePassed,
    shouldShowDonateInput,
    getProjectBorderClass
  } from '@/utils/projectHelpers'; // Ajuste o caminho se necessário
  
  const props = defineProps<{
    project: Project;
  }>();
  
  const emit = defineEmits(['donateProject']);
  
  // Estado interno para o input de doação de cada card
  const donationAmountInternal = ref(props.project.fixedDonationAmount ? parseFloat(props.project.requiredDonationAmount).toFixed(4) : '');
  
  // Observa mudanças na prop `project.fixedDonationAmount` para atualizar o valor inicial
  watch(() => props.project.fixedDonationAmount, (newVal) => {
    if (newVal) {
      donationAmountInternal.value = parseFloat(props.project.requiredDonationAmount).toFixed(4);
    } else {
      donationAmountInternal.value = '';
    }
  }, { immediate: true }); // Executa imediatamente na montagem
  
  function handleDonationInputChange() {
    if (props.project.fixedDonationAmount) {
      return; // Input é readonly
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
  
  // Estilos específicos para este componente (se não estiverem em um CSS global)
  </script>
  
  <style scoped>
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
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