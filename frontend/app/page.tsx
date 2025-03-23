"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Container, Row, Col, Card, Spinner, Alert } from "react-bootstrap";
import { ConnectButton } from "../components/ConnectButton";
import { AdminPanel } from "../components/AdminPanel";
import { VoterPanel } from "../components/VoterPanel";
import { ResultsPanel } from "../components/ResultsPanel";
import type { WorkflowStatus } from "../lib/types";
import contractABI from "../lib/contract-abi.json";

console.log('ABI:', contractABI);

export default function Home() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [account, setAccount] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isVoter, setIsVoter] = useState<boolean>(false);
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Contract address - replace with your deployed contract address
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  // This should be the address of the admin/owner of the contract
  const adminAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

  // Optional: List of voter addresses if you know them in advance
  const voterAddresses: string[] = [
    // Add known voter addresses here
    // "0x123...",
    // "0x456...",
  ];

  // Initializing the provider and contract, only when the component mounts
  useEffect(() => {
    const init = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(provider);

          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            const signer = await provider.getSigner();
            setSigner(signer);

            const userAddress = await signer.getAddress();
            setAccount(userAddress);

            // Vérifie si contractABI.abi existe et si c'est un tableau
            if (contractABI && Array.isArray(contractABI.abi)) {
              const contractInstance = new ethers.Contract(contractAddress, contractABI.abi, signer);
              setContract(contractInstance);

              // Vérification du rôle Admin et Voter après l'initialisation du contrat
              const owner = await contractInstance.owner();
              setIsAdmin(userAddress.toLowerCase() === owner.toLowerCase());

              let voterStatus = false;
              if (typeof contractInstance.voters === 'function') {
                const voter = await contractInstance.voters(userAddress);
                voterStatus = voter.isRegistered;
              } else {
                voterStatus = voterAddresses.some(
                  addr => addr.toLowerCase() === userAddress.toLowerCase()
                );
              }
              setIsVoter(voterStatus);

              const status = await contractInstance.status();
              setWorkflowStatus(Number(status));
            } else {
              throw new Error("ABI is not an array");
            }
          }
        } catch (error) {
          console.error("Erreur lors de l'initialisation :", error);
          setError("Erreur de connexion au contrat ou dans l'initialisation.");
        }
      } else {
        setError("MetaMask n'est pas installé. Veuillez l'installer pour utiliser cette application.");
      }
      setLoading(false);
    };

    init();
  }, []); // Utilisation d'un tableau vide pour lancer l'effet une seule fois

  // Setup event listeners for MetaMask
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        window.location.reload();
      });

      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }

    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeAllListeners();
      }
    };
  }, []); // Use an empty dependency array to only run this effect once on mount

  // Listen for contract events
  useEffect(() => {
    if (contract) {
      const setupEventListeners = async () => {
        try {
          contract.on("WorkflowStatusChange", (previousStatus, newStatus, event) => {
            console.log("Status changed:", previousStatus, newStatus, event);
            setWorkflowStatus(Number(newStatus));
          });
        } catch (error) {
          console.error("Error setting up event listeners:", error);
        }
      };

      setupEventListeners();

      return () => {
        contract.removeAllListeners();
      };
    }
  }, [contract]); // Only depend on contract for this effect

  if (loading) {
    return (
      <Container className="d-flex min-vh-100 align-items-center justify-content-center">
        <div className="text-center">
          <h1 className="mb-4">Loading Voting DApp...</h1>
          <Spinner animation="border" variant="primary" />
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center mb-5">
        <Col xs={12} className="text-center">
          <h1 className="mb-4">Decentralized Voting Application</h1>
        </Col>
      </Row>

      {error && (
        <Row className="justify-content-center mb-4">
          <Col xs={12} md={8} lg={6}>
            <Alert variant="danger">
              <p className="mb-0">{error}</p>
            </Alert>
          </Col>
        </Row>
      )}

      <Row className="justify-content-center mb-4">
        <Col xs={12} md={8} lg={6}>
          <ConnectButton
            provider={provider}
            setProvider={setProvider}
            setSigner={setSigner}
            setAccount={setAccount}
            setContract={setContract}
            contractAddress={contractAddress}
            contractABI={contractABI}
            account={account}
          />
        </Col>
      </Row>

      {account && !error && (
        <>
          <Row className="justify-content-center mb-4">
            <Col xs={12} md={8} lg={6}>
              <Card className="bg-light">
                <Card.Body>
                  <p className="mb-1">
                    <strong>Connected Account:</strong> {account}
                  </p>
                  <p className="mb-1">
                    <strong>Role:</strong> {isAdmin ? "Admin" : isVoter ? "Voter" : "Observer"}
                  </p>
                  <p className="mb-0">
                    <strong>Current Status:</strong> {getWorkflowStatusText(workflowStatus)}
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {isAdmin && (
            <Row className="justify-content-center mb-4">
              <Col xs={12} md={8} lg={6}>
                <AdminPanel contract={contract} workflowStatus={workflowStatus} />
              </Col>
            </Row>
          )}

          {isVoter && (
            <Row className="justify-content-center mb-4">
              <Col xs={12} md={8} lg={6}>
                <VoterPanel contract={contract} workflowStatus={workflowStatus} account={account} />
              </Col>
            </Row>
          )}

          <Row className="justify-content-center">
            <Col xs={12} md={8} lg={6}>
              <ResultsPanel contract={contract} workflowStatus={workflowStatus} />
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
}

function getWorkflowStatusText(status: WorkflowStatus): string {
  switch (status) {
    case 0:
      return "Registering Voters";
    case 1:
      return "Proposals Registration Started";
    case 2:
      return "Proposals Registration Ended";
    case 3:
      return "Voting Session Started";
    case 4:
      return "Voting Session Ended";
    case 5:
      return "Votes Tallied";
    default:
      return "Unknown";
  }
}
