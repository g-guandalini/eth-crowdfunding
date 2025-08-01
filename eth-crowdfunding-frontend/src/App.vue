<template>
  <div id="app" class="min-h-screen bg-gray-50 flex flex-col">
    <header class="bg-[#1f0053] text-white p-4 shadow-md flex justify-between items-center relative z-20">
      <div class="flex items-center space-x-4">
        <router-link to="/">
          <img src="/src/logo_horizontal_.png" alt="Spark Logo" class="h-12" /> <!-- Exemplo de logo -->
        </router-link>
      </div>
      <nav class="flex items-center space-x-4">
        <router-link to="/" class="text-white hover:text-blue-200">✨ Projetos</router-link>
        <router-link to="/create" class="text-white hover:text-blue-200">✨ Criar Projeto</router-link>
        <WalletConnect />
      </nav>
    </header>

    <main class="flex-grow">
      <router-view /> 
    </main>

    <footer class="bg-[#1f0053] text-white text-center p-4 mt-10">
      <p>&copy; 2025 Spark Crowdfunding. Todos os direitos reservados.</p>
    </footer>
  </div>
</template>

<script setup>
import WalletConnect from './components/ConnectWallet.vue';
</script>
