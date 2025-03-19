"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useVoting } from "@/context/voting-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function VoterRegistration() {
  const { currentUser, setCurrentUser, voters, votingState } = useVoting()
  const [tempAddress, setTempAddress] = useState("")

  const isRegistered = voters[currentUser]?.isRegistered || false

  const handleConnect = () => {
    if (tempAddress.trim()) {
      setCurrentUser(tempAddress.trim())
      setTempAddress("")
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Inscription des électeurs</CardTitle>
          <CardDescription>
            {votingState.registrationOpen
              ? "La phase d'inscription des électeurs est ouverte"
              : "La phase d'inscription des électeurs est fermée"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Votre adresse</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Entrez votre adresse"
                  value={tempAddress}
                  onChange={(e) => setTempAddress(e.target.value)}
                />
                <Button onClick={handleConnect}>Connecter</Button>
              </div>
            </div>

            <div className="p-2 bg-muted rounded-md">
              <p className="font-medium">Adresse actuelle:</p>
              <p className="font-mono text-sm break-all">{currentUser}</p>
            </div>

            {isRegistered ? (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle>Inscription confirmée</AlertTitle>
                <AlertDescription>Vous êtes inscrit sur la liste blanche des électeurs.</AlertDescription>
              </Alert>
            ) : (
              <Alert variant={votingState.registrationOpen ? "default" : "destructive"}>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{votingState.registrationOpen ? "Non inscrit" : "Inscription fermée"}</AlertTitle>
                <AlertDescription>
                  {votingState.registrationOpen
                    ? "Vous n'êtes pas inscrit sur la liste blanche. Contactez l'administrateur pour vous inscrire."
                    : "La phase d'inscription est terminée. Il n'est plus possible de s'inscrire."}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

