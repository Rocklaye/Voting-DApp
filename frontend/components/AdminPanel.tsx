"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { Button, Form, Card, Alert, Spinner } from "react-bootstrap";
import { FaCheck, FaExclamationTriangle } from "react-icons/fa";
import type { WorkflowStatus } from "../lib/types";

interface AdminPanelProps {
  contract: ethers.Contract | null;
  workflowStatus: WorkflowStatus;
}

export function AdminPanel({ contract, workflowStatus }: AdminPanelProps) {
  const [voterAddress, setVoterAddress] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const resetMessages = () => {
    setError("");
    setSuccess("");
  };

  const handleAddVoter = async () => {
    if (!contract) return;
    
    resetMessages();
    
    if (!ethers.isAddress(voterAddress)) {
      setError("Please enter a valid Ethereum address");
      return;
    }
    
    try {
      setLoading(true);
      const tx = await contract.registerVoter(voterAddress);
      await tx.wait();
      setSuccess(`Voter ${voterAddress} has been added successfully`);
      setVoterAddress("");
    } catch (error: any) {
      console.error("Error adding voter:", error);
      setError(error.message || "Failed to add voter");
    } finally {
      setLoading(false);
    }
  };

  const startProposalsRegistration = async () => {
    if (!contract) return;
    
    resetMessages();
    
    try {
      setLoading(true);
      const tx = await contract.startProposalsRegistration();
      await tx.wait();
      setSuccess("Proposals registration started successfully");
    } catch (error: any) {
      console.error("Error starting proposals registration:", error);
      setError(error.message || "Failed to start proposals registration");
    } finally {
      setLoading(false);
    }
  };

  const endProposalsRegistration = async () => {
    if (!contract) return;
    
    resetMessages();
    
    try {
      setLoading(true);
      const tx = await contract.endProposalsRegistration();
      await tx.wait();
      setSuccess("Proposals registration ended successfully");
    } catch (error: any) {
      console.error("Error ending proposals registration:", error);
      setError(error.message || "Failed to end proposals registration");
    } finally {
      setLoading(false);
    }
  };
  
  const startVotingSession = async () => {
    if (!contract) return;
    
    resetMessages();
    
    try {
      setLoading(true);
      const tx = await contract.startVotingSession();
      await tx.wait();
      setSuccess("Voting session started successfully");
    } catch (error: any) {
      console.error("Error starting voting session:", error);
      setError(error.message || "Failed to start voting session");
    } finally {
      setLoading(false);
    }
  };

  const endVotingSession = async () => {
    if (!contract) return;
    
    resetMessages();
    
    try {
      setLoading(true);
      const tx = await contract.endVotingSession();
      await tx.wait();
      setSuccess("Voting session ended successfully");
    } catch (error: any) {
      console.error("Error ending voting session:", error);
      setError(error.message || "Failed to end voting session");
    } finally {
      setLoading(false);
    }
  };

  const tallyVotes = async () => {
    if (!contract) return;
    
    resetMessages();
    
    try {
      setLoading(true);
      const tx = await contract.tallyVotes();
      await tx.wait();
      setSuccess("Votes tallied successfully");
    } catch (error: any) {
      console.error("Error tallying votes:", error);
      setError(error.message || "Failed to tally votes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Card.Header>
        <Card.Title>Admin Panel</Card.Title>
        <Card.Subtitle className="text-muted">Manage the voting process</Card.Subtitle>
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
        
        {workflowStatus === 0 && (
          <div className="d-flex flex-column gap-3">
            <Form.Group>
              <Form.Label>Add Voter</Form.Label>
              <div className="d-flex gap-2">
                <Form.Control
                  type="text"
                  placeholder="Voter Ethereum Address"
                  value={voterAddress}
                  onChange={(e) => setVoterAddress(e.target.value)}
                />
                <Button 
                  onClick={handleAddVoter} 
                  disabled={loading || !voterAddress}
                >
                  {loading ? <Spinner animation="border" size="sm" /> : "Add"}
                </Button>
              </div>
            </Form.Group>
            
            <Button 
              onClick={startProposalsRegistration} 
              disabled={loading}
              className="w-100"
            >
              Start Proposals Registration
            </Button>
          </div>
        )}
        
        {workflowStatus === 1 && (
          <Button 
            onClick={endProposalsRegistration} 
            disabled={loading}
            className="w-100"
          >
            End Proposals Registration
          </Button>
        )}
        
        {workflowStatus === 2 && (
          <Button 
            onClick={startVotingSession} 
            disabled={loading}
            className="w-100"
          >
            Start Voting Session
          </Button>
        )}
        
        {workflowStatus === 3 && (
          <Button 
            onClick={endVotingSession} 
            disabled={loading}
            className="w-100"
          >
            End Voting Session
          </Button>
        )}
        
        {workflowStatus === 4 && (
          <Button 
            onClick={tallyVotes} 
            disabled={loading}
            className="w-100"
          >
            Tally Votes
          </Button>
        )}
      </Card.Body>
    </Card>
  );
}