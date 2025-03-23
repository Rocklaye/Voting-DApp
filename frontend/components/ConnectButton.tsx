import { useState } from "react";
import { Web3Provider } from "ethers"; // Importation correcte
import { Button, Alert } from "react-bootstrap";
import { FaWallet, FaSignOutAlt } from "react-icons/fa";

interface ConnectButtonProps {
  provider: Web3Provider | null;
  setProvider: (provider: Web3Provider) => void;
  setSigner: (signer: any) => void;
  setAccount: (account: string) => void;
  setContract: (contract: any) => void;
  contractAddress: string;
  contractABI: any;
  account: string;
}

export function ConnectButton({
  provider,
  setProvider,
  setSigner,
  setAccount,
  setContract,
  contractAddress,
  contractABI,
  account
}: ConnectButtonProps) {
  const [error, setError] = useState<string>("");

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        setError(""); // Réinitialiser l'erreur
        const provider = new Web3Provider(window.ethereum); // Utilisation correcte avec Web3Provider
        setProvider(provider);
        
        await window.ethereum.request({ method: "eth_requestAccounts" }); // Demander l'accès aux comptes
        
        const signer = provider.getSigner(); // Obtenir le signer
        setSigner(signer);
        
        const userAddress = await signer.getAddress(); // Récupérer l'adresse de l'utilisateur
        setAccount(userAddress);
        
        const contract = new ethers.Contract(contractAddress, contractABI, signer); // Initialiser le contrat
        setContract(contract);
      } catch (error) {
        console.error("Error connecting wallet:", error);
        setError("Failed to connect wallet. Please try again.");
      }
    } else {
      setError("MetaMask is not installed. Please install MetaMask to use this application.");
    }
  };

  const disconnectWallet = () => {
    setAccount("");
    setSigner(null);
    setContract(null);
  };

  return (
    <div className="w-100">
      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}
      
      {!account ? (
        <Button 
          onClick={connectWallet} 
          variant="primary"
          className="w-100 d-flex align-items-center justify-content-center gap-2"
        >
          <FaWallet /> Connect Wallet
        </Button>
      ) : (
        <Button 
          onClick={disconnectWallet} 
          variant="outline-secondary" 
          className="w-100 d-flex align-items-center justify-content-center gap-2"
        >
          <FaSignOutAlt /> Disconnect Wallet
        </Button>
      )}
    </div>
  );
}
