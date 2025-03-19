"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AdminPanel from "@/components/admin-panel"
import VoterRegistration from "@/components/voter-registration"
import ProposalSubmission from "@/components/proposal-submission"
import VotingInterface from "@/components/voting-interface"
import ResultsDisplay from "@/components/results-display"
import { VotingProvider } from "@/context/voting-context"

export default function VotingDapp() {
  return (
    <VotingProvider>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Système de Vote Décentralisé</h1>

        <Tabs defaultValue="admin" className="w-full max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="admin">Admin</TabsTrigger>
            <TabsTrigger value="register">Inscription</TabsTrigger>
            <TabsTrigger value="proposals">Propositions</TabsTrigger>
            <TabsTrigger value="voting">Vote</TabsTrigger>
            <TabsTrigger value="results">Résultats</TabsTrigger>
          </TabsList>

          <TabsContent value="admin" className="p-4 border rounded-md mt-4">
            <AdminPanel />
          </TabsContent>

          <TabsContent value="register" className="p-4 border rounded-md mt-4">
            <VoterRegistration />
          </TabsContent>

          <TabsContent value="proposals" className="p-4 border rounded-md mt-4">
            <ProposalSubmission />
          </TabsContent>

          <TabsContent value="voting" className="p-4 border rounded-md mt-4">
            <VotingInterface />
          </TabsContent>

          <TabsContent value="results" className="p-4 border rounded-md mt-4">
            <ResultsDisplay />
          </TabsContent>
        </Tabs>
      </div>
    </VotingProvider>
  )
}

