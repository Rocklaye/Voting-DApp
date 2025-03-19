"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useVoting } from "@/context/voting-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function ProposalSubmission() {
  const { isRegistered, votingState, proposals, addProposal, hasProposed, canPropose } = useVoting()

  const [newProposal, setNewProposal] = useState("")

  const handleSubmitProposal = () => {
    if (newProposal.trim() && canPropose) {
      addProposal(newProposal.trim())
      setNewProposal("")
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Soumission de propositions</CardTitle>
          <CardDescription>
            {votingState.proposalSessionOpen
              ? "La phase d'enregistrement des propositions est ouverte"
              : "La phase d'enregistrement des propositions est fermée"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isRegistered ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Non inscrit</AlertTitle>
              <AlertDescription>
                Vous devez être inscrit sur la liste blanche pour soumettre une proposition.
              </AlertDescription>
            </Alert>
          ) : !votingState.proposalSessionOpen ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Session fermée</AlertTitle>
              <AlertDescription>
                La session d'enregistrement des propositions n'est pas active actuellement.
              </AlertDescription>
            </Alert>
          ) : hasProposed ? (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>Proposition soumise</AlertTitle>
              <AlertDescription>
                Vous avez déjà soumis une proposition. Chaque électeur ne peut soumettre qu'une seule proposition.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Soumettre une proposition</h3>
                <Textarea
                  placeholder="Décrivez votre proposition..."
                  value={newProposal}
                  onChange={(e) => setNewProposal(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button onClick={handleSubmitProposal} disabled={!newProposal.trim() || !canPropose} className="mt-2">
                  Soumettre
                </Button>
              </div>
            </div>
          )}

          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-medium">Propositions actuelles ({proposals.length})</h3>
            {proposals.length > 0 ? (
              <ul className="space-y-3">
                {proposals.map((proposal) => (
                  <li key={proposal.id} className="p-3 bg-muted rounded-md">
                    <p className="font-medium">Proposition #{proposal.id + 1}</p>
                    <p className="mt-1">{proposal.description}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Proposé par: {proposal.proposer.substring(0, 6)}...
                      {proposal.proposer.substring(proposal.proposer.length - 4)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Aucune proposition n'a été soumise</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

