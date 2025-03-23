import { useState, useEffect } from "react";
import type { ethers } from "ethers";
import { Card, Alert, Spinner, ProgressBar } from "react-bootstrap";
import { FaTrophy } from "react-icons/fa";
import type { WorkflowStatus, Proposal } from "../lib/types";

interface ResultsPanelProps {
  contract: ethers.Contract | null;
  workflowStatus: WorkflowStatus;
}

export function ResultsPanel({ contract, workflowStatus }: ResultsPanelProps) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [winningProposalId, setWinningProposalId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchResults = async () => {
      if (!contract) return;

      try {
        setLoading(true);

        // Only fetch results if votes have been tallied
        if (workflowStatus === 5) {
          // Try to get winning proposal ID
          try {
            if (contract.functions.winningProposalID) {
              const winningId = await contract.winningProposalID();
              setWinningProposalId(Number(winningId));
            }
          } catch (error) {
            console.error("Error getting winning proposal ID:", error);
          }

          // Try to get all proposals
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
            
            // If we have proposals but no winning ID, calculate it
            if (proposalsData.length > 0 && winningProposalId === null) {
              let maxVotes = -1;
              let winningId = 0;
              
              proposalsData.forEach((proposal, index) => {
                if (proposal.voteCount > maxVotes) {
                  maxVotes = proposal.voteCount;
                  winningId = index;
                }
              });
              
              setWinningProposalId(winningId);
            }
            
            // Sort proposals by vote count (descending)
            proposalsData.sort((a, b) => b.voteCount - a.voteCount);
            
            setProposals(proposalsData);
          } catch (error) {
            console.error("Error fetching proposals:", error);
            setError("Could not fetch proposals. Please check your contract.");
          }
        }
      } catch (error) {
        console.error("Error in fetchResults:", error);
        setError("An error occurred while fetching results.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [contract, workflowStatus]);

  if (workflowStatus !== 5) {
    return null;
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title>Voting Results</Card.Title>
        <Card.Subtitle className="text-muted">Final results of the voting session</Card.Subtitle>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" />
            <p className="mt-2 text-muted">Loading results...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">
            {error}
          </Alert>
        ) : proposals.length === 0 ? (
          <div className="text-center py-4">
            <p>No proposals were submitted during this voting session.</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-4">
            {winningProposalId !== null && (
              <div className="bg-light p-4 rounded border">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <FaTrophy className="text-warning" />
                  <h5 className="mb-0">Winning Proposal</h5>
                </div>
                <p className="fs-5 fw-bold mb-1">
                  Proposal #{winningProposalId}: {proposals[winningProposalId]?.description || "Unknown"}
                </p>
                <p className="text-muted mb-0">
                  {proposals[winningProposalId]?.voteCount || 0} votes
                </p>
              </div>
            )}

            <div>
              <h5 className="mb-3">All Proposals</h5>
              <div className="d-flex flex-column gap-2">
                {proposals.map((proposal, index) => {
                  const maxVotes = Math.max(...proposals.map(p => p.voteCount));
                  const percentage = maxVotes > 0 ? (proposal.voteCount / maxVotes) * 100 : 0;
                  
                  return (
                    <div
                      key={index}
                      className={`p-3 border rounded ${
                        index === winningProposalId ? "border-warning bg-light" : ""
                      }`}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <span className="fw-bold">Proposal #{index}:</span> {proposal.description}
                        </div>
                        <span className="fw-medium">{proposal.voteCount} votes</span>
                      </div>
                      {proposal.voteCount > 0 && (
                        <div className="mt-2">
                          <ProgressBar now={percentage} variant="primary" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
