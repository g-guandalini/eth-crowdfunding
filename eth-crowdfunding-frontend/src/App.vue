<template>
  <div id="app" class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Cabeçalho fixo com flex-wrap e paddings responsivos -->
    <header class="bg-[#1f0053] text-white px-3 py-2 shadow-md flex flex-wrap justify-between items-center fixed top-0 w-full z-20
                   md:px-6 md:py-4">

      <div class="flex-shrink-0 py-1">
        <router-link to="/">
          <img src="/src/logo_horizontal_.png" alt="Spark Logo" class="h-8 md:h-8" />
        </router-link>
      </div>

      <!-- Novo container para agrupar e controlar a responsividade dos itens à direita -->
      <!-- REMOVIDO: py-1 -->
      <div class="flex items-center flex-wrap space-x-2 md:space-x-4 justify-end"> 
        <!-- Links de navegação -->
        <router-link to="/" class="text-white text-sm md:text-base hover:text-blue-200 whitespace-nowrap">
          {{ $t('projects') }}
        </router-link>
        <router-link to="/create" class="text-white text-sm md:text-base hover:text-blue-200 whitespace-nowrap">
          {{ $t('createProject') }}
        </router-link>
        <!-- LanguageSwitcher -->
        <LanguageSwitcher />

        <!-- Network Selector Customizado -->
        <div class="relative inline-block text-left z-30" v-click-outside="closeDropdown">
          <div>
            <button
              type="button"
              class="inline-flex justify-center items-center w-full rounded-md border border-gray-600 shadow-sm px-4 py-2 
                     bg-[#1f0053] text-sm md:text-base font-medium text-white hover:bg-[#2a0063] 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1f0053] focus:ring-blue-500"
              @click="toggleDropdown"
              aria-haspopup="true"
              :aria-expanded="isDropdownOpen ? 'true' : 'false'"
            >
              <!-- Exibir logo e nome da rede selecionada -->
              <img v-if="selectedNetwork" :src="selectedNetwork.logo" :alt="selectedNetwork.name" class="h-5 w-5 mr-2 rounded-full" />
              <span v-if="selectedNetwork">{{ selectedNetwork.name }}</span>
              <span v-else>{{ $t('selectNetwork') || 'Select Network' }}</span>

              <!-- Ícone de seta do dropdown -->
              <svg class="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          <!-- Painel do Dropdown (oculto por padrão) -->
          <div
            v-if="isDropdownOpen"
            class="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg 
                   bg-[#1f0053] ring-1 ring-black ring-opacity-5 focus:outline-none"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="menu-button"
            tabindex="-1"
          >
            <div class="py-1" role="none">
              <a
                v-for="(network, key) in NETWORKS"
                :key="key"
                href="#"
                class="text-white block px-4 py-2 text-sm hover:bg-[#2a0063] flex items-center"
                role="menuitem"
                tabindex="-1"
                @click.prevent="selectNetwork(key)"
              >
                <img :src="network.logo" :alt="network.name" class="h-5 w-5 mr-3 rounded-full" />
                {{ network.name }}
              </a>
            </div>
          </div>
        </div>

        <!-- WalletConnect -->
        <WalletConnect />
      </div>
    </header>

    <main class="flex-grow pt-20">
      <router-view />
    </main>

    <footer class="bg-[#1f0053] text-white text-center p-4 mt-10">
      <p class="mt-2 text-sm">
        {{ $t('footerText') }}
        <a
          href="https://x.com/GusGuandalini"
          
          rel="noopener noreferrer"
          class="text-blue-200 hover:underline"
        >
          Guandalini
        </a>
        <span class="mx-2">|</span>
        <a
          href="https://github.com/g-guandalini/eth-crowdfunding"
          
          rel="noopener noreferrer"
          class="text-blue-200 hover:underline inline-flex items-center space-x-1 align-middle"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="inline-block">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.804 8.207 11.385.6.113.818-.258.818-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.08-.731.084-.716.084-.716 1.192.084 1.816 1.228 1.816 1.228 1.065 1.812 2.793 1.287 3.476.983.107-.76.417-1.287.76-1.583-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.305-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.046.138 3.003.404 2.292-1.552 3.3-.322 3.3-.322.653 1.653.242 2.871.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.816 1.102.816 2.222v3.293c0 .319.217.69.824.576C20.565 21.808 24 17.306 24 12c0-6.627-5.373-12-12-12z"/>
          </svg>
          &nbsp;{{ $t('github') }}
        </a>
      </p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, provide, watch } from 'vue'; // Adicionado 'provide' e 'watch'
import WalletConnect from './components/ConnectWallet.vue';
import LanguageSwitcher from './components/LanguageSwitcher.vue';
import { NETWORKS, CONTRACT_ADDRESSES, DEFAULT_NETWORK_KEY } from './networks.js'; // Importar tudo de networks.js

const selectedNetworkKey = ref(DEFAULT_NETWORK_KEY); // Inicializa com a rede padrão
const isDropdownOpen = ref(false);

const selectedNetwork = computed(() => {
  return selectedNetworkKey.value ? NETWORKS[selectedNetworkKey.value] : null;
});

// **PROVISIONANDO DADOS PARA COMPONENTES FILHO/NETO**
// Isso torna 'selectedNetwork', 'NETWORKS' e 'CONTRACT_ADDRESSES' acessíveis para qualquer componente
// abaixo de App.vue na árvore de componentes que usar 'inject'.
provide('selectedNetwork', selectedNetwork);
provide('NETWORKS', NETWORKS);
provide('CONTRACT_ADDRESSES', CONTRACT_ADDRESSES);


// ... (o restante das suas funções e hooks de lifecycle) ...

// Diretiva customizada para fechar o dropdown ao clicar fora
const vClickOutside = {
  mounted(el, binding) {
    el.__ClickOutsideHandler__ = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event);
      }
    };
    document.addEventListener('click', el.__ClickOutsideHandler__);
  },
  unmounted(el) {
    document.removeEventListener('click', el.__ClickOutsideHandler__);
  }
};

const toHexChainId = (chainId) => '0x' + parseInt(chainId, 10).toString(16);

const updateSelectedNetworkFromWallet = async () => {
  if (window.ethereum) {
    try {
      const currentChainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
      const currentChainIdDecimal = parseInt(currentChainIdHex, 16).toString();

      const foundKey = Object.keys(NETWORKS).find(key => NETWORKS[key].chainId === currentChainIdDecimal);
      if (foundKey) {
        selectedNetworkKey.value = foundKey;
      } else {
        selectedNetworkKey.value = ''; // Resetar se a rede atual não estiver na nossa lista
        console.warn(`Rede atual (${currentChainIdHex}) não está na lista de redes suportadas.`);
      }
    } catch (error) {
      console.error("Erro ao obter o Chain ID da carteira:", error);
      selectedNetworkKey.value = '';
    }
  }
};

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const closeDropdown = () => {
  isDropdownOpen.value = false;
};

const selectNetwork = async (networkKey) => {
  closeDropdown();
  const targetNetwork = NETWORKS[networkKey];

  if (!targetNetwork) {
    console.error("Rede selecionada não encontrada:", networkKey);
    alert("Rede selecionada inválida.");
    updateSelectedNetworkFromWallet();
    return;
  }

  if (!window.ethereum) {
    alert("Por favor, instale uma carteira compatível com Ethereum, como MetaMask.");
    return;
  }

  const targetChainIdHex = toHexChainId(targetNetwork.chainId);

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: targetChainIdHex }],
    });
    console.log(`Cambiou para a rede: ${targetNetwork.name}`);
  } catch (switchError) {
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: targetChainIdHex,
              chainName: targetNetwork.name,
              rpcUrls: [targetNetwork.rpcUrl],
              nativeCurrency: targetNetwork.currency,
              blockExplorerUrls: targetNetwork.blockExplorerUrl
                ? [targetNetwork.blockExplorerUrl]
                : undefined,
            },
          ],
        });
      } catch (addError) {
        console.error("Erro ao adicionar a rede:", addError);
        alert(
          `Não foi possível adicionar a rede ${targetNetwork.name}. Por favor, adicione-a manualmente na sua carteira.`
        );
        updateSelectedNetworkFromWallet();
      }
    } else {
      console.error("Erro ao mudar de rede:", switchError);
      alert(
        `Não foi possível mudar para a rede ${targetNetwork.name}. Por favor, tente novamente ou mude-a manualmente na sua carteira.`
      );
      updateSelectedNetworkFromWallet();
    }
  }
};

onMounted(() => {
  if (window.ethereum) {
    window.ethereum.on('chainChanged', updateSelectedNetworkFromWallet);
    // Também ouça por 'accountsChanged' para atualizar o endereço da carteira
    window.ethereum.on('accountsChanged', updateSelectedNetworkFromWallet);
    updateSelectedNetworkFromWallet();
  }
});

onUnmounted(() => {
  if (window.ethereum) {
    window.ethereum.removeListener('chainChanged', updateSelectedNetworkFromWallet);
    window.ethereum.removeListener('accountsChanged', updateSelectedNetworkFromWallet);
  }
});
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>