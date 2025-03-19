"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useVoting } from "@/context/voting-context"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function AdminPanel() {
  const {
    isAdmin,
    addVoter,
    voters,
    removeVoter,
    votingState,
    startProposalRegistration,
    endProposalRegistration,
    startVotingSession,
    endVotingSession,
    tallyVotes,
    proposals,
  } = useVoting()

  const [newVoterAddress, setNewVoterAddress] = useState("")

  if (!isAdmin) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Accès refusé</AlertTitle>
        <AlertDescription>Vous n'avez pas les droits d'administrateur pour accéder à cette section.</AlertDescription>
      </Alert>
    )
  }

  const handleAddVoter = () => {
    if (newVoterAddress.trim()) {
      addVoter(newVoterAddress.trim())
      setNewVoterAddress("")
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Panneau d'administration</CardTitle>
          <CardDescription>Gérez le processus de vote</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex flex-col gap-2">
              <Badge variant={votingState.registrationOpen ? "default" : "outline"}>Inscription des électeurs</Badge>
              <Badge variant={votingState.proposalSessionOpen ? "default" : "outline"}>
                Enregistrement des propositions
              </Badge>
            </div>
            <div className="flex flex-col gap-2">
              <Badge variant={votingState.votingSessionOpen ? "default" : "outline"}>Session de vote</Badge>
              <Badge variant={votingState.votingEnded ? "default" : "outline"}>Vote terminé</Badge>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Gestion des phases</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={startProposalRegistration}
                  disabled={!votingState.registrationOpen || Object.keys(voters).length === 0}
                >
                  Démarrer l'enregistrement des propositions
                </Button>
                <Button onClick={endProposalRegistration} disabled={!votingState.proposalSessionOpen}>
                  Terminer l'enregistrement des propositions
                </Button>
                <Button
                  onClick={startVotingSession}
                  disabled={votingState.proposalSessionOpen || votingState.votingSessionOpen || proposals.length === 0}
                >
                  Démarrer la session de vote
                </Button>
                <Button onClick={endVotingSession} disabled={!votingState.votingSessionOpen}>
                  Terminer la session de vote
                </Button>
                <Button
                  onClick={tallyVotes}
                  disabled={!votingState.votingEnded || votingState.winningProposalId !== null}
                >
                  Comptabiliser les votes
                </Button>
              </div>
            </div>

            {votingState.registrationOpen && (
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Liste blanche des électeurs</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Adresse de l'électeur"
                    value={newVoterAddress}
                    onChange={(e) => setNewVoterAddress(e.target.value)}
                  />
                  <Button onClick={handleAddVoter}>Ajouter</Button>
                </div>

                <div className="mt-4 space-y-2">
                  <h4 className="font-medium">Électeurs inscrits ({Object.keys(voters).length})</h4>
                  {Object.keys(voters).length > 0 ? (
                    <ul className="space-y-2">
                      {Object.values(voters).map((voter) => (
                        <li key={voter.address} className="flex justify-between items-center p-2 bg-muted rounded-md">
                          <span className="truncate">{voter.address}</span>
                          <Button variant="destructive" size="sm" onClick={() => removeVoter(voter.address)}>
                            Retirer
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">Aucun électeur inscrit</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

