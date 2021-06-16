const expect = require("chai").expect;
const ganache = require("ganache-cli");
const Web3 = require("web3");

const web3 = new Web3(ganache.provider());

const compiledFactory = require("../ethereum/build/CampaignFactory.json");
const compiledCampaign = require("../ethereum/build/Campaign.json");

let accounts, factory, campaign, campaignAddress;

beforeEach(async () => {
  // Get list of available accounts
  accounts = await web3.eth.getAccounts();

  // Deploy factory contract from the first account
  factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({ data: compiledFactory.bytecode })
    .send({ from: accounts[0], gas: "1000000" });

  // Create a campaign via factory
  await factory.methods.createCampaign("100").send({
    from: accounts[0],
    gas: "1000000"
  });

  // Get the address of that campaign
  [campaignAddress] = await factory.methods.getDeployedCampaigns().call();

  // Initialize already deployed campaign contract
  campaign = await new web3.eth.Contract(
    JSON.parse(compiledCampaign.interface),
    campaignAddress
  );
});

describe("Campaigns", () => {
  it("deploys a factory and a campaign", () => {
    expect(factory.options.address).to.exist;
    expect(campaign.options.address).to.exist;
  });

  it("marks caller as the campaign manager", async () => {
    const manager = await campaign.methods.manager().call();

    expect(accounts[0]).to.be.equal(manager);
  });

  it("allows people to contribute maney and marks them as approvers", async () => {
    await campaign.methods.contribute().send({
      value: "200",
      from: accounts[1]
    });

    const isContributor = await campaign.methods.approvers(accounts[1]).call();

    expect(isContributor);
  });

  it("requires a minimum contribution", async () => {
    try {
      await campaign.methods.contribute().send({
        from: accounts[1],
        value: "0"
      });
    } catch (err) {
      expect(err).to.exist;
    }
  });

  it("allows a manager to make a payment request", async () => {
    await campaign.methods
      .createRequest("Do something", 100, accounts[1])
      .send({
        from: accounts[0],
        gas: "1000000"
      });

    const request = await campaign.methods.requests(0).call();

    expect(request.description).to.be.equal("Do something");
  });

  it("processes requests", async () => {
    await campaign.methods.contribute().send({
      from: accounts[0],
      value: web3.utils.toWei("10", "ether")
    });

    await campaign.methods
      .createRequest(
        "Do something",
        web3.utils.toWei("5", "ether"),
        accounts[1]
      )
      .send({
        from: accounts[0],
        gas: "1000000"
      });

    await campaign.methods.approveRequest(0).send({
      from: accounts[0],
      gas: "1000000"
    });

    await campaign.methods.finalizeRequest(0).send({
      from: accounts[0],
      gas: "1000000"
    });

    let balance = await web3.eth.getBalance(accounts[1]);
    balance = web3.utils.fromWei(balance, "ether");
    balance = parseFloat(balance);

    expect(balance > 104);
  });
});
