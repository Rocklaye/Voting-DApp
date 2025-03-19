"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useVoting } from "@/context/voting-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function VotingInterface() {
  const { isRegistered, votingState, proposals, vote, hasVoted, canVote } = useVoting()

  const handleVote = (proposalId: number) => {
    if (canVote) {
      vote(proposalId)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Vote</CardTitle>
          <CardDescription>
            {votingState.votingSessionOpen ? "La session de vote est ouverte" : "La session de vote est fermée"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isRegistered ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Non inscrit</AlertTitle>
              <AlertDescription>Vous devez être inscrit sur la liste blanche pour voter.</AlertDescription>
            </Alert>
          ) : !votingState.votingSessionOpen ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Session fermée</AlertTitle>
              <AlertDescription>La session de vote n'est pas active actuellement.</AlertDescription>
            </Alert>
          ) : hasVoted ? (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>Vote enregistré</AlertTitle>
              <AlertDescription>Votre vote a été enregistré. Vous ne pouvez voter qu'une seule fois.</AlertDescription>
            </Alert>
          ) : proposals.length === 0 ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Aucune proposition</AlertTitle>
              <AlertDescription>Il n'y a aucune proposition pour laquelle voter.</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Voter pour une proposition</h3>
              <ul className="space-y-3">
                {proposals.map((proposal) => (
                  <li key={proposal.id} className="p-4 bg-muted rounded-md flex justify-between items-center">
                    <div>
                      <p className="font-medium">Proposition #{proposal.id + 1}</p>
                      <p className="mt-1">{proposal.description}</p>
                    </div>
                    <Button onClick={() => handleVote(proposal.id)} disabled={!canVote}>
                      Voter
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

