"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export type Voter = {
  address: string
  hasVoted: boolean
  hasProposed: boolean
  isRegistered: boolean
}

export type Proposal = {
  id: number
  description: string
  voteCount: number
  proposer: string
}

export type VotingState = {
  registrationOpen: boolean
  proposalSessionOpen: boolean
  votingSessionOpen: boolean
  votingEnded: boolean
  winningProposalId: number | null
}

type VotingContextType = {
  admin: string
  currentUser: string
  setCurrentUser: (address: string) => void
  voters: Record<string, Voter>
  addVoter: (address: string) => void
  removeVoter: (address: string) => void
  proposals: Proposal[]
  addProposal: (description: string) => void
  vote: (proposalId: number) => void
  votingState: VotingState
  startProposalRegistration: () => void
  endProposalRegistration: () => void
  startVotingSession: () => void
  endVotingSession: () => void
  tallyVotes: () => void
  isAdmin: boolean
  isRegistered: boolean
  hasVoted: boolean
  hasProposed: boolean
  canPropose: boolean
  canVote: boolean
}

const VotingContext = createContext<VotingContextType | undefined>(undefined)

export function VotingProvider({ children }: { children: ReactNode }) {
  const [admin] = useState("0xAdminAddress")
  const [currentUser, setCurrentUser] = useState("0xUserAddress")
  const [voters, setVoters] = useState<Record<string, Voter>>({})
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [votingState, setVotingState] = useState<VotingState>({
    registrationOpen: true,
    proposalSessionOpen: false,
    votingSessionOpen: false,
    votingEnded: false,
    winningProposalId: null,
  })

  const isAdmin = currentUser === admin
  const isRegistered = voters[currentUser]?.isRegistered || false
  const hasVoted = voters[currentUser]?.hasVoted || false
  const hasProposed = voters[currentUser]?.hasProposed || false
  const canPropose = isRegistered && votingState.proposalSessionOpen && !hasProposed
  const canVote = isRegistered && votingState.votingSessionOpen && !hasVoted

  const addVoter = (address: string) => {
    if (votingState.registrationOpen) {
      setVoters((prev) => ({
        ...prev,
        [address]: {
          address,
          hasVoted: false,
          hasProposed: false,
          isRegistered: true,
        },
      }))
    }
  }

  const removeVoter = (address: string) => {
    if (votingState.registrationOpen) {
      setVoters((prev) => {
        const newVoters = { ...prev }
        delete newVoters[address]
        return newVoters
      })
    }
  }

  const addProposal = (description: string) => {
    if (votingState.proposalSessionOpen && isRegistered && !hasProposed) {
      const newProposal: Proposal = {
        id: proposals.length,
        description,
        voteCount: 0,
        proposer: currentUser,
      }
      setProposals((prev) => [...prev, newProposal])

      // Mark user as having proposed
      setVoters((prev) => ({
        ...prev,
        [currentUser]: {
          ...prev[currentUser],
          hasProposed: true,
        },
      }))
    }
  }

  const vote = (proposalId: number) => {
    if (votingState.votingSessionOpen && isRegistered && !hasVoted) {
      setProposals((prev) =>
        prev.map((proposal) =>
          proposal.id === proposalId ? { ...proposal, voteCount: proposal.voteCount + 1 } : proposal,
        ),
      )

      // Mark user as having voted
      setVoters((prev) => ({
        ...prev,
        [currentUser]: {
          ...prev[currentUser],
          hasVoted: true,
        },
      }))
    }
  }

  const startProposalRegistration = () => {
    if (isAdmin) {
      setVotingState((prev) => ({
        ...prev,
        registrationOpen: false,
        proposalSessionOpen: true,
      }))
    }
  }

  const endProposalRegistration = () => {
    if (isAdmin) {
      setVotingState((prev) => ({
        ...prev,
        proposalSessionOpen: false,
      }))
    }
  }

  const startVotingSession = () => {
    if (isAdmin) {
      setVotingState((prev) => ({
        ...prev,
        votingSessionOpen: true,
      }))
    }
  }

  const endVotingSession = () => {
    if (isAdmin) {
      setVotingState((prev) => ({
        ...prev,
        votingSessionOpen: false,
        votingEnded: true,
      }))
    }
  }

  const tallyVotes = () => {
    if (isAdmin && votingState.votingEnded) {
      let maxVotes = 0
      let winningId = null

      proposals.forEach((proposal) => {
        if (proposal.voteCount > maxVotes) {
          maxVotes = proposal.voteCount
          winningId = proposal.id
        }
      })

      setVotingState((prev) => ({
        ...prev,
        winningProposalId: winningId,
      }))
    }
  }

  const value = {
    admin,
    currentUser,
    setCurrentUser,
    voters,
    addVoter,
    removeVoter,
    proposals,
    addProposal,
    vote,
    votingState,
    startProposalRegistration,
    endProposalRegistration,
    startVotingSession,
    endVotingSession,
    tallyVotes,
    isAdmin,
    isRegistered,
    hasVoted,
    hasProposed,
    canPropose,
    canVote,
  }

  return <VotingContext.Provider value={value}>{children}</VotingContext.Provider>
}

export function useVoting() {
  const context = useContext(VotingContext)
  if (context === undefined) {
    throw new Error("useVoting must be used within a VotingProvider")
  }
  return context
}

