<template>
  <div id="app" class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Cabeçalho fixo com flex-wrap e paddings responsivos -->
    <header class="bg-[#1f0053] text-white px-3 py-2 shadow-md flex flex-wrap justify-between items-center fixed top-0 w-full z-20
                   md:px-6 md:py-4"> <!-- px-3 py-2 para telas menores, md:px-6 md:py-4 para maiores -->

      <div class="flex-shrink-0 py-1"> <!-- py-1 para dar um respiro vertical se houver quebra de linha -->
        <router-link to="/">
          <img src="/src/logo_horizontal_.png" alt="Spark Logo" class="h-10 md:h-12" /> <!-- h-10 para menores, md:h-12 para maiores -->
        </router-link>
      </div>

      <!-- Novo container para agrupar e controlar a responsividade dos itens à direita -->
      <div class="flex items-center flex-wrap space-x-2 py-1 md:space-x-4 justify-end">
        <!-- Links de navegação com fonte responsiva e sem quebra de linha -->
        <router-link to="/" class="text-white text-sm md:text-base hover:text-blue-200 whitespace-nowrap">
          {{ $t('projects') }}
        </router-link>
        <router-link to="/create" class="text-white text-sm md:text-base hover:text-blue-200 whitespace-nowrap">
          {{ $t('createProject') }}
        </router-link>
        <!-- LanguageSwitcher e WalletConnect -->
        <LanguageSwitcher />
        <WalletConnect />
      </div>
    </header>

    <!-- Conteúdo principal: pt-20 ainda é um bom valor seguro para o padding superior -->
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
import WalletConnect from './components/ConnectWallet.vue';
import LanguageSwitcher from './components/LanguageSwitcher.vue';
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