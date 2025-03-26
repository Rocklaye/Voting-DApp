import { ethers } from "ethers";
import votingAbi from "./abis/Voting.json"; // Importez l'ABI depuis Voting.json

let provider, signer, contract;
const votingContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Remplacez par l'adresse correcte

// Utilisez l'ABI importée
const votingAbiArray = votingAbi.abi;

// Sélection des boutons
const connectWalletButton = document.getElementById("connectWalletButton");
const getWorkflowStatusButton = document.getElementById("getWorkflowStatusButton");
const registerVoterButton = document.getElementById("registerVoterButton");
const startProposalsRegistrationButton = document.getElementById("startProposalsRegistrationButton");
const endProposalsRegistrationButton = document.getElementById("endProposalsRegistrationButton");
const startVotingButton = document.getElementById("startVotingButton");
const endVotingSessionButton = document.getElementById("endVotingSessionButton");
const tallyVotesButton = document.getElementById("tallyVotesButton");
const submitProposalButton = document.getElementById("submitProposalButton");
const voteButton = document.getElementById("voteButton");
const getWinnerButton = document.getElementById("getWinnerButton");

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM complètement chargé et analysé.");

    // Attacher les événements aux boutons
    connectWalletButton?.addEventListener("click", connectWallet);
    getWorkflowStatusButton?.addEventListener("click", getWorkflowStatus);
    registerVoterButton?.addEventListener("click", registerVoter);
    startProposalsRegistrationButton?.addEventListener("click", startProposalsRegistration);
    endProposalsRegistrationButton?.addEventListener("click", endProposalsRegistration);
    startVotingButton?.addEventListener("click", startVotingSession);
    endVotingSessionButton?.addEventListener("click", endVotingSession);
    tallyVotesButton?.addEventListener("click", tallyVotes);
    submitProposalButton?.addEventListener("click", submitProposal);
    voteButton?.addEventListener("click", vote);
    getWinnerButton?.addEventListener("click", getWinner);
});

/*
// Événements
connectWalletButton?.addEventListener("click", connectWallet);
getWorkflowStatusButton?.addEventListener("click", getWorkflowStatus);
registerVoterButton?.addEventListener("click", registerVoter);
startProposalsRegistrationButton?.addEventListener("click", startProposalsRegistration);
endProposalsRegistrationButton?.addEventListener("click", endProposalsRegistration);
startVotingButton?.addEventListener("click", startVotingSession);
endVotingSessionButton?.addEventListener("click", endVotingSession);
tallyVotesButton?.addEventListener("click", tallyVotes);
submitProposalButton?.addEventListener("click", submitProposal);
voteButton?.addEventListener("click", vote);
getWinnerButton?.addEventListener("click", getWinner);
*/

//
// Étape 1 : Connexion au portefeuille
//

async function connectWallet() {
    if (!window.ethereum) {
        alert("Veuillez installer MetaMask !");
        return;
    }

    try {
        provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        signer = await provider.getSigner();
        contract = new ethers.Contract(votingContractAddress, votingAbiArray, signer);

        alert(`Portefeuille connecté : ${accounts[0]}`);
        await syncWorkflow(); // Appeler syncWorkflow après l'initialisation du contrat
    } catch (error) {
        console.error("Erreur de connexion :", error);
        alert("Erreur : " + error.message);
    }
}
//
// Étape 2 : Gestion du workflow
//

async function getWorkflowStatus() {
    try {
        const status = await contract.status(); // Récupère l'état actuel du workflow
        const statuses = [
            "Registering Voters",
            "Proposals Registration Started",
            "Proposals Registration Ended",
            "Voting Session Started",
            "Voting Session Ended",
            "Votes Tallied"
        ];
        alert("État actuel du workflow : " + statuses[status]);
        console.log("État actuel du workflow :", statuses[status]);
    } catch (error) {
        console.error("Erreur lors de la récupération de l'état du workflow :", error);
        alert("Erreur : " + (error.reason || error.message));
    }
}

async function syncWorkflow() {
    try {
        if (!contract) {
            console.error("Le contrat n'est pas initialisé.");
            return;
        }

        const status = Number(await contract.status()); // Convertir BigInt en entier
        const isAdmin = await isAdminUser(); // Vérifie si l'utilisateur est administrateur

        console.log("État du workflow :", status);
        console.log("L'utilisateur est administrateur :", isAdmin);

        // Masquer toutes les actions par défaut
        document.querySelectorAll(".admin-action").forEach((btn) => {
            btn.style.display = "none";
        });
        document.querySelectorAll(".voter-action").forEach((btn) => {
            btn.style.display = "none";
        });

        // Afficher les actions en fonction de l'état du workflow
        if (isAdmin) {
            if (status === 0) {
                document.getElementById("registerVoterButton").style.display = "block";
                document.getElementById("startProposalsRegistrationButton").style.display = "block";
            } else if (status === 1) {
                document.getElementById("endProposalsRegistrationButton").style.display = "block";
                await fetchProposals(); // Affiche les propositions
            } else if (status === 2) {
                document.getElementById("startVotingButton").style.display = "block";
            } else if (status === 3) {
                document.getElementById("endVotingSessionButton").style.display = "block";
            } else if (status === 4) {
                document.getElementById("tallyVotesButton").style.display = "block";
            } else if (status === 5) {
                document.getElementById("getWinnerButton").style.display = "block"; // Affiche le bouton "Get Winner"
            }
        } else {
            if (status === 1) {
                document.getElementById("submitProposalButton").style.display = "block";
            } else if (status === 3) {
                document.getElementById("voteButton").style.display = "block";
            }
        }
    } catch (error) {
        console.error("Erreur lors de la synchronisation du workflow :", error);
    }
}

async function isAdminUser() {
    try {
        const owner = await contract.owner(); // Adresse de l'administrateur
        const userAddress = await signer.getAddress(); // Adresse de l'utilisateur connecté
        console.log("Adresse de l'administrateur :", owner);
        console.log("Adresse de l'utilisateur connecté :", userAddress);
        return owner.toLowerCase() === userAddress.toLowerCase(); // Vérifie si l'utilisateur est l'administrateur
    } catch (error) {
        console.error("Erreur lors de la vérification de l'administrateur :", error);
        return false;
    }
}

//
// Étape 3 : Actions administratives
//

async function registerVoter() {
    const voterAddress = prompt("Entrez l'adresse Ethereum de l'électeur à inscrire :");
    if (!voterAddress) return;

    try {
        const tx = await contract.registerVoter(voterAddress);
        await tx.wait();
        alert(`Électeur ${voterAddress} enregistré avec succès !`);
    } catch (error) {
        console.error("Erreur lors de l'enregistrement de l'électeur :", error);
        alert("Erreur : " + (error.reason || error.message));
    }
}

async function startProposalsRegistration() {
    try {
        const tx = await contract.startProposalsRegistration();
        await tx.wait();
        alert("Enregistrement des propositions commencé !");
        await syncWorkflow();
    } catch (error) {
        console.error("Erreur :", error);
        alert("Erreur : " + (error.reason || error.message));
    }
}

async function endProposalsRegistration() {
    try {
        const tx = await contract.endProposalsRegistration();
        await tx.wait();
        alert("Enregistrement des propositions terminé !");
        await syncWorkflow();
    } catch (error) {
        console.error("Erreur :", error);
        alert(error.message);
    }
}

async function startVotingSession() {
    try {
        const tx = await contract.startVotingSession();
        await tx.wait();
        alert("Session de vote commencée !");
        await syncWorkflow();
    } catch (error) {
        console.error("Erreur :", error);
        alert(error.message);
    }
}

async function endVotingSession() {
    try {
        const tx = await contract.endVotingSession();
        await tx.wait();
        alert("Session de vote terminée !");
        await syncWorkflow();
    } catch (error) {
        console.error("Erreur :", error);
        alert(error.message);
    }
}

async function tallyVotes() {
    try {
        const tx = await contract.tallyVotes();
        await tx.wait();
        alert("Votes comptabilisés !");
        await syncWorkflow(); // Met à jour l'état du workflow
    } catch (error) {
        console.error("Erreur :", error);
        alert(error.message);
    }
}

//
// Étape 4 : Actions des électeurs
//

async function submitProposal() {
    const description = prompt("Entrez la description de votre idée ou projet :");
    if (!description) return;

    try {
        const tx = await contract.submitProposal(description); // Appelle la fonction du contrat
        await tx.wait();
        alert("Proposition soumise avec succès !");
        await fetchProposals(); // Met à jour la liste des propositions
    } catch (error) {
        console.error("Erreur lors de la soumission de la proposition :", error);
        alert("Erreur : " + (error.reason || error.message));
    }
}

async function fetchProposals() {
    try {
        if (!contract) {
            alert("Veuillez connecter votre portefeuille avant de continuer.");
            return;
        }

        const proposalsContainer = document.getElementById("proposalsContainer");
        if (!proposalsContainer) {
            console.warn("Le conteneur des propositions n'existe pas.");
            return; // Arrête l'exécution si le conteneur n'existe pas
        }

        const proposals = await contract.getProposals(); // Récupère les propositions depuis le contrat
        proposalsContainer.innerHTML = ""; // Réinitialise le contenu

        proposals.forEach((proposal, index) => {
            const proposalElement = document.createElement("div");
            proposalElement.className = "proposal";
            proposalElement.innerHTML = `
                <h3>Proposition ${index + 1}</h3>
                <p><strong>ID :</strong> ${index}</p>
                <p><strong>Description :</strong> ${proposal.description}</p>
                <p><strong>Votes :</strong> ${proposal.voteCount}</p>
            `;
            proposalsContainer.appendChild(proposalElement);
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des propositions :", error);
        alert("Erreur : " + (error.reason || error.message));
    }
}


async function vote() {
    try {
        if (!contract) {
            alert("Veuillez connecter votre portefeuille avant de continuer.");
            return;
        }

        const proposals = await contract.getProposals(); // Récupère les propositions
        let message = "Propositions disponibles :\n";
        proposals.forEach((proposal, index) => {
            message += `${index}: ${proposal.description} (Votes : ${proposal.voteCount})\n`;
        });

        const proposalId = prompt(message + "\nEntrez l'ID de la proposition pour voter :");
        if (proposalId === null || isNaN(proposalId)) return;

        const tx = await contract.vote(parseInt(proposalId));
        await tx.wait();
        alert("Vote enregistré !");
        await fetchProposals(); // Met à jour la liste des propositions
    } catch (error) {
        console.error("Erreur lors du vote :", error);
        alert(error.message);
    }
}

//
// Étape 5 : Résultat final
//
async function getWinner() {
    try {
        const description = await contract.getWinner(); // Récupère uniquement la description du gagnant
        alert(`Le projet gagnant est : "${description}"`);
    } catch (error) {
        console.error("Erreur lors de la récupération du gagnant :", error);
        alert("Erreur : " + error.message);
    }
}