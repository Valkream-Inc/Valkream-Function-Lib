// const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const { getAllFilesInAFolder } = require("./getAllFilesInAFolder");

// Version avec Web Crypto API (Node.js 15+)
const hashFolder = async (folderPath, algorithm = "SHA-256") => {
  try {
    if (!fs.existsSync(folderPath)) {
      throw new Error(`Dossier non trouvé : ${folderPath}`);
    }

    const files = getAllFilesInAFolder(folderPath).sort();
    const encoder = new TextEncoder();

    // Créer un ArrayBuffer pour combiner tous les contenus
    let combinedData = new Uint8Array(0);

    for (const file of files) {
      const relativePath = path.relative(folderPath, file);
      const pathData = encoder.encode(relativePath);
      const fileData = fs.readFileSync(file);

      // Combiner les données
      const newCombinedData = new Uint8Array(
        combinedData.length + pathData.length + fileData.length
      );
      newCombinedData.set(combinedData, 0);
      newCombinedData.set(pathData, combinedData.length);
      newCombinedData.set(fileData, combinedData.length);
      combinedData = newCombinedData;
    }

    // Hash avec Web Crypto API
    const hashBuffer = await crypto.subtle.digest(algorithm, combinedData);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return hashHex;
  } catch (err) {
    throw new Error(
      `Erreur lors du hash du dossier ${folderPath} : ${err.message}`
    );
  }
};

module.exports = { hashFolder };
