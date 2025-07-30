<template>
  <div id="app" class="min-h-screen bg-gray-50 flex flex-col">
    <header class="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center relative z-20">
      <h1 class="text-2xl font-bold">Monad Crowdfunding</h1>
      <nav class="flex items-center space-x-4">
        <router-link to="/" class="text-white hover:text-blue-200">Projetos</router-link>
        <router-link to="/create" class="text-white hover:text-blue-200">Criar Projeto</router-link>
        <WalletConnect />
      </nav>
    </header>

    <main class="flex-grow">
      <router-view /> 
    </main>

    <footer class="bg-gray-800 text-white text-center p-4 mt-10">
      <p>&copy; 2024 Monad Crowdfunding. Todos os direitos reservados.</p>
    </footer>
  </div>
</template>

<script setup>
import WalletConnect from './components/ConnectWallet.vue';
</script>
