const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting Contract", function () {
  let Voting, voting, owner, addr1, addr2;

  beforeEach(async function () {
    Voting = await ethers.getContractFactory("Voting");
    [owner, addr1, addr2] = await ethers.getSigners();
    voting = await Voting.deploy();
  });

  describe("Deployment", function () {
    it("Should set the owner correctly", async function () {
      expect(await voting.owner()).to.equal(owner.address);
    });

    it("Should have the correct initial status", async function () {
      const status = await voting.status();
      expect(status).to.equal(0); // Le statut initial est RegisteringVoters
    });
  });

  describe("Register Voter", function () {
    it("Should not allow non-owner to register a voter", async function () {
      await expect(
        voting.connect(addr1).registerVoter(addr2.address)
      ).to.be.reverted;
    });

    it("Should allow the owner to register a voter", async function () {
      await expect(
        voting.connect(owner).registerVoter(addr2.address)
      )
        .to.emit(voting, "VoterRegistered")
        .withArgs(addr2.address);
    });
  });

  describe("Proposals", function () {
    it("Should allow registered voters to submit proposals", async function () {
      // Étape 1 : Démarrer l'enregistrement des électeurs
      await voting.startVoterRegistration(); // Passage de l'état à 'RegisteringVoters'

      // Étape 2 : Inscrire un électeur
      await voting.registerVoter(addr1.address); // Enregistre addr1 comme électeur

      // Étape 3 : Terminer l'enregistrement des électeurs
      await voting.endVoterRegistration(); // Passage de l'état à 'ProposalsRegistrationStarted'

      // Étape 4 : Soumettre une proposition
      await voting.connect(addr1).submitProposal("Proposition 1"); // addr1 soumet une proposition

      // Vérifie que la proposition a bien été enregistrée
      const proposal = await voting.proposals(0); // Récupère la première proposition
      expect(proposal.description).to.equal("Proposition 1"); // Vérifie que la description correspond
    });

    it("Should not allow non-registered voters to submit proposals", async function () {
      // Test pour vérifier que seul un électeur inscrit peut soumettre une proposition
      await expect(voting.connect(addr2).submitProposal("Proposition 2")).to.be.revertedWith(
        "Vous n'etes pas inscrit"  // Vérifie que seul un électeur enregistré peut soumettre une proposition
      );
    });
  });

  describe("Voting", function () {
    beforeEach(async function () {
      // Démarrer l'enregistrement des électeurs
      await voting.startVoterRegistration();
  
      // Inscrire les électeurs
      await voting.registerVoter(addr1.address);
      await voting.registerVoter(addr2.address);
  
      // Fin de l'enregistrement des électeurs
      await voting.endVoterRegistration();
  
      // Démarrer l'enregistrement des propositions
      await voting.startProposalsRegistration();
  
      // Soumettre des propositions
      await voting.connect(addr1).submitProposal("Proposition 1");
      await voting.connect(addr2).submitProposal("Proposition 2");
  
      // Fin de l'enregistrement des propositions
      await voting.endProposalsRegistration();
  
      // Démarrer la session de vote
      await voting.startVotingSession();
    });

    it("Should allow registered voters to vote", async function () {
      await voting.connect(addr1).vote(0);  // addr1 vote pour la première proposition
      await voting.connect(addr2).vote(1);  // addr2 vote pour la deuxième proposition

      const proposal1 = await voting.proposals(0);  
      const proposal2 = await voting.proposals(1);

      expect(proposal1.voteCount).to.equal(1);  
      expect(proposal2.voteCount).to.equal(1);  
    });

    it("Should not allow double voting", async function () {
      await voting.connect(addr1).vote(0);  
      await expect(voting.connect(addr1).vote(1)).to.be.revertedWith("Vous avez deja vote");  
    });

    it("Should not allow voting after the session has ended", async function () {
      await voting.endVotingSession();  // La session de vote est terminée
      await expect(voting.connect(addr1).vote(0)).to.be.revertedWith("La session de vote n'est pas ouverte");  
    });
  });

  describe("End Voting", function () {
    beforeEach(async function () {
      // Démarrer l'enregistrement des électeurs et des propositions
      await voting.startVoterRegistration();
      await voting.registerVoter(addr1.address);
      await voting.registerVoter(addr2.address);
      await voting.startProposalsRegistration();
      await voting.connect(addr1).submitProposal("Proposition 1");
      await voting.connect(addr2).submitProposal("Proposition 2");
      await voting.endProposalsRegistration();
      await voting.startVotingSession();
      await voting.connect(addr1).vote(0);
      await voting.connect(addr2).vote(1);
      await voting.endVotingSession();  // Fin de la session de vote
    });

    it("Should allow the owner to tally votes", async function () {
      await voting.tallyVotes();
      const winner = await voting.getWinner();  
      expect(winner).to.equal("Proposition 1");  // Proposition 1 est gagnante
    });

    it("Should not allow non-owner to tally votes", async function () {
      await expect(voting.connect(addr1).tallyVotes()).to.be.revertedWith("Ownable: caller is not the owner");  
    });
  });
});
