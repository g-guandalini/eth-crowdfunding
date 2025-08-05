// scripts/test-refunds.js
const { ethers } = require("hardhat");

async function advanceTimeAndBlock(timeInSeconds) {
  await ethers.provider.send("evm_increaseTime", [timeInSeconds]);
  await ethers.provider.send("evm_mine", []); // Minas um novo bloco com o tempo avançado
  const newBlockTimestamp = (await ethers.provider.getBlock("latest")).timestamp;
  console.log(`\n>>> Tempo avançado em ${timeInSeconds} segundos. Novo block.timestamp: ${newBlockTimestamp}`);
}

async function main() {
  console.log("--- Iniciando testes de reembolso multi-doadores e nova doação ---");

  // --- 1. Obter Signers (Carteiras) ---
  // deployer: dono do contrato
  // donor1, donor2: doadores válidos
  // nonDonor: carteira que não doará
  // feeRecipient: carteira que recebe taxas (apenas para deploy do contrato)
  const [deployer, donor1, donor2, nonDonor, feeRecipient] = await ethers.getSigners();

  console.log(`Deployer (Owner): ${deployer.address}`);
  console.log(`Doador 1: ${donor1.address}`);
  console.log(`Doador 2: ${donor2.address}`);
  console.log(`Não-Doador (Non-Donor): ${nonDonor.address}`);
  console.log(`Carteira de Taxas (Fee Wallet): ${feeRecipient.address}`);

  // --- 2. Deployar o contrato Crowdfunding ---
  const Crowdfunding = await ethers.getContractFactory("Crowdfunding");
  const crowdfunding = await Crowdfunding.deploy(feeRecipient.address);
  await crowdfunding.waitForDeployment();
  const crowdfundingAddress = await crowdfunding.getAddress();
  console.log(`Contrato Crowdfunding deployado em: ${crowdfundingAddress}`);

  // --- 3. Criar um novo projeto ---
  const projectTitle = "Campanha de Teste para Reembolso";
  const projectDescription = "Este é um projeto para testar o sistema de reembolso.";
  const projectGoal = ethers.parseEther("10"); // Meta de 10 ETH
  const oneWeekInSeconds = 7 * 24 * 60 * 60;
  // O deadline é calculado a partir do timestamp do último bloco para garantir que está no futuro
  const projectDeadline = (await ethers.provider.getBlock("latest")).timestamp + oneWeekInSeconds;

  console.log("\n--- Criando projeto de teste ---");
  await crowdfunding.connect(deployer).createProject(
    projectTitle,
    projectDescription,
    projectGoal,
    projectDeadline,
    false, // fixedDonationAmount = false
    0     // requiredDonationAmount = 0
  );
  const projectId = 0; // Primeiro projeto criado terá ID 0
  const createdProject = await crowdfunding.getProject(projectId);
  console.log(`Projeto "${createdProject.title}" (ID: ${projectId}) criado com meta de ${ethers.formatEther(createdProject.goal)} ETH e deadline em ${new Date(Number(createdProject.deadline) * 1000)}.`);

  // --- 4. Doadores realizam doações ---
  console.log("\n--- Doadores realizando doações ---");
  const donationAmount1 = ethers.parseEther("3"); // 3 ETH
  const donationAmount2 = ethers.parseEther("4"); // 4 ETH

  // Doador 1 faz uma doação
  await crowdfunding.connect(donor1).donate(projectId, { value: donationAmount1 });
  console.log(`Doador 1 (${donor1.address}) doou ${ethers.formatEther(donationAmount1)} ETH.`);

  // Doador 2 faz uma doação
  await crowdfunding.connect(donor2).donate(projectId, { value: donationAmount2 });
  console.log(`Doador 2 (${donor2.address}) doou ${ethers.formatEther(donationAmount2)} ETH.`);

  // --- Exibindo o valor que cada um doou (líquido) no contrato ---
  const donor1AmountInContract = await crowdfunding.getDonation(projectId, donor1.address);
  console.log(`   --> Doador 1 tem registrado no contrato: ${ethers.formatEther(donor1AmountInContract)} ETH`);
  const donor2AmountInContract = await crowdfunding.getDonation(projectId, donor2.address);
  console.log(`   --> Doador 2 tem registrado no contrato: ${ethers.formatEther(donor2AmountInContract)} ETH`);

  // Verificar o estado do projeto após doações
  const projectAfterDonations = await crowdfunding.getProject(projectId);
  console.log(`Total arrecadado no projeto: ${ethers.formatEther(projectAfterDonations.amountRaised)} ETH.`);
  console.log(`Projeto completado? ${projectAfterDonations.completed} (deveria ser false, pois 3+4=7 < 10)`);
  console.log(`Prazo do projeto ainda não passou.`);

  // --- 5. Avançar o tempo além do deadline ---
  await advanceTimeAndBlock(oneWeekInSeconds + 1000); // Avança um pouco mais de uma semana

  // Verificar o estado do projeto após o deadline
  const projectAfterDeadline = await crowdfunding.getProject(projectId);
  console.log(`\n--- Verificando projeto após deadline ---`);
  console.log(`Prazo do projeto (timestamp): ${projectAfterDeadline.deadline}`);
  console.log(`Block timestamp atual: ${(await ethers.provider.getBlock("latest")).timestamp}`);
  console.log(`Prazo passou? ${projectAfterDeadline.deadline < (await ethers.provider.getBlock("latest")).timestamp}`);
  console.log(`Projeto completado? ${projectAfterDeadline.completed} (deveria ser false, pois a meta não foi atingida)`);


  // --- 6. Simular carteira que não doou tentando sacar ---
  console.log("\n--- Não-Doador tentando solicitar reembolso ---");
  const nonDonorBalanceBeforeAttempt = await ethers.provider.getBalance(nonDonor.address);
  console.log(`Saldo do Não-Doador antes da tentativa: ${ethers.formatEther(nonDonorBalanceBeforeAttempt)} ETH.`);

  try {
    const txNonDonor = await crowdfunding.connect(nonDonor).claimRefund(projectId);
    await txNonDonor.wait();
    console.log(`❌ ERRO: Não-Doador conseguiu sacar! Isso não deveria acontecer.`);
  } catch (error) {
    // Expected error: "No funds to claim" or similar revert message from your contract
    console.error(`✅ Sucesso: Não-Doador NÃO conseguiu sacar. Erro esperado: ${error.message.includes("No funds to claim") ? "No funds to claim" : error.message}`);
  }

  // --- 7. Cada doador solicita seu reembolso individualmente (Primeiro Saque) ---
  console.log("\n--- Doadores solicitando reembolsos individuais (Primeiro Saque) ---");

  // Saldo inicial do contrato antes dos reembolsos
  const contractBalanceBeforeRefunds = await ethers.provider.getBalance(crowdfundingAddress);
  console.log(`Saldo do contrato antes dos reembolsos: ${ethers.formatEther(contractBalanceBeforeRefunds)} ETH.`);

  // 7.1. Doador 1 solicita reembolso
  console.log(`\nTentando reembolso para Doador 1 (${donor1.address})...`);
  const donor1BalanceBefore = await ethers.provider.getBalance(donor1.address);
  console.log(`Doador 1 saldo antes: ${ethers.formatEther(donor1BalanceBefore)} ETH.`);

  let netAmountRefunded1 = BigInt(0); // Para armazenar o valor sacado na primeira tentativa
  try {
    const tx1 = await crowdfunding.connect(donor1).claimRefund(projectId);
    const receipt1 = await tx1.wait(); // Obter o recibo para calcular o custo do gás

    const donor1BalanceAfter = await ethers.provider.getBalance(donor1.address);
    // Calcular o custo do gás para a transação de reembolso
    const gasCost1 = BigInt(receipt1.gasUsed) * BigInt(receipt1.gasPrice);
    // Valor líquido que o doador recebeu (saldo depois - saldo antes + custo do gás)
    netAmountRefunded1 = donor1BalanceAfter + gasCost1 - donor1BalanceBefore;

    const donor1DonationRecordedAfter = await crowdfunding.getDonation(projectId, donor1.address);

    console.log(`✅ Reembolso do Doador 1 bem-sucedido.`);
    console.log(`   Doador 1 saldo depois: ${ethers.formatEther(donor1BalanceAfter)} ETH.`);
    console.log(`   Custo do gás da transação: ${ethers.formatEther(gasCost1)} ETH.`);
    console.log(`   --> Doador 1 sacou líquido: ${ethers.formatEther(netAmountRefunded1)} ETH.`);
    console.log(`   Valor de doação do Doador 1 no contrato agora (deve ser 0): ${ethers.formatEther(donor1DonationRecordedAfter)} ETH.`);

  } catch (error) {
    console.error(`❌ Erro ao solicitar reembolso para Doador 1: ${error.message}`);
  }

  // 7.2. Doador 2 solicita reembolso
  console.log(`\nTentando reembolso para Doador 2 (${donor2.address})...`);
  const donor2BalanceBefore = await ethers.provider.getBalance(donor2.address);
  console.log(`Doador 2 saldo antes: ${ethers.formatEther(donor2BalanceBefore)} ETH.`);

  let netAmountRefunded2 = BigInt(0); // Para armazenar o valor sacado
  try {
    const tx2 = await crowdfunding.connect(donor2).claimRefund(projectId);
    const receipt2 = await tx2.wait(); // Obter o recibo para calcular o custo do gás

    const donor2BalanceAfter = await ethers.provider.getBalance(donor2.address);
    const gasCost2 = BigInt(receipt2.gasUsed) * BigInt(receipt2.gasPrice);
    netAmountRefunded2 = donor2BalanceAfter + gasCost2 - donor2BalanceBefore;

    const donor2DonationRecordedAfter = await crowdfunding.getDonation(projectId, donor2.address);

    console.log(`✅ Reembolso do Doador 2 bem-sucedido.`);
    console.log(`   Doador 2 saldo depois: ${ethers.formatEther(donor2BalanceAfter)} ETH.`);
    console.log(`   Custo do gás da transação: ${ethers.formatEther(gasCost2)} ETH.`);
    console.log(`   --> Doador 2 sacou líquido: ${ethers.formatEther(netAmountRefunded2)} ETH.`);
    console.log(`   Valor de doação do Doador 2 no contrato agora (deve ser 0): ${ethers.formatEther(donor2DonationRecordedAfter)} ETH.`);

  } catch (error) {
    console.error(`❌ Erro ao solicitar reembolso para Doador 2: ${error.message}`);
  }

  // --- 8. Novo Teste: Doador tenta doar 1 ETH novamente e sacar ---
  console.log("\n--- Novo Teste: Doador 1 tenta doar 1 ETH novamente e sacar ---");
  const secondDonationAmount = ethers.parseEther("1");

  console.log(`\nTentando Doador 1 (${donor1.address}) doar ${ethers.formatEther(secondDonationAmount)} ETH novamente para o projeto ${projectId}...`);
  try {
    // A maioria dos contratos de crowdfunding não permite doações após o deadline.
    // Se o seu contrato permite, este 'await' terá sucesso.
    // Se não permite, ele falhará como esperado.
    await crowdfunding.connect(donor1).donate(projectId, { value: secondDonationAmount });
    console.log(`✅ Doador 1 conseguiu fazer a segunda doação de ${ethers.formatEther(secondDonationAmount)} ETH.`);

    // Se conseguiu doar, agora tenta sacar
    console.log(`   Tentando Doador 1 sacar a segunda doação de ${ethers.formatEther(secondDonationAmount)} ETH...`);
    const donor1BalanceBeforeSecondRefund = await ethers.provider.getBalance(donor1.address);
    try {
      const txSecondRefund = await crowdfunding.connect(donor1).claimRefund(projectId);
      const receiptSecondRefund = await txSecondRefund.wait();

      const donor1BalanceAfterSecondRefund = await ethers.provider.getBalance(donor1.address);
      const gasCostSecondRefund = BigInt(receiptSecondRefund.gasUsed) * BigInt(receiptSecondRefund.gasPrice);
      const netAmountSecondRefunded = donor1BalanceAfterSecondRefund + gasCostSecondRefund - donor1BalanceBeforeSecondRefund;

      const donor1DonationRecordedAfterSecondRefund = await crowdfunding.getDonation(projectId, donor1.address);

      console.log(`   ✅ Reembolso da segunda doação do Doador 1 bem-sucedido.`);
      console.log(`      Doador 1 saldo depois da segunda tentativa: ${ethers.formatEther(donor1BalanceAfterSecondRefund)} ETH.`);
      console.log(`      Custo do gás da transação (segunda): ${ethers.formatEther(gasCostSecondRefund)} ETH.`);
      console.log(`      --> Doador 1 sacou líquido da segunda doação: ${ethers.formatEther(netAmountSecondRefunded)} ETH.`);
      console.log(`      Valor de doação do Doador 1 no contrato agora (deve ser 0): ${ethers.formatEther(donor1DonationRecordedAfterSecondRefund)} ETH.`);

    } catch (error) {
      console.error(`   ❌ Erro ao tentar sacar a segunda doação para Doador 1: ${error.message}`);
    }

  } catch (error) {
    console.error(`   ❌ Sucesso: Doador 1 NÃO conseguiu fazer a segunda doação. Erro esperado: ${error.message.includes("Project has ended") ? "Project has ended" : error.message}`);
    console.log("   (Isso é geralmente o comportamento esperado para projetos com deadline fixo já passado.)");
  }

  // --- Saldo final do contrato ---
  const contractBalanceAfterRefunds = await ethers.provider.getBalance(crowdfundingAddress);
  console.log(`\nSaldo do contrato após todos os reembolsos: ${ethers.formatEther(contractBalanceAfterRefunds)} ETH.`);
  console.log("--- Testes concluídos ---");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });