"use client";

import { useState } from "react";
import { useVoting } from "@/context/voting-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function VoterRegistration() {
  const { contract, currentAccount, connectWallet } = useVoting();
  const [voterAddress, setVoterAddress] = useState("");

  const registerVoter = async () => {
    if (!contract) return;
    try {
      const tx = await contract.registerVoter(voterAddress);
      await tx.wait();
      alert("Électeur inscrit avec succès !");
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'inscription de l'électeur.");
    }
  };

  return (
    <div>
      <h2>Inscription des électeurs</h2>
      {!currentAccount ? (
        <Button onClick={connectWallet}>Connecter le portefeuille</Button>
      ) : (
        <div>
          <Input
            placeholder="Adresse de l'électeur"
            value={voterAddress}
            onChange={(e) => setVoterAddress(e.target.value)}
          />
          <Button onClick={registerVoter}>Inscrire</Button>
        </div>
      )}
    </div>
  );
}