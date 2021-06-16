const path = require("path");
const solc = require("solc");
const fs = require("fs-extra");

// Find and remove build/ directory
const buildPath = path.resolve(__dirname, "build");
fs.removeSync(buildPath);

// Find and read contracts source code
const campaignPath = path.resolve(__dirname, "contracts", "Campaign.sol");
const source = fs.readFileSync(campaignPath, "utf8");

// Compile and save to variable
const output = solc.compile(source, 1).contracts;

// Create build/ directory again
fs.ensureDirSync(buildPath);

// Get separate contracts out of output and write it to json files
for (let contract in output) {
  fs.outputJsonSync(
    path.resolve(buildPath, `${contract.replace(":", "")}.json`),
    output[contract]
  );
}
