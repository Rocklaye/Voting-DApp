const hre = require("hardhat");

async function main() {
    const votingContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Adresse du contrat
    const Voting = await hre.ethers.getContractAt("Voting", votingContractAddress);

    // Appelez la fonction status()
    const status = await Voting.status();
    console.log("État actuel du workflow :", status.toString());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});