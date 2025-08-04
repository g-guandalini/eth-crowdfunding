// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Crowdfunding {
    struct Project {
        address owner;
        string title;
        string description;
        uint256 goal;
        uint256 deadline; // Agora é um timestamp recebido como parâmetro
        uint256 amountRaised; // Armazena o valor líquido (após taxas)
        bool completed; // True se a meta foi batida
        bool fixedDonationAmount; // Novo: true se a doação for de valor fixo
        uint256 requiredDonationAmount; // Novo: o valor fixo da doação
        // bool refundsEnabled; // REMOVIDO: Não mais necessário, a validação é direta em claimRefund
        bool withdrawn; // Para controlar se o saque do proprietário já foi processado
    }

    // projects.length pode ser usado no lugar de projectCounter
    Project[] public projects;

    // Mapeamento para armazenar o valor TOTAL (BRUTO) doado por cada doador em cada projeto
    mapping(uint256 => mapping(address => uint256)) public donations;

    // Novo mapeamento para armazenar a lista de doadores para cada projeto
    // Ainda útil para iterar sobre os doadores para listagem, mesmo com reembolso individual
    mapping(uint256 => address[]) public projectDonors;

    // Endereço da carteira que receberá a taxa de plataforma
    address public feeWallet;
    // Constantes para representar a taxa de 0.25%
    // Para 0.25%, usamos 25/10000. Isso evita problemas com números decimais em Solidity.
    uint256 private constant FEE_PERCENTAGE_NUMERATOR = 25; // Corresponde a 0.25
    uint256 private constant FEE_PERCENTAGE_DENOMINATOR = 10000; // Denominador para 0.25%

    // NOVO: Valor mínimo de doação (0.001 Ether em Wei)
    uint256 private constant MIN_DONATION_AMOUNT = 10**15; // 0.001 Ether

    event ProjectCreated(
        uint256 indexed projectId,
        address indexed owner,
        string title,
        uint256 goal,
        uint256 deadline
    );

    event DonationReceived(
        uint256 indexed projectId,
        address indexed donor,
        uint256 amount // Este é o valor BRUTO da doação
    );

    // Evento para o processamento de reembolso individual
    event RefundClaimed(
        uint256 indexed projectId,
        address indexed donor,
        uint256 amountRefunded // Este é o valor LÍQUIDO reembolsado
    );

    // Evento para registrar o pagamento da taxa
    event FeePaid(
        uint256 indexed projectId,
        address indexed donor,
        uint256 amount,
        address indexed feeRecipient
    );

    // Evento para o saque dos fundos pelo proprietário do projeto
    event FundsWithdrawn(
        uint256 indexed projectId,
        address indexed owner,
        uint256 amount
    );

    // O construtor agora exige o endereço da carteira de taxas
    constructor(address _feeWallet) {
        require(_feeWallet != address(0), "Fee wallet cannot be zero address");
        feeWallet = _feeWallet;
    }

    /**
     * @dev Cria um novo projeto de crowdfunding.
     * @param _title Título do projeto.
     * @param _description Descrição do projeto.
     * @param _goal Meta de arrecadação do projeto em Wei.
     * @param _deadlineTimestamp Data limite do projeto em Unix timestamp.
     * @param _fixedDonationAmount Define se as doações devem ser de um valor fixo.
     * @param _requiredDonationAmount O valor fixo da doação, se _fixedDonationAmount for true.
     */
    function createProject(
        string memory _title,
        string memory _description,
        uint256 _goal,
        uint256 _deadlineTimestamp, // Recebe o timestamp diretamente
        bool _fixedDonationAmount,
        uint256 _requiredDonationAmount
    ) external {
        require(_goal > 0, "Goal must be greater than zero");
        require(_deadlineTimestamp > block.timestamp, "Deadline must be in the future");
        // Se a doação é fixa, o valor fixo também deve ser maior ou igual ao mínimo de doação
        if (_fixedDonationAmount) {
            require(_requiredDonationAmount >= MIN_DONATION_AMOUNT, "Fixed donation amount must be greater than or equal to minimum donation amount");
        }

        Project memory newProject = Project({
            owner: msg.sender,
            title: _title,
            description: _description,
            goal: _goal,
            deadline: _deadlineTimestamp, // Usa o timestamp fornecido
            amountRaised: 0,
            completed: false,
            fixedDonationAmount: _fixedDonationAmount, // Define o modo de doação
            requiredDonationAmount: _requiredDonationAmount, // Define o valor fixo
            withdrawn: false // Inicializa como não sacado
        });

        projects.push(newProject);
        emit ProjectCreated(projects.length - 1, msg.sender, _title, _goal, newProject.deadline);
    }

    /**
     * @dev Permite que um usuário faça uma doação para um projeto.
     * @param _projectId O ID do projeto.
     */
    function donate(uint256 _projectId) external payable {
        require(_projectId < projects.length, "Invalid project ID");
        Project storage project = projects[_projectId];

        require(block.timestamp < project.deadline, "Deadline has passed");
        require(!project.completed, "Project already completed");
        require(!project.withdrawn, "Project funds have been withdrawn"); // Não pode doar se o saque já foi feito

        // Requisito de valor mínimo de doação para qualquer tipo de doação
        require(msg.value >= MIN_DONATION_AMOUNT, "Donation amount must be at least 0.001 Ether");

        // Verifica o modo de doação (livre ou fixo)
        if (project.fixedDonationAmount) {
            require(msg.value == project.requiredDonationAmount, "Must send exact fixed donation amount");
        }

        // Calcula a taxa de 0.25%
        uint256 feeAmount = (msg.value * FEE_PERCENTAGE_NUMERATOR) / FEE_PERCENTAGE_DENOMINATOR;
        // Calcula o valor que realmente vai para o projeto após a taxa (VALOR LÍQUIDO)
        uint256 amountForProject = msg.value - feeAmount;

        // Transfere a taxa para a carteira de taxas, se a taxa for maior que zero.
        if (feeAmount > 0) {
            (bool successFee, ) = payable(feeWallet).call{value: feeAmount}("");
            require(successFee, "Failed to send fee to fee wallet");
            emit FeePaid(_projectId, msg.sender, feeAmount, feeWallet);
        }

        // Adiciona o doador à lista de doadores do projeto, se ainda não estiver lá
        bool donorExists = false;
        for (uint i = 0; i < projectDonors[_projectId].length; i++) {
            if (projectDonors[_projectId][i] == msg.sender) {
                donorExists = true;
                break;
            }
        }
        if (!donorExists) {
            projectDonors[_projectId].push(msg.sender);
        }

        // Atualiza o valor arrecadado do projeto com o montante *líquido* (após a taxa)
        project.amountRaised += amountForProject;
        // O mapeamento donations ainda armazena o valor *total/bruto* que o doador enviou
        donations[_projectId][msg.sender] += msg.value;

        emit DonationReceived(_projectId, msg.sender, msg.value);

        // Se a meta for alcançada, marca o projeto como completo (o saque é manual via withdrawFunds)
        if (project.amountRaised >= project.goal) {
            project.completed = true;
        }
    }

    /**
     * @dev Permite que o proprietário do projeto saque os fundos arrecadados
     *      uma vez que a meta foi atingida.
     *      Só pode ser chamado pelo proprietário do projeto e apenas uma vez.
     * @param _projectId O ID do projeto.
     */
    function withdrawFunds(uint256 _projectId) external {
        require(_projectId < projects.length, "Invalid project ID");
        Project storage project = projects[_projectId];

        require(msg.sender == project.owner, "Only project owner can withdraw funds");
        require(project.completed, "Project goal has not been met yet"); // Só saca se a meta foi batida
        require(project.amountRaised > 0, "No funds to withdraw"); // Garante que há algo para sacar
        require(!project.withdrawn, "Funds have already been withdrawn for this project");

        // Marca o projeto como "sacado" para evitar múltiplos saques
        project.withdrawn = true;

        // Transfere o valor arrecadado (líquido) para o proprietário do projeto
        (bool success, ) = payable(project.owner).call{value: project.amountRaised}("");
        require(success, "Failed to send funds to project owner");

        // Emite o evento de saque
        emit FundsWithdrawn(_projectId, project.owner, project.amountRaised);
    }

    /**
     * @dev Permite que um doador individual resgate o valor líquido de sua doação
     *      se o projeto falhou (não atingiu a meta no prazo).
     * @param _projectId O ID do projeto.
     */
    function claimRefund(uint256 _projectId) external {
        require(_projectId < projects.length, "Invalid project ID");
        Project storage project = projects[_projectId];

        // Garante que o projeto falhou e é elegível para reembolso
        require(block.timestamp >= project.deadline, "Deadline has not been reached yet.");
        require(!project.completed, "Project goal already met, no refund needed."); // Meta não batida
        require(project.amountRaised < project.goal, "Project goal met, not eligible for refund."); // Dupla verificação da meta
        require(!project.withdrawn, "Funds were already withdrawn by owner, no refund possible."); // Dono não sacou

        // Verifica se o chamador realmente doou para este projeto e ainda não resgatou
        uint256 grossDonation = donations[_projectId][msg.sender];
        require(grossDonation > 0, "No donation found for this address or already refunded.");

        // Calcula o valor líquido a ser reembolsado (doação bruta menos a taxa que foi para a feeWallet)
        uint256 feeOnGrossDonation = (grossDonation * FEE_PERCENTAGE_NUMERATOR) / FEE_PERCENTAGE_DENOMINATOR;
        uint256 netRefundAmount = grossDonation - feeOnGrossDonation;

        require(netRefundAmount > 0, "Net refund amount is zero or less."); // Garante que há algo para reembolsar
        // Garante que o contrato ainda possui fundos suficientes do projeto para este reembolso específico.
        // project.amountRaised representa o pool de fundos líquidos ainda no contrato.
        require(project.amountRaised >= netRefundAmount, "Insufficient project funds for this refund.");

        // Marca a doação como reembolsada definindo-a como 0 para prevenir múltiplos saques
        donations[_projectId][msg.sender] = 0;

        // Deduz o valor reembolsado do total arrecadado do projeto (do pool de fundos)
        project.amountRaised -= netRefundAmount;

        // Transfere os fundos para o doador
        (bool success, ) = payable(msg.sender).call{value: netRefundAmount}("");
        require(success, "Failed to send refund to donor");

        emit RefundClaimed(_projectId, msg.sender, netRefundAmount);
    }

    /**
     * @dev Retorna o número total de projetos.
     */
    function getProjectsCount() external view returns (uint256) {
        return projects.length;
    }

    /**
     * @dev Retorna os detalhes de um projeto específico.
     * @param _projectId O ID do projeto.
     */
    function getProject(uint256 _projectId) external view returns (Project memory) {
        require(_projectId < projects.length, "Invalid project ID");
        return projects[_projectId];
    }

    /**
     * @dev Retorna o valor total BRUTO doado por um doador específico para um projeto.
     *      Retorna 0 se já reembolsado individualmente.
     * @param _projectId O ID do projeto.
     * @param _donor O endereço do doador.
     */
    function getDonation(uint256 _projectId, address _donor) external view returns (uint256) {
        return donations[_projectId][_donor];
    }

    /**
     * @dev Retorna todos os endereços de doadores e seus respectivos valores totais (brutos) doados para um projeto específico.
     *      Note que os valores podem ser 0 se o doador já tiver resgatado seu reembolso.
     * @param _projectId O ID do projeto.
     * @return addresses_ Array de endereços dos doadores.
     * @return amounts_ Array de valores totais doados por cada doador (em Wei), correspondendo ao índice em addresses_.
     */
     function getProjectDonorsWithAmounts(uint256 _projectId) external view returns (address[] memory addresses_, uint256[] memory amounts_) {
        require(_projectId < projects.length, "Invalid project ID");
        address[] storage projectSpecificDonors = projectDonors[_projectId];
        
        addresses_ = new address[](projectSpecificDonors.length);
        amounts_ = new uint256[](projectSpecificDonors.length);

        for (uint256 i = 0; i < projectSpecificDonors.length; i++) {
            address donorAddress = projectSpecificDonors[i];
            amounts_[i] = donations[_projectId][donorAddress]; // Retornará 0 se já foi reembolsado individualmente
            addresses_[i] = donorAddress;
        }
        return (addresses_, amounts_);
    }

    /**
     * @dev Retorna uma lista de todos os projetos.
     */
    function getAllProjects() public view returns (Project[] memory) {
        Project[] memory allProjects = new Project[](projects.length);
        for (uint256 i = 0; i < projects.length; i++) {
            allProjects[i] = projects[i];
        }
        return allProjects;
    }
}