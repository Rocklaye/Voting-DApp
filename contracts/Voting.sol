// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Voting is Ownable {
   // address private _owner;

    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }

    struct Proposal {
        string description;
        uint voteCount;
    }

    // Enumération des différents états du vote
    enum WorkflowStatus {
        RegisteringVoters,           // Inscription des électeurs
        ProposalsRegistrationStarted, // Début de l'enregistrement des propositions
        ProposalsRegistrationEnded,   // Fin de l'enregistrement des propositions
        VotingSessionStarted,         // Début de la session de vote
        VotingSessionEnded,           // Fin de la session de vote
        VotesTallied                  // Comptage des votes terminé
    }

    WorkflowStatus public status; //Variable de l'etat actuel des votes
    
    mapping (address => Voter) public voters; // Liste des électeurs enregistrés (associés à leur adresse Ethereum)

    Proposal[] public proposals; //Liste des propositions enregistrees
    uint public winningProposalId; // ID de la proposition gagnante


    //Evenements
    event VoterRegistered(address voterAddress); 
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId);
    event Voted (address voter, uint proposalId);

    /* Modificateur qui restreint l'accès à l'admin
    modifier onlyOwner() {
        require(msg.sender == _owner, "Vous n'etes pas l'admin");
        _;
    }
    */

    //Modificateur qui restreind l'acces juste aux electeurs inscrits
    modifier onlyRegisteredVoter() {
        require(voters[msg.sender].isRegistered, "Vous n'etes pas inscrit");
        _;
    }

    //Constructeur du contrat
    constructor() Ownable(msg.sender) {
        status = WorkflowStatus.RegisteringVoters; // Initialise le workflow à l'état d'inscription des électeurs
    }

    // Fonction pour enregistrer un électeur (uniquement accessible par l'administrateur)
    function registerVoter(address _voter) external onlyOwner {
        require(status == WorkflowStatus.RegisteringVoters, "L'inscription des electeurs est fermee");
        require(!voters[_voter].isRegistered, "Electeur deja inscrit");

        voters[_voter] = Voter(true, false, 0); // Inscription de l'électeur
        emit VoterRegistered(_voter); // Émission d'un événement
    }

    // Fonction pour commencer l'enregistrement des électeurs
    function startVoterRegistration() external onlyOwner {
        require(status == WorkflowStatus.RegisteringVoters, "L'enregistrement des electeurs est deja commence");
        emit WorkflowStatusChange(status, WorkflowStatus.RegisteringVoters);
        status = WorkflowStatus.RegisteringVoters; // Transition vers la phase d'enregistrement des électeurs
    }

    // Fonction pour terminer l'enregistrement des électeurs
    function endVoterRegistration() external onlyOwner {
        require(status == WorkflowStatus.RegisteringVoters, "L'enregistrement des electeurs est deja termine");
        emit WorkflowStatusChange(status, WorkflowStatus.ProposalsRegistrationStarted);
        status = WorkflowStatus.ProposalsRegistrationStarted; // Transition vers la phase de propositions
    }

    // Fonction pour commencer l'enregistrement des propositions
    function startProposalsRegistration() external onlyOwner {
        require(status == WorkflowStatus.RegisteringVoters, "Mauvais etat du workflow");
        emit WorkflowStatusChange(status, WorkflowStatus.ProposalsRegistrationStarted);
        status = WorkflowStatus.ProposalsRegistrationStarted; // Mise à jour de l'état du vote
    }

    //  Fonction pour soumettre une proposition (seuls les électeurs inscrits peuvent proposer)
    function submitProposal(string calldata _description) external onlyRegisteredVoter {
        require(status == WorkflowStatus.ProposalsRegistrationStarted, "Enregistrement des propositions ferme");
        proposals.push(Proposal(_description, 0)); // Ajoute une nouvelle proposition avec 0 vote
        emit ProposalRegistered(proposals.length - 1); // Émission d'un événement avec l'ID de la proposition
    }

    //Fonction pour arrêter l'enregistrement des propositions
    function endProposalsRegistration() external onlyOwner {
        require(status == WorkflowStatus.ProposalsRegistrationStarted, "Mauvais etat du workflow");
        emit WorkflowStatusChange(status, WorkflowStatus.ProposalsRegistrationEnded);
        status = WorkflowStatus.ProposalsRegistrationEnded;
    }

    //  **Fonction pour commencer la session de vote**
    function startVotingSession() external onlyOwner {
        require(status == WorkflowStatus.ProposalsRegistrationEnded, "Mauvais etat du workflow");
        emit WorkflowStatusChange(status, WorkflowStatus.VotingSessionStarted);
        status = WorkflowStatus.VotingSessionStarted;
    }

     //  **Fonction pour voter pour une proposition(seuls les électeurs inscrits peuvent voter)
    function vote(uint _proposalId) external onlyRegisteredVoter {
        require(status == WorkflowStatus.VotingSessionStarted, "La session de vote n'est pas ouverte");
        require(!voters[msg.sender].hasVoted, "Vous avez deja vote");
        require(_proposalId < proposals.length, "ID de proposition invalide");

        voters[msg.sender].hasVoted = true; // Marque l'électeur comme ayant voté
        voters[msg.sender].votedProposalId = _proposalId; // Enregistre le vote
        proposals[_proposalId].voteCount++; // Incrémente le compteur de votes pour la proposition choisie

        emit Voted(msg.sender, _proposalId); // Émission d'un événement
    }

    //  *onction pour fermer la session de vote
    function endVotingSession() external onlyOwner {
        require(status == WorkflowStatus.VotingSessionStarted, "Mauvais etat du workflow");
        emit WorkflowStatusChange(status, WorkflowStatus.VotingSessionEnded);
        status = WorkflowStatus.VotingSessionEnded;
    }

     //  **Fonction pour comptabiliser les votes et déterminer le gagnant**
    function tallyVotes() external onlyOwner {
        require(status == WorkflowStatus.VotingSessionEnded, "Les votes ne sont pas encore clos");

        uint winningVoteCount = 0; // Initialisation du nombre de votes maximum

        // Parcourt toutes les propositions pour trouver celle avec le plus de votes
        for (uint i = 0; i < proposals.length; i++) {
            if (proposals[i].voteCount > winningVoteCount) {
                winningVoteCount = proposals[i].voteCount;
                winningProposalId = i;
            }
        }

        emit WorkflowStatusChange(status, WorkflowStatus.VotesTallied); // Émission d'un événement
        status = WorkflowStatus.VotesTallied; // Mise à jour du statut du vote
    }

    //  **Fonction pour récupérer la proposition gagnante**
    function getWinner() external view returns (string memory) {
        require(status == WorkflowStatus.VotesTallied, "Le vote n'a pas encore ete comptabilise");
        return proposals[winningProposalId].description; // Retourne la description de la proposition gagnante
    }
    
}
