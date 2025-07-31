<template>
    <div class="mb-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
      <!-- Botões de Filtro -->
      <div class="flex-grow flex flex-wrap gap-2 justify-center sm:justify-start">
        <button
            @click="$emit('update:selectedFilterProp', 'all')"
            :class="['px-4 py-2 rounded-lg font-medium transition-colors', selectedFilterProp === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300']"
        >
          Todos os Projetos
        </button>
        <button
            @click="$emit('update:selectedFilterProp', 'myProjects')"
            :disabled="!connectedWalletAddress"
            :class="['px-4 py-2 rounded-lg font-medium transition-colors', selectedFilterProp === 'myProjects' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300', !connectedWalletAddress && 'opacity-50 cursor-not-allowed']"
        >
          Meus Projetos
        </button>
        <button
            @click="$emit('update:selectedFilterProp', 'myContributions')"
            :disabled="!connectedWalletAddress"
            :class="['px-4 py-2 rounded-lg font-medium transition-colors', selectedFilterProp === 'myContributions' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300', !connectedWalletAddress && 'opacity-50 cursor-not-allowed']"
        >
          Minhas Colaborações
        </button>
      </div>
  
      <!-- Dropdown de Ordenação -->
      <div class="relative w-full sm:w-auto">
        <select
            :value="selectedSortProp"
            @change="$emit('update:selectedSortProp', ($event.target as HTMLSelectElement).value)"
            class="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10"
        >
          <option value="deadline">Ordernar por: Prazo</option>
          <option value="progress">Ordernar por: Percentual arrecadado em relação a meta</option>
          <option value="goalAmount">Ordernar por: Meta</option>
        </select>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { defineProps, defineEmits } from 'vue';
  
  defineProps<{
    selectedFilterProp: 'all' | 'myProjects' | 'myContributions';
    selectedSortProp: 'deadline' | 'progress' | 'goalAmount';
    connectedWalletAddress: string | null;
  }>();
  
  // Corrigido: Os nomes dos eventos de emissão devem corresponder aos nomes das props usadas no v-model
  defineEmits(['update:selectedFilterProp', 'update:selectedSortProp']);
  </script>