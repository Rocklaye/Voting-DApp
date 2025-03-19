"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import VotingABI from "@/lib/VotingABI.json"; // ABI du contrat

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Adresse du contrat déployé

const VotingContext = createContext(null);

export const VotingProvider = ({ children }: { children: React.ReactNode }) => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [votingState, setVotingState] = useState<any>({}); // État global du vote

  // Connexion au portefeuille
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Veuillez installer MetaMask !");
      return;
    }
    const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await web3Provider.send("eth_requestAccounts", []);
    setProvider(web3Provider);
    setCurrentAccount(accounts[0]);
  };

  // Charger le contrat
  const loadContract = async () => {
    if (!provider) return;
    const signer = provider.getSigner();
    const votingContract = new ethers.Contract(CONTRACT_ADDRESS, VotingABI, signer);
    setContract(votingContract);

    // Charger l'état initial du contrat
    const status = await votingContract.status();
    setVotingState({ status });
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
      }}
    >
      {children}
    </VotingContext.Provider>
  );
};

export const useVoting = () => useContext(VotingContext);