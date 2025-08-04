<template>
  <div
    :class="[
      'bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between h-full border-2',
      getProjectBorderClass(project) // Classe de borda dinâmica
    ]"
  >
    <div>
      <!-- Título do Projeto -->
      <!-- ADICIONADO: class="break-words" para garantir quebra de linha em palavras longas -->
      <h3 class="text-2xl font-extrabold text-gray-800 mb-3 break-words" :title="project.title">
        {{ project.title }}
      </h3>

      <!-- Separador -->
      <div class="border-b border-gray-200 my-4"></div>

      <!-- Grid para Meta/Arrecadado/Progresso e Prazo/Criador/Botão -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <!-- Coluna Esquerda: Meta, Arrecadado, Progresso -->
        <div>
          <p class="mb-1 text-gray-700"><strong>Meta:</strong> {{ parseFloat(project.goal).toFixed(2) }} MON</p>
          <p class="mb-3 text-gray-700"><strong>Arrecadado:</strong> {{ parseFloat(project.amountRaised).toFixed(2) }} MON</p>
          
          <!-- Barra de Progresso -->
          <div class="w-full bg-gray-200 rounded-full h-2.5 mb-1">
            <div
              class="bg-green-500 h-2.5 rounded-full transition-all duration-500 ease-out"
              :style="{ width: projectProgress(project) + '%' }"
            ></div>
          </div>
          <p class="text-sm text-gray-500">{{ projectProgress(project).toFixed(2) }}% concluído</p>
        </div>

        <!-- Coluna Direita: Prazo, Criador, Botão "Conhecer Projeto" -->
        <div class="flex flex-col justify-between h-full">
          <div>
            <p class="mb-1 text-gray-700">
              <strong>Prazo:</strong>
              {{ formatDeadline(project.deadline) }}
            </p>
            <p class="mb-4 text-gray-700 text-sm">
              <strong class="font-medium">Criador:</strong>
              <span class="text-blue-600 break-all">
                {{ formatAddress(project.owner) }}
              </span>
            </p>
          </div>
          
          <!-- Botão "Conhecer Projeto" -->
          <router-link
            :to="{ name: 'project-details', params: { id: project.id } }"
            class="mt-auto bg-[#1f0053] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-center transition-colors duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 whitespace-nowrap"
          >
            Ver Projeto
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import type { Project } from '@/types/project';
import {
  projectProgress,
  formatAddress,
  formatDeadline,
  getProjectBorderClass
} from '@/utils/projectHelpers';

const props = defineProps<{
  project: Project;
}>();
</script>

<style scoped>
/* Nenhum estilo específico é necessário aqui além dos utilitários do Tailwind */
</style>