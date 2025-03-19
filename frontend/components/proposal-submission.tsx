"use client";

import { useState } from "react";
import { useVoting } from "@/context/voting-context";

export default function ProposalSubmission() {
  const { isRegistered, proposals, addProposal, hasProposed, canPropose } = useVoting();
  const [newProposal, setNewProposal] = useState("");

  const handleSubmitProposal = async () => {
    if (!newProposal.trim()) return;
    if (!canPropose) {
      alert("Vous n'êtes pas autorisé à proposer.");
      return;
    }
    await addProposal(newProposal.trim());
    setNewProposal("");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Soumission de propositions</h2>
      {!isRegistered ? (
        <p>Vous devez être inscrit pour soumettre une proposition.</p>
      ) : hasProposed ? (
        <p>Vous avez déjà soumis une proposition.</p>
      ) : (
        <div>
          <input
            type="text"
            value={newProposal}
            onChange={(e) => setNewProposal(e.target.value)}
            placeholder="Description de la proposition"
            className="border p-2 w-full"
          />
          <button
            onClick={handleSubmitProposal}
            className="bg-blue-500 text-white px-4 py-2 mt-2"
          >
            Soumettre
          </button>
        </div>
      )}

      <h3 className="text-lg font-medium mt-6">Propositions actuelles ({proposals.length})</h3>
      {proposals.length > 0 ? (
        <ul className="space-y-3">
          {proposals.map((proposal) => (
            <li key={proposal.id} className="border p-2">
              <strong>{proposal.description}</strong> (Proposé par : {proposal.proposer})
            </li>
          ))}
        </ul>
      ) : (
        <p>Aucune proposition pour le moment.</p>
      )}
    </div>
  );
}