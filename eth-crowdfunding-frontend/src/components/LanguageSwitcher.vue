<!-- src/components/LanguageSwitcher.vue -->
<template>
    <div class="flex items-center space-x-2">
      <button
        v-for="lang in supportedLanguages"
        :key="lang.code"
        @click="changeLanguage(lang.code)"
        :class="[
          'p-1 rounded-full cursor-pointer transition-all duration-200',
          locale === lang.code ? 'bg-blue-600 ring-2 ring-blue-400' : 'hover:bg-blue-500'
        ]"
        :title="lang.name"
      >
        <img :src="getFlagPath(lang.code)" :alt="`${lang.name} Flag`" class="w-6 h-6 rounded-full object-cover" />
      </button>
    </div>
  </template>
  
  <script setup>
  import { useI18n } from 'vue-i18n';
  
  const { locale } = useI18n(); // Obtém a referência reativa do idioma atual
  
  // Define os idiomas suportados e o nome do arquivo da bandeira correspondente
  const supportedLanguages = [
    { code: 'en', name: 'English', flag: 'us' }, // 'us' para a bandeira dos EUA (comumente usada para inglês)
    { code: 'pt-br', name: 'Português (Brasil)', flag: 'br' },
  ];
  
  // Função para construir o caminho da imagem da bandeira
  const getFlagPath = (langCode) => {
    const lang = supportedLanguages.find(l => l.code === langCode);
    const flagName = lang ? lang.flag : '';
    // Em projetos Vite, arquivos na pasta `public` são acessíveis pela raiz.
    // Por exemplo, `public/flags/us.svg` pode ser acessado como `/flags/us.svg`
    return `/flags/${flagName}.svg`;
  };
  
  const changeLanguage = (newLocale) => {
    locale.value = newLocale; // Atualiza o idioma do i18n
    localStorage.setItem('user-locale', newLocale); // Salva a preferência do usuário
  };
  </script>
  
  <style scoped>
  /*
    Você não precisa de estilos adicionais aqui se estiver usando Tailwind CSS
    para todos os seus estilos, como é o caso na classe `button`.
  */
  </style>
  