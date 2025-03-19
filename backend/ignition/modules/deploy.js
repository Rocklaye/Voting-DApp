import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners(); // Prendre le premier signataire (propriétaire)
    console.log("Déployement du contrat par le signataire:", deployer.address);

    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.deploy(deployer.address); // Passer l'adresse du propriétaire
    console.log("Contrat déployé à l'adresse:", voting.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
