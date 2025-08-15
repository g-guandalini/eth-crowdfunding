<template>
  <div class="mb-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
    <!-- Botões de Filtro -->
    <div class="flex-grow flex flex-wrap gap-2 justify-center sm:justify-start">
      <button
          @click="$emit('update:selectedFilterProp', 'all')"
          :class="['px-4 py-2 rounded-lg font-medium transition-colors', selectedFilterProp === 'all' ? 'bg-[#1f0053] text-white' : 'bg-gray-200 text-gray-800 text-gray-800 hover:bg-gray-300']"
      >
        {{ $t('all_projects') }}
      </button>
      <button
          @click="$emit('update:selectedFilterProp', 'myProjects')"
          :disabled="!connectedWalletAddress"
          :class="['px-4 py-2 rounded-lg font-medium transition-colors', selectedFilterProp === 'myProjects' ? 'bg-[#1f0053] text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300', !connectedWalletAddress && 'opacity-50 cursor-not-allowed']"
      >
        {{ $t('my_projects') }}
      </button>
      <button
          @click="$emit('update:selectedFilterProp', 'myContributions')"
          :disabled="!connectedWalletAddress"
          :class="['px-4 py-2 rounded-lg font-medium transition-colors', selectedFilterProp === 'myContributions' ? 'bg-[#1f0053] text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300', !connectedWalletAddress && 'opacity-50 cursor-not-allowed']"
      >
        {{ $t('my_contributions') }}
      </button>
    </div>

    <!-- Campo de Busca -->
    <div class="relative w-full sm:w-auto mt-4 sm:mt-0"> <!-- Adicionado mt-4 sm:mt-0 para espaçamento responsivo -->
      <input
        type="text"
        :value="searchQueryProp"
        @input="$emit('update:searchQueryProp', ($event.target as HTMLInputElement).value)"
        :placeholder="$t('search_projects_by_title_placeholder')"
        class="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10"
      />
    </div>

    <!-- Dropdown de Ordenação -->
    <div class="relative w-full sm:w-auto mt-4 sm:mt-0"> <!-- Adicionado mt-4 sm:mt-0 para espaçamento responsivo -->
      <select
          :value="selectedSortProp"
          @change="$emit('update:selectedSortProp', ($event.target as HTMLSelectElement).value)"
          class="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10"
      >
        <option value="deadline">{{ $t('sort_by_deadline') }}</option>
        <option value="progress">{{ $t('sort_by_progress') }}</option>
        <option value="goalAmount">{{ $t('sort_by_goal_amount') }}</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { useI18n } from 'vue-i18n'; // IMPORTANTE: Importar useI18n

const { t } = useI18n(); // IMPORTANTE: Inicializar useI18n para que $t funcione no template

defineProps<{
  selectedFilterProp: 'all' | 'myProjects' | 'myContributions';
  selectedSortProp: 'deadline' | 'progress' | 'goalAmount';
  connectedWalletAddress: string | null;
  searchQueryProp: string;
}>();

defineEmits(['update:selectedFilterProp', 'update:selectedSortProp', 'update:searchQueryProp']);
</script>