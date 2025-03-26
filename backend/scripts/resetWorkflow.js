const hre = require("hardhat");

async function main() {
    const votingContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Adresse du contrat
    const Voting = await hre.ethers.getContractAt("Voting", votingContractAddress);

    // Réinitialisez l'état du workflow
    const tx = await Voting.resetWorkflow();
    await tx.wait();
    console.log("Le workflow a été réinitialisé à l'état initial (Registering Voters).");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});