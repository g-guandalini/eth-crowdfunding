# Monad Crowdfunding

Este projeto é um aplicativo básico de financiamento coletivo (crowdfunding) usando blockchain da rede Monad. Ele consiste em:

- Um **contrato inteligente** Solidity que gerencia doações e cobra taxa de serviço  
- Um **backend local** usando Hardhat para desenvolvimento, deploy e testes  
- Um **frontend** Vue 3 + Vite que conecta carteira do usuário e interage com o contrato  

---

## Pré-requisitos

- Node.js >= 18  
- npm  
- MetaMask ou outra carteira compatível para testes  
- Git (opcional)

---

## Estrutura do projeto

```
/eth-crowdfunding                # pasta raiz backend + contratos
  /contracts                      # contratos Solidity (.sol)
  /scripts                        # scripts para deploy, testes, etc
  hardhat.config.ts               # configuração Hardhat
/eth-crowdfunding-frontend      # frontend Vue 3 + Vite
  /src
    /components                   # componentes Vue
  package.json                   # dependências frontend
```

---

## Rodando localmente (desenvolvimento)

### Backend (Hardhat + Solidity)

1. Instale as dependências:

```bash
cd eth-crowdfunding
npm install
```

2. Inicie um nó local Hardhat:

```bash
npx hardhat node
```

Isso cria uma blockchain local simulada em `http://localhost:8545`.

3. Em outro terminal, faça o deploy do contrato na rede local:

```bash
npx hardhat run scripts/deploy.ts --network localhost
```

Você verá o endereço do contrato implantado, copie esse endereço.

---

### Frontend (Vue 3 + Vite)

1. Entre na pasta do frontend e instale dependências:

```bash
cd ../eth-crowdfunding-frontend
npm install
```

2. Atualize o arquivo `src/contracts/index.ts`:

- Substitua a variável CROWDFUNDING_ADDRESS pelo endereço do contrato implantado.
- Copie o ABI gerado para a pasta contracts:

```bash
cp artifacts/contracts/Crowdfunding.sol/Crowdfunding.json eth-crowdfunding-frontend/src/contracts/
```

3. Rode o frontend:

```bash
npm run dev
```

4. Abra o endereço local exibido (exemplo `http://localhost:5173`) no navegador.

5. Clique em **Connect Wallet** para conectar sua carteira (MetaMask apontando para rede local Hardhat). [Necessário incluir a rede Hardhat e utilizar um dos endereços gerados no Item 2]

6. Crie projetos e faça doações para os projetos.

---

## Como funciona

- O Hardhat cria uma blockchain local para testar e desenvolver rápido, sem custo real.  
- O contrato gerencia doações e cobra uma taxa de 0.25% para sua carteira.  
- O frontend conecta a carteira do usuário, permite doar e chama o contrato para processar a transação.  
- As transações são simuladas localmente, podendo ser monitoradas no console do Hardhat.

---

## Dicas

- Use `npx hardhat console --network localhost` para interagir manualmente com seu contrato na rede local.  
- Verifique as permissões de sua carteira MetaMask (adicionar rede local ou rede Monad).  
- Sempre teste no local antes de subir para rede real para evitar custos altos.

---
