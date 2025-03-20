"use client";

declare global {
  interface Window {
    ethereum?: any;
  }
}

import { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import { Web3Provider } from "@ethersproject/providers";
import VotingABI from "@/lib/VotingABI.json";

const CONTRACT_ADDRESS =  "0x5FbDB2315678afecb367f032d93F642f64180aa3";

type Proposal = {
  id: number;
  description: string;
  proposer: string;
};

type VotingContextType = {
  connectWallet: () => Promise<void>;
  currentAccount: string | null;
  contract: ethers.Contract | null;
  votingState: any;
  isRegistered: boolean;
  isAdmin: boolean; // Ajout de isAdmin
  proposals: Proposal[];
  loadProposals: () => Promise<void>;
  addProposal: (description: string) => Promise<void>;
  hasProposed: boolean;
  canPropose: boolean;
};

const VotingContext = createContext<VotingContextType | null>(null);

export const VotingProvider = ({ children }: { children: React.ReactNode }) => {
  const [provider, setProvider] = useState<Web3Provider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [votingState, setVotingState] = useState<any>({});
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false); // État pour vérifier si l'utilisateur est admin
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [hasProposed, setHasProposed] = useState<boolean>(false);
  const [canPropose, setCanPropose] = useState<boolean>(false);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Veuillez installer MetaMask !");
      return;
    }
    const web3Provider = new Web3Provider(window.ethereum);
    const accounts = await web3Provider.send("eth_requestAccounts", []);
    setProvider(web3Provider);
    setCurrentAccount(accounts[0]);
  };

  const loadContract = async () => {
    if (!provider) return;
    const signer = provider.getSigner();
    const votingContract = new ethers.Contract(CONTRACT_ADDRESS, VotingABI.abi, signer);
    setContract(votingContract);

    const status = await votingContract.status();
    setVotingState({ status });

    // Vérifiez si l'utilisateur actuel est enregistré
    const account = await signer.getAddress();
    const registered = await votingContract.voters(account).then((voter: any) => voter.isRegistered);
    setIsRegistered(registered);

    // Vérifiez si l'utilisateur est l'administrateur
    const owner = await votingContract.owner(); // Méthode Solidity pour obtenir l'owner
    setIsAdmin(owner.toLowerCase() === account.toLowerCase());

    // Vérifiez si l'utilisateur a déjà proposé
    const proposed = await votingContract.voters(account).then((voter: any) => voter.hasProposed);
    setHasProposed(proposed);

    // Vérifiez si l'utilisateur peut proposer
    const canProposeNow = registered && status === "ProposalsRegistrationStarted"; // Exemple de statut
    setCanPropose(canProposeNow);
  };

  const loadProposals = async () => {
    if (!contract) return;
    const proposalCount = await contract.getProposalCount(); // Exemple : méthode Solidity pour obtenir le nombre de propositions
    const loadedProposals: Proposal[] = [];
    for (let i = 0; i < proposalCount; i++) {
      const proposal = await contract.getProposal(i); // Exemple : méthode Solidity pour obtenir une proposition
      loadedProposals.push({
        id: i,
        description: proposal.description,
        proposer: proposal.proposer,
      });
    }
    setProposals(loadedProposals);
  };

  const addProposal = async (description: string) => {
    if (!contract) return;
    try {
      const tx = await contract.addProposal(description); // Exemple : méthode Solidity pour ajouter une proposition
      await tx.wait();
      await loadProposals(); // Rechargez les propositions après l'ajout
      setHasProposed(true); // Marquez l'utilisateur comme ayant proposé
    } catch (error) {
      console.error("Erreur lors de l'ajout de la proposition :", error);
    }
  };

  useEffect(() => {
    if (provider) {
      loadContract();
    }
  }, [provider]);

  return (
    <VotingContext.Provider
      value={{
        connectWallet,
        currentAccount,
        contract,
        votingState,
        isRegistered,
        isAdmin, // Ajout de isAdmin dans le contexte
        proposals,
        loadProposals,
        addProposal,
        hasProposed,
        canPropose,
      }}
    >
      {children}
    </VotingContext.Provider>
  );
};

export const useVoting = () => {
  const context = useContext(VotingContext);
  if (!context) {
    throw new Error("useVoting must be used within a VotingProvider");
  }
  return context;
};