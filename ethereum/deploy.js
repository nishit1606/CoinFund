const HDWalletProvider = require("truffle-hdwallet-provider");
const Web3 = require("web3");
const compiledFactory = require("./build/CampaignFactory.json");
const { MNEMONIC, INFURA_RINKEBY } = require("./config");

const provider = new HDWalletProvider(MNEMONIC, INFURA_RINKEBY);
const web3 = new Web3(provider);

// Run deploy as async, arrow IIFE
(async () => {
  const accounts = await web3.eth.getAccounts();

  console.log("From:", accounts[0]);

  const result = await new web3.eth.Contract(
    JSON.parse(compiledFactory.interface)
  )
    .deploy({ data: `0x${compiledFactory.bytecode}` })
    .send({ from: accounts[0] });

  console.log("To:", result.options.address);
})();
