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

      <div class="border-b border-gray-200 mt-4 mb-4"></div>
      <!-- Usando v-html para renderizar a descrição parseada do Markdown -->
      <!-- A classe 'prose' do Tailwind aplica estilos básicos de tipografia -->
      <div
        ref="descriptionContainerRef"
        class="text-gray-600 text-sm mb-4 prose prose-sm transition-all duration-300 ease-in-out"
        :class="{
          'min-h-[420px] max-h-[420px] overflow-hidden': !isExpanded, /* Colapsado: altura fixa, esconde overflow */
          'max-h-[9999px] overflow-visible': isExpanded /* Expandido: altura total, visível */
        }"
        v-html="renderedDescription"
      ></div>

      <!-- Botão "Saiba mais" / "Mostrar menos" -->
      <div v-if="showReadMoreButton" class="text-center mt-2">
        <button
          @click="toggleDescription"
          class="text-blue-600 hover:text-blue-800 text-sm font-semibold focus:outline-none"
        >
          {{ isExpanded ? 'Mostrar menos' : 'Saiba mais' }}
        </button>
      </div>

      <!-- Nova linha divisória abaixo da descrição e acima da meta -->
      <div class="border-b border-gray-200 mt-4 mb-4"></div>

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
      <!-- Indicação da taxa de serviço -->
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
import { ref, watch, defineProps, defineEmits, computed, onMounted, nextTick } from 'vue';
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

const props = defineProps<{
  project: Project;
}>();

const emit = defineEmits(['donateProject']);

const donationAmountInternal = ref(props.project.fixedDonationAmount ? parseFloat(props.project.requiredDonationAmount).toFixed(4) : '');

// === Variáveis de estado para a funcionalidade "Saiba Mais" ===
const isExpanded = ref(false); // Controla se a descrição está expandida
const descriptionContainerRef = ref<HTMLElement | null>(null); // Referência para o elemento da descrição
const showReadMoreButton = ref(false); // Controla a visibilidade do botão "Saiba mais"

// Função para alternar o estado de expansão
const toggleDescription = () => {
  isExpanded.value = !isExpanded.value;
};

// Função para verificar se a descrição excede a altura inicial e precisa do botão
const checkDescriptionOverflow = () => {
  nextTick(() => { // Garante que o DOM esteja atualizado antes de medir
    if (descriptionContainerRef.value) {
      // Salva os estilos computados atuais para restaurar depois
      const originalMaxHeight = descriptionContainerRef.value.style.maxHeight;
      const originalOverflow = descriptionContainerRef.value.style.overflow;
      const originalMinHeight = descriptionContainerRef.value.style.minHeight;

      // Temporariamente remove max-height, min-height e overflow para obter a altura real do conteúdo
      descriptionContainerRef.value.style.maxHeight = 'none';
      descriptionContainerRef.value.style.minHeight = 'auto'; // Garante que não há min-height impedindo a medição real
      descriptionContainerRef.value.style.overflow = 'visible';

      const fullHeight = descriptionContainerRef.value.scrollHeight; // Altura real do conteúdo
      const collapsedHeightPx = 420; // Altura para 20 linhas (aprox. 14px font-size * 1.5 line-height * 20 linhas = 420px)

      // Restaura os estilos (ou deixa as classes Tailwind dinâmicas redefinirem)
      descriptionContainerRef.value.style.maxHeight = originalMaxHeight;
      descriptionContainerRef.value.style.overflow = originalOverflow;
      descriptionContainerRef.value.style.minHeight = originalMinHeight;

      // Define se o botão deve ser exibido comparando a altura total com a altura colapsada
      // showReadMoreButton.value = fullHeight > collapsedHeightPx;
      // Ajuste: Apenas se o fullHeight for visivelmente maior (ex: 5px de tolerância)
      showReadMoreButton.value = fullHeight > (collapsedHeightPx + 5); // Adiciona uma pequena tolerância

    }
  });
};
// ===================================================================

// Observa mudanças na prop `project.fixedDonationAmount` para atualizar o valor inicial
watch(() => props.project.fixedDonationAmount, (newVal) => {
  if (newVal) {
    donationAmountInternal.value = parseFloat(props.project.requiredDonationAmount).toFixed(4);
  } else {
    donationAmountInternal.value = '';
  }
}, { immediate: true }); // Executa imediatamente na montagem

// Propriedade computada para renderizar a descrição como HTML a partir do Markdown
const renderedDescription = computed(() => {
  const parsedHtml = props.project.description ? marked.parse(props.project.description) : '';
  return parsedHtml;
});

function handleDonationInputChange() {
  if (props.project.fixedDonationAmount) {
    return; // Input é readonly
  }

  let value = donationAmountInternal.value;
  value = value.replace(/[^0-9.]/g, ''); // Permite apenas números e um ponto

  const parts = value.split('.');
  if (parts.length > 2) {
    // Se houver mais de um ponto, remove os pontos extras
    value = parts[0] + '.' + parts.slice(1).join('');
  }

  if (value.startsWith('.')) {
    // Se começar com ponto, adiciona um '0' na frente
    value = '0' + value;
  }

  if (value.length > 1 && value.startsWith('0') && !value.startsWith('0.')) {
    // Remove zeros à esquerda se não for decimal
    value = parseFloat(value).toString();
  }

  donationAmountInternal.value = value;
}

// === Dispara a checagem de overflow na montagem do componente ===
onMounted(() => {
  checkDescriptionOverflow();
});

// === Observa mudanças na descrição do projeto para reavaliar o overflow ===
watch(() => props.project.description, () => {
  isExpanded.value = false; // Colapsa a descrição se ela mudar
  checkDescriptionOverflow();
}, { immediate: true });
</script>

<style scoped>
/* Estilos escopados para este componente, não afetam o conteúdo do v-html */

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Estilos para a barra de rolagem customizada - mantidos para a seção de Doadores */
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

<!-- BLOCO DE ESTILO GLOBAL (SEM SCOPED): Crucial para o conteúdo Markdown e ajuste de texto -->
<style>
/* Força a quebra de linha em elementos <pre> (blocos de código) e <code> (código inline) */
.prose pre {
  white-space: pre-wrap; /* Mantém espaços e quebras de linha do original, mas quebra o texto */
  word-break: break-word; /* Quebra palavras longas que não cabem */
  overflow-x: hidden;    /* Esconde a barra de rolagem horizontal se ainda aparecer */
}

.prose code {
  word-break: break-word; /* Garante que código inline também quebre */
}

/* Garante que o container principal da descrição (onde o v-html está) também quebre palavras longas */
/* A classe custom-scrollbar aqui é usada especificamente para o bloco de "Doadores" agora, mas estas regras */
/* são globais e seguras de permanecer para afetar qualquer elemento que as use. */
.custom-scrollbar {
  word-wrap: break-word; /* Para navegadores antigos */
  word-break: break-word; /* Para navegadores modernos */
}
</style>