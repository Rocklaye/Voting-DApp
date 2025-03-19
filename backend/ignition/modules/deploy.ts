import { ethers } from "hardhat";
import "@nomicfoundation/hardhat-ethers";

async function main() {
    console.log("Début du déploiement...");

    // Obtenir la factory du contrat
    const Voting = await ethers.getContractFactory("Voting");
    console.log("Factory obtenue pour le contrat Voting.");

    // Déployer le contrat
    const voting = await Voting.deploy();
    console.log("Déploiement en cours...");

    // Attendre que le contrat soit déployé
    await voting.waitForDeployment();
    console.log(`Contrat déployé à l'adresse : ${voting.target}`);
}

main().catch((error) => {
    console.error("Erreur dans la fonction principale :", error);
    process.exit(1);
});