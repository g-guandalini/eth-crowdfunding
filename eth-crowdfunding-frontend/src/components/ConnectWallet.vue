<!-- src/components/WalletConnect.vue -->
<template>
  <div class="relative">
    <!-- Botão para Conectar Carteira (visível quando não conectado) -->
    <button v-if="!wallet.account" @click="connectWallet"
            class="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-all duration-200">
            {{ $t('connect_wallet') }}
    </button>

    <!-- Exibição da Carteira Conectada e Dropdown (visível quando conectado) -->
    <div v-else class="flex items-center space-x-2">
      <!-- Botão com o Endereço da Carteira -->
      <button @click="toggleDropdown"
              class="px-4 py-2 bg-gray-100 text-gray-800 font-mono rounded-lg shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-75 transition-all duration-200 flex items-center">
        <!-- Ícone de Carteira -->
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
        </svg>
        <!-- Endereço Formatado -->
        {{ formatAddress(wallet.account) }} 
        <!-- Ícone de Seta para o Dropdown -->
        <svg xmlns="http://www.w3.org/2000/svg" :class="{'rotate-180': dropdownOpen}" class="ml-2 -mr-1 h-5 w-5 text-gray-400 transition-transform duration-200" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>

      <!-- Menu Dropdown de Desconexão -->
      <div v-if="dropdownOpen"
           class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 ring-1 ring-black ring-opacity-5 focus:outline-none"
           role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button" tabindex="-1">
        <a @click="disconnectWallet" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer" role="menuitem" tabindex="-1" id="user-menu-item-0">
          <!-- Ícone de Desconectar -->
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline-block mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-2 0V4H5v12h7a1 1 0 110 2H4a1 1 0 01-1-1V3zm10 2a1 1 0 01-.845.485l-2.42-1.21A1 1 0 019 4V3a1 1 0 011-1h2a1 1 0 011 1v2zM10 7a1 1 0 011 1v4a1 1 0 11-2 0V8a1 1 0 011-1zm-2 0a1 1 0 011 1v4a1 1 0 11-2 0V8a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          {{ $t('disconnect') }}
        </a>
      </div>
    </div>
    <!-- Mensagem de erro para o usuário -->
    <div v-if="errorMessage" class="absolute top-full right-0 mt-2 p-2 bg-red-100 text-red-700 rounded-md shadow-lg z-30 text-sm">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
// Ajuste o caminho de importação conforme a sua estrutura de pastas e se o alias '@' funciona
import { useWalletStore } from '../stores/wallet'; // Exemplo de caminho relativo
import Web3Modal from 'web3modal';
import { ethers } from 'ethers';
import { useI18n } from 'vue-i18n'; // Importe useI18n

const { t } = useI18n();

const wallet = useWalletStore();
const dropdownOpen = ref(false);
const errorMessage = ref('');

let web3ModalInstance: Web3Modal | null = null;
let providerListenersAdded = false;

function initWeb3Modal() {
  if (!web3ModalInstance) {
    web3ModalInstance = new Web3Modal({
      cacheProvider: true,
    });
  }
}

function formatAddress(address: string | null): string {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

function handleAccountsChanged(accounts: string[]) {
  if (accounts.length === 0) {
    disconnectWallet();
  } else if (wallet.account !== accounts[0]) {
    wallet.account = accounts[0];
    errorMessage.value = '';
  }
}

function handleChainChanged(chainId: string) {
  window.location.reload();
}

function addProviderListeners(instance: any) {
  if (instance && instance.on && !providerListenersAdded) {
    instance.on('accountsChanged', handleAccountsChanged);
    instance.on('chainChanged', handleChainChanged);
    providerListenersAdded = true;
  }
}

function removeProviderListeners(instance: any) {
  if (instance && instance.removeListener && providerListenersAdded) {
    instance.removeListener('accountsChanged', handleAccountsChanged);
    instance.removeListener('chainChanged', handleChainChanged);
    providerListenersAdded = false;
  }
}

async function connectWallet() {
  errorMessage.value = '';
  try {
    initWeb3Modal();

    if (!window.ethereum && !web3ModalInstance?.cachedProvider) {
      errorMessage.value = t('no_provider');
      return;
    }

    const instance = await web3ModalInstance!.connect();
    const provider = new ethers.BrowserProvider(instance);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    wallet.account = address;

    addProviderListeners(instance);

  } catch (err: any) {
    console.error(t('error_connect'), err);
    if (err.code === 4001) {
      errorMessage.value = t('connection_rejected');
    } else if (err.message && err.message.includes('No provider found')) {
      errorMessage.value = t('no_provider');
    } else {
      errorMessage.value = t('error_connect');
    }
  }
}

async function disconnectWallet() {
  errorMessage.value = '';
  try {
    if (web3ModalInstance) {
      // Remover listeners do provedor ATIVO ANTES de limpar o cache/estado
      if (web3ModalInstance.cachedProvider) { // Verifica se há um provedor cacheado para remover os listeners dele
        const cachedProviderInstance = await web3ModalInstance.connect(); // Reconecta temporariamente para obter a instância do provedor
        removeProviderListeners(cachedProviderInstance);
      }
      web3ModalInstance.clearCachedProvider(); // Limpa o cache do Web3Modal (localStorage)
    }
    
    wallet.account = null;
    dropdownOpen.value = false;

    // Além disso, se a window.ethereum ainda estiver ativa, remove seus listeners
    // Isso é mais defensivo e garante que eventos não sejam disparados após desconectar da dApp
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    }

  } catch (err) {
    console.error(t('error_disconnect'), err);
    errorMessage.value = t('error_disconnect');
  }
}

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value;
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (dropdownOpen.value && !target.closest('.relative')) {
    dropdownOpen.value = false;
  }
};

onMounted(async () => {
  initWeb3Modal(); // Inicializa o Web3Modal

  // *** MUDANÇA CHAVE AQUI ***
  // Tente reconectar SOMENTE se Web3Modal tiver um provedor cacheado.
  // Isso evita reconectar se o MetaMask simplesmente lembra do site, mas o usuário "desconectou" da sua UI.
  if (web3ModalInstance && web3ModalInstance.cachedProvider) {
    await connectWallet();
  }
  
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  // Remove listeners específicos do provedor, se estiverem ativos, ao desmontar o componente
  // É crucial para evitar vazamento de memória e garantir que eventos não sejam disparados
  if (wallet.account && window.ethereum) { // Se a carteira estava conectada e era MetaMask
    removeProviderListeners(window.ethereum);
  } else if (web3ModalInstance && web3ModalInstance.cachedProvider) {
    // Caso contrário, tenta remover do provedor cacheado se ele existir
    // Isso é uma tentativa, pois o provedor cacheado pode não ser a instância ativa no momento
    web3ModalInstance.connect().then(instance => {
      removeProviderListeners(instance);
    }).catch(err => console.error(t('error_unmounted'), err));
  }
});
</script>

<style scoped>
/* Adicione aqui quaisquer estilos específicos que você queira que não sejam Tailwind */
</style>