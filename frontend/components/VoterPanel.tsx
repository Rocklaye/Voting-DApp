"use client";

import { useState, useEffect } from "react";
import type { ethers } from "ethers";
import { Button, Form, Card, Alert, Spinner, Badge } from "react-bootstrap";
import { FaCheck, FaExclamationTriangle } from "react-icons/fa";
import type { WorkflowStatus, Proposal, Voter } from "../lib/types";

interface VoterPanelProps {
  contract: ethers.Contract | null;
  workflowStatus: WorkflowStatus;
  account: string;
}

export function VoterPanel({ contract, workflowStatus, account }: VoterPanelProps) {
  const [proposalDescription, setProposalDescription] = useState<string>("");
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<number | null>(null);
  const [voterInfo, setVoterInfo] = useState<Voter | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const resetMessages = () => {
    setError("");
    setSuccess("");
  };

  // Fetch voter info and proposals
  useEffect(() => {
    const fetchData = async () => {
      if (!contract || !account) return;

      try {
        // Initialize default voter info
        let voter: Voter = {
          isRegistered: true, // We assume the user is registered since they can see this panel
          hasVoted: false,
          votedProposalId: 0
        };

        // Try to get voter info from contract if the function exists
        try {
          if (contract.functions.getVoter) {
            const voterData = await contract.getVoter(account);
            voter = {
              isRegistered: voterData.isRegistered,
              hasVoted: voterData.hasVoted,
              votedProposalId: Number(voterData.votedProposalId)
            };
          } else if (contract.functions.voters) {
            const voterData = await contract.voters(account);
            voter = {
              isRegistered: voterData.isRegistered,
              hasVoted: voterData.hasVoted,
              votedProposalId: Number(voterData.votedProposalId)
            };
          }
        } catch (error) {
          console.error("Error fetching voter data:", error);
          // Continue with default voter info
        }

        setVoterInfo(voter);

        // Get proposals if in appropriate workflow status
        if (workflowStatus >= 1) {
          try {
            let proposalsData: Proposal[] = [];
            
            // Try different ways to get proposals
            if (contract.functions.proposalsArray) {
              const proposalsArray = await contract.proposalsArray();
              proposalsData = proposalsArray.map((proposal: any, index: number) => ({
                description: proposal.description,
                voteCount: Number(proposal.voteCount)
              }));
            } else if (contract.functions.getProposals) {
              const proposalsArray = await contract.getProposals();
              proposalsData = proposalsArray.map((proposal: any, index: number) => ({
                description: proposal.description,
                voteCount: Number(proposal.voteCount)
              }));
            } else {
              // Try to get proposals one by one if there's a getOneProposal function
              if (contract.functions.getOneProposal) {
                let index = 0;
                const tempProposals: Proposal[] = [];
                
                // Try to get proposals until we hit an error
                while (true) {
                  try {
                    const proposal = await contract.getOneProposal(index);
                    tempProposals.push({
                      description: proposal.description,
                      voteCount: Number(proposal.voteCount)
                    });
                    index++;
                  } catch (error) {
                    // We've reached the end of the proposals
                    break;
                  }
                }
                
                proposalsData = tempProposals;
              }
            }
            
            setProposals(proposalsData);
          } catch (error) {
            console.error("Error fetching proposals:", error);
          }
        }
      } catch (error) {
        console.error("Error in fetchData:", error);
      }
    };

    fetchData();
  }, [contract, account, workflowStatus]);

  const handleAddProposal = async () => {
    if (!contract) return;
  
    resetMessages();
  
    if (!proposalDescription.trim()) {
      setError("Please enter a proposal description");
      return;
    }
  
    try {
      setLoading(true);
      const tx = await contract.submitProposal(proposalDescription);
      await tx.wait();
      setSuccess("Proposal added successfully");
      setProposalDescription("");
  
      // Refresh proposals
      // ...
    } catch (error: any) {
      console.error("Error adding proposal:", error);
      setError(error.message || "Failed to add proposal");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!contract || selectedProposal === null) return;

    resetMessages();

    try {
      setLoading(true);
      const tx = await contract.vote(selectedProposal);
      await tx.wait();
      setSuccess(`Vote cast for proposal #${selectedProposal} successfully`);

      // Update voter info
      setVoterInfo(prev => {
        if (!prev) return null;
        return {
          ...prev,
          hasVoted: true,
          votedProposalId: selectedProposal
        };
      });
    } catch (error: any) {
      console.error("Error voting:", error);
      setError(error.message || "Failed to cast vote");
    } finally {
      setLoading(false);
    }
  };

  // Since we're assuming the user is registered if they can see this panel
  if (!voterInfo) {
    return (
      <Card>
        <Card.Header>
          <Card.Title>Voter Panel</Card.Title>
          <Card.Subtitle className="text-muted">Loading voter information...</Card.Subtitle>
        </Card.Header>
        <Card.Body className="text-center">
          <Spinner animation="border" />
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title>Voter Panel</Card.Title>
        <Card.Subtitle className="text-muted">
          {workflowStatus === 1
            ? "Submit your proposal"
            : workflowStatus === 3
              ? "Vote for your favorite proposal"
              : "View proposals"}
        </Card.Subtitle>
      </Card.Header>
      <Card.Body className="d-flex flex-column gap-3">
        {error && (
          <Alert variant="danger" className="d-flex align-items-center gap-2">
            <FaExclamationTriangle />
            <span>{error}</span>
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="d-flex align-items-center gap-2">
            <FaCheck />
            <span>{success}</span>
          </Alert>
        )}

        {/* Proposal Submission Form */}
        {workflowStatus === 1 && (
          <Form.Group>
            <Form.Label>Add Proposal</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control
                type="text"
                placeholder="Proposal Description"
                value={proposalDescription}
                onChange={(e) => setProposalDescription(e.target.value)}
              />
              <Button 
                onClick={handleAddProposal} 
                disabled={loading || !proposalDescription.trim()}
              >
                {loading ? <Spinner animation="border" size="sm" /> : "Submit"}
              </Button>
            </div>
          </Form.Group>
        )}

        {/* Proposals List */}
        {workflowStatus >= 1 && proposals.length > 0 && (
          <div className="d-flex flex-column gap-2">
            <h5>Proposals</h5>
            <div className="d-flex flex-column gap-2">
              {proposals.map((proposal, index) => (
                <div
                  key={index}
                  className={`p-3 border rounded ${
                    workflowStatus === 3 && !voterInfo.hasVoted ? "cursor-pointer" : ""
                  } ${
                    selectedProposal === index ? "border-primary bg-light" : ""
                  }`}
                  onClick={() => {
                    if (workflowStatus === 3 && !voterInfo.hasVoted) {
                      setSelectedProposal(index);
                    }
                  }}
                  style={{ cursor: workflowStatus === 3 && !voterInfo.hasVoted ? "pointer" : "default" }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <span className="fw-bold">Proposal #{index}:</span> {proposal.description}
                      {workflowStatus >= 5 && (
                        <span className="ms-2 text-muted">({proposal.voteCount} votes)</span>
                      )}
                    </div>
                    {voterInfo.hasVoted && voterInfo.votedProposalId === index && (
                      <Badge bg="primary" className="px-2 py-1">Your Vote</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Proposals Message */}
        {workflowStatus >= 1 && proposals.length === 0 && (
          <Alert variant="info">
            No proposals have been submitted yet.
            {workflowStatus === 1 && " Be the first to submit a proposal!"}
          </Alert>
        )}

        {/* Voting Button */}
        {workflowStatus === 3 && !voterInfo.hasVoted && (
          <Button 
            onClick={handleVote} 
            disabled={loading || selectedProposal === null} 
            className="w-100"
          >
            {loading ? <><Spinner animation="border" size="sm" /> Voting...</> : "Vote for Selected Proposal"}
          </Button>
        )}

        {/* Already Voted Message */}
        {workflowStatus === 3 && voterInfo.hasVoted && (
          <Alert variant="info" className="d-flex align-items-center gap-2">
            <FaCheck />
            <span>You have already voted for Proposal #{voterInfo.votedProposalId}</span>
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
}