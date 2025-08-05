/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_CROWDFUNDING_ADDRESS: string
    // ... outras variáveis VITE_
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }