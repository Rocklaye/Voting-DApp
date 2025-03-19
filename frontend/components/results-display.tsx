"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useVoting } from "@/context/voting-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Trophy } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function ResultsDisplay() {
  const { votingState, proposals } = useVoting()

  const totalVotes = proposals.reduce((sum, proposal) => sum + proposal.voteCount, 0)

  // Sort proposals by vote count (descending)
  const sortedProposals = [...proposals].sort((a, b) => b.voteCount - a.voteCount)

  const winningProposal =
    votingState.winningProposalId !== null ? proposals.find((p) => p.id === votingState.winningProposalId) : null

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Résultats du vote</CardTitle>
          <CardDescription>
            {votingState.votingEnded
              ? votingState.winningProposalId !== null
                ? "Le vote est terminé et les résultats sont disponibles"
                : "Le vote est terminé mais les résultats n'ont pas encore été comptabilisés"
              : "Le vote n'est pas encore terminé"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!votingState.votingEnded ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Vote en cours</AlertTitle>
              <AlertDescription>
                Le vote n'est pas encore terminé. Les résultats seront disponibles une fois le vote clôturé.
              </AlertDescription>
            </Alert>
          ) : votingState.winningProposalId === null ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Résultats non comptabilisés</AlertTitle>
              <AlertDescription>Les votes n'ont pas encore été comptabilisés par l'administrateur.</AlertDescription>
            </Alert>
          ) : proposals.length === 0 ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Aucune proposition</AlertTitle>
              <AlertDescription>Aucune proposition n'a été soumise pour ce vote.</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-6">
              {winningProposal && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-md flex items-start gap-4">
                  <Trophy className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-medium">Proposition gagnante</h3>
                    <p className="mt-1 font-medium">Proposition #{winningProposal.id + 1}</p>
                    <p className="mt-1">{winningProposal.description}</p>
                    <p className="mt-2 text-sm">
                      <span className="font-medium">{winningProposal.voteCount}</span> vote
                      {winningProposal.voteCount !== 1 ? "s" : ""}
                      {totalVotes > 0 && (
                        <span className="ml-1">({Math.round((winningProposal.voteCount / totalVotes) * 100)}%)</span>
                      )}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Toutes les propositions</h3>
                <ul className="space-y-3">
                  {sortedProposals.map((proposal) => (
                    <li key={proposal.id} className="p-4 bg-muted rounded-md">
                      <div className="flex justify-between items-center">
                        <p className="font-medium">Proposition #{proposal.id + 1}</p>
                        <p className="font-medium">
                          {proposal.voteCount} vote{proposal.voteCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <p className="mt-1">{proposal.description}</p>
                      <div className="mt-2">
                        <Progress
                          value={totalVotes > 0 ? (proposal.voteCount / totalVotes) * 100 : 0}
                          className="h-2"
                        />
                        <p className="text-xs text-right mt-1 text-muted-foreground">
                          {totalVotes > 0 ? Math.round((proposal.voteCount / totalVotes) * 100) : 0}%
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

