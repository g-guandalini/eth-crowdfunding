<template>
  <!-- Alterado: justify-between para justify-start. Permite que os itens se agrupem no início. -->
  <div class="mb-8 flex flex-wrap justify-start items-center gap-4">
    <!-- NOVO PRIMEIRO: Campo de Busca -->
    <div class="relative flex-grow sm:flex-grow-0 w-full sm:w-auto">
      <input
        type="text"
        :value="searchQueryProp"
        @input="$emit('update:searchQueryProp', ($event.target as HTMLInputElement).value)"
        :placeholder="$t('search_projects_by_title_placeholder')"
        class="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10"
        aria-label="Search Projects"
      />
    </div>

    <!-- Dropdown de Filtro Principal (Todos, Meus Projetos, Minhas Contribuições) -->
    <div class="relative w-full sm:w-auto">
      <select
        :value="selectedFilterProp"
        @change="$emit('update:selectedFilterProp', ($event.target as HTMLSelectElement).value as 'all' | 'myProjects' | 'myContributions')"
        class="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10"
        aria-label="Filter Projects"
      >
        <option value="all">{{ $t('all_projects') }}</option>
        <option value="myProjects" :disabled="!connectedWalletAddress">{{ $t('my_projects') }}</option>
        <option value="myContributions" :disabled="!connectedWalletAddress">{{ $t('my_contributions') }}</option>
      </select>
    </div>

    <!-- Dropdown de Ordenação -->
    <div class="relative w-full sm:w-auto">
      <select
          :value="selectedSortProp"
          @change="$emit('update:selectedSortProp', ($event.target as HTMLSelectElement).value as 'deadline' | 'progress' | 'goalAmount')"
          class="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10"
          aria-label="Sort Projects"
      >
        <option value="deadline">{{ $t('sort_by_deadline') }}</option>
        <option value="progress">{{ $t('sort_by_progress') }}</option>
        <option value="goalAmount">{{ $t('sort_by_goal_amount') }}</option>
      </select>
    </div>

    <!-- Multi-select customizado para os novos filtros de checkbox -->
    <div class="relative w-full sm:w-auto">
      <button
        @click="toggleAdvancedFilters"
        type="button"
        class="flex items-center justify-between w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-8 text-gray-700"
        aria-haspopup="true"
        :aria-expanded="showAdvancedFilters.toString()"
      >
        <span>{{ advancedFiltersLabel }}</span>
        <svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>

      <div
        v-if="showAdvancedFilters"
        class="absolute z-10 mt-2 w-full sm:min-w-[200px] rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="menu-button"
      >
        <div class="py-1" role="none">
          <label class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            <input
              type="checkbox"
              :checked="showExpiredProp"
              @change="$emit('update:showExpiredProp', ($event.target as HTMLInputElement).checked)"
              class="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded"
              role="menuitem"
            />
            <span class="ml-2">{{ $t('show_expired_projects') }}</span>
          </label>
          <label class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            <input
              type="checkbox"
              :checked="showCompletedProp"
              @change="$emit('update:showCompletedProp', ($event.target as HTMLInputElement).checked)"
              class="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded"
              role="menuitem"
            />
            <span class="ml-2">{{ $t('show_met_goal_projects') }}</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps<{
  selectedFilterProp: 'all' | 'myProjects' | 'myContributions';
  selectedSortProp: 'deadline' | 'progress' | 'goalAmount';
  connectedWalletAddress: string | null;
  searchQueryProp: string;
  showExpiredProp: boolean;
  showCompletedProp: boolean;
}>();

defineEmits([
  'update:selectedFilterProp',
  'update:selectedSortProp',
  'update:searchQueryProp',
  'update:showExpiredProp',
  'update:showCompletedProp'
]);

const showAdvancedFilters = ref(false);

function toggleAdvancedFilters() {
  showAdvancedFilters.value = !showAdvancedFilters.value;
}

const advancedFiltersLabel = computed(() => {
  const activeFilters: string[] = [];
  if (props.showExpiredProp) {
    activeFilters.push(t('expired_short'));
  }
  if (props.showCompletedProp) {
    activeFilters.push(t('completed_short'));
  }

  if (activeFilters.length > 0) {
    return `${t('filters_active')}: ${activeFilters.join(', ')}`;
  }
  return t('advanced_filters');
});
</script>

<style scoped>
/* Nenhum estilo específico é necessário aqui. */
</style>